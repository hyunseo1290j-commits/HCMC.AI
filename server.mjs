import {selectRate,supplierCost} from './pricing.mjs';
import http from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHmac, randomBytes, timingSafeEqual, createHash, scrypt as scryptCallback} from 'node:crypto';
import {promisify} from 'node:util';
import {dirname, extname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||4173);
const ORIGIN=process.env.HCMC_ORIGIN||`http://127.0.0.1:${PORT}`;
const GOOGLE_CLIENT_ID=process.env.HCMC_GOOGLE_CLIENT_ID||'';
const GOOGLE_CLIENT_SECRET=process.env.HCMC_GOOGLE_CLIENT_SECRET||'';
const OPENROUTER_API_KEY=process.env.HCMC_OPENROUTER_API_KEY||'';
const PAYMENT_PROVIDER=process.env.HCMC_PAYMENT_PROVIDER||'';
const PROMO_PLAN=process.env.HCMC_PROMO_PLAN||'';
const PROMO_ENDS_AT=process.env.HCMC_PROMO_ENDS_AT||'';
const SESSION_SECRET=process.env.HCMC_SESSION_SECRET||randomBytes(32).toString('hex');
const IS_PRODUCTION=process.env.NODE_ENV==='production';
const sessions=new Map();
const rateLimits=new Map();
const scrypt=promisify(scryptCallback);
const DATA_DIR=join(ROOT,'.hcmc-data');
const USERS_FILE=join(DATA_DIR,'users.json');
let modelCache={expires:0,data:[],live:false,fetchedAt:null};let pendingCatalog=null;

const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
const STATIC_FILES=new Set(['/','/index.html','/styles.css','/polish.css','/app.js','/pricing.mjs','/model-catalog.json','/hcmc-night.png','/liquid-amber.png','/concrete-light.png','/fashion-cobalt.png','/citrus-chrome.png','/dreamline-city.png','/alpine-window.png','/vertical-velocity.png','/logo-orbit.png','/machine-pulse.png','/infinite-desk.png','/opening-signal.png','/assets/providers/google.svg','/assets/providers/openai.svg','/assets/providers/alibaba.svg','/assets/providers/bytedance.svg']);

function securityHeaders(extra={}){return {
  'Content-Security-Policy':"default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'",
  'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Resource-Policy':'same-origin','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()','Cache-Control':'no-store',...extra
}}
function send(res,status,body,headers={}){res.writeHead(status,securityHeaders(headers));res.end(body)}
function sendJson(res,status,value){send(res,status,JSON.stringify(value),{'Content-Type':MIME['.json']})}
function redirect(res,location){send(res,302,'',{'Location':location})}
function parseCookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(part=>part.trim().split('=').map(decodeURIComponent)).filter(parts=>parts.length===2))}
function signature(value){return createHmac('sha256',SESSION_SECRET).update(value).digest('base64url')}
function sign(value){return `${value}.${signature(value)}`}
function verify(signed){if(!signed)return null;const index=signed.lastIndexOf('.');if(index<1)return null;const value=signed.slice(0,index),received=signed.slice(index+1),expected=signature(value);if(received.length!==expected.length)return null;return timingSafeEqual(Buffer.from(received),Buffer.from(expected))?value:null}
function cookie(name,value,maxAge){return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${IS_PRODUCTION?'; Secure':''}`}
function clientIp(req){return req.socket.remoteAddress||'unknown'}
function withinRateLimit(req){const key=clientIp(req),now=Date.now(),entry=rateLimits.get(key)||{start:now,count:0};if(now-entry.start>60000){entry.start=now;entry.count=0}entry.count++;rateLimits.set(key,entry);return entry.count<=180}
function sameOrigin(req){const origin=req.headers.origin;return !origin||origin===ORIGIN}
async function readJson(req,limit=25000){
  if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))throw Object.assign(new Error('JSON required'),{status:415,code:'invalid_content_type'});
  let size=0,raw='';for await(const chunk of req){size+=chunk.length;if(size>limit)throw Object.assign(new Error('Request too large'),{status:413,code:'request_too_large'});raw+=chunk}
  try{return JSON.parse(raw||'{}')}catch{throw Object.assign(new Error('Invalid JSON'),{status:400,code:'invalid_json'})}
}

async function getModels(){
  if(modelCache.expires>Date.now()&&modelCache.data.length)return modelCache.data;
  if(pendingCatalog)return pendingCatalog;
  pendingCatalog=(async()=>{try{const response=await fetch('https://openrouter.ai/api/v1/videos/models',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Catalog unavailable');const body=await response.json();if(!Array.isArray(body.data)||!body.data.length)throw Error('Invalid catalog');modelCache={expires:Date.now()+300000,data:body.data,live:true,fetchedAt:new Date().toISOString()};await mkdir(DATA_DIR,{recursive:true});await writeFile(join(DATA_DIR,'catalog-cache.json'),JSON.stringify(modelCache)).catch(()=>{});return modelCache.data;}catch{
    if(!modelCache.data.length){let saved;try{saved=JSON.parse(await readFile(join(DATA_DIR,'catalog-cache.json'),'utf8'))}catch{saved=JSON.parse(await readFile(join(ROOT,'model-catalog.json'),'utf8'))}if(!Array.isArray(saved.data)||!saved.data.length)throw Error('No saved catalog');modelCache={...saved,expires:0}}
    modelCache.live=false;modelCache.expires=Date.now()+30000;return modelCache.data;
  }})().finally(()=>{pendingCatalog=null});return pendingCatalog;
}
async function quote(url,res){
  const models=await getModels(),model=models.find(item=>item.id===url.searchParams.get('model'));if(!model)return sendJson(res,404,{error:'Unknown model'});
  const resolution=url.searchParams.get('resolution'),aspect=url.searchParams.get('aspect'),duration=Number(url.searchParams.get('duration')),outputs=Number(url.searchParams.get('outputs')||1);
  if(!Number.isInteger(outputs)||outputs<1||outputs>5)return sendJson(res,400,{error:'Outputs must be between 1 and 5'});
  if(!model.supported_resolutions?.includes(resolution)||!model.supported_aspect_ratios?.includes(aspect)||!model.supported_durations?.includes(duration))return sendJson(res,400,{error:'Unsupported model configuration'});
  const pricing=selectRate(model,resolution,aspect,url.searchParams.get('mode')||'text');if(!pricing.exact)return sendJson(res,422,{error:'Provider-specific quote required'});const supplierUsd=supplierCost(pricing,duration,outputs),bufferedVnd=supplierUsd*26300*1.09,retailVnd=bufferedVnd/.75,tokens=Math.max(5,Math.ceil(retailVnd/500/5)*5);
  sendJson(res,200,{model:model.id,resolution,aspect,duration,outputs,supplierUsd:Number(supplierUsd.toFixed(4)),tokens,retailVnd:tokens*500,exact:pricing.exact,pricingSku:pricing.sku,finalSettlement:'usage.cost'});
}
function currentUser(req){const id=verify(parseCookies(req).hcmc_session);if(!id)return null;const session=sessions.get(id);if(!session||session.expires<Date.now()){if(id)sessions.delete(id);return null}return session.user}
async function readUsers(){try{const users=JSON.parse(await readFile(USERS_FILE,'utf8'));return Array.isArray(users)?users:[]}catch(error){if(error.code==='ENOENT')return [];throw error}}
async function saveUsers(users){await mkdir(DATA_DIR,{recursive:true});await writeFile(USERS_FILE,JSON.stringify(users,null,2),{encoding:'utf8',mode:0o600})}
function normalizedEmail(value){const email=String(value||'').trim().toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:''}
async function passwordHash(password,salt=randomBytes(16).toString('hex')){const derived=await scrypt(String(password),salt,64);return {salt,hash:Buffer.from(derived).toString('hex')}}
function beginSession(res,user){const sessionId=randomBytes(32).toString('base64url'),safeUser={id:user.id,email:user.email,name:user.name||user.email.split('@')[0],picture:user.picture||null};sessions.set(sessionId,{expires:Date.now()+86400000,user:safeUser});res.writeHead(200,securityHeaders({'Content-Type':MIME['.json'],'Set-Cookie':cookie('hcmc_session',sign(sessionId),86400)}));res.end(JSON.stringify({user:safeUser}))}
async function emailAuth(req,res,mode){
  if(!sameOrigin(req))return sendJson(res,403,{code:'origin_rejected',message:'Request origin was rejected.'});const body=await readJson(req),email=normalizedEmail(body.email),password=String(body.password||'');if(!email||(mode==='register'?password.length<8:!password.length)||password.length>128)return sendJson(res,400,{code:'invalid_credentials',message:'Use a valid email and a password between 8 and 128 characters.'});
  const users=await readUsers(),existing=users.find(user=>user.email===email);if(mode==='register'){if(existing)return sendJson(res,409,{code:'account_exists',message:'An account already exists for this email.'});const secure=await passwordHash(password),user={id:randomBytes(16).toString('hex'),email,name:email.split('@')[0],passwordHash:secure.hash,passwordSalt:secure.salt,verified:false,createdAt:Date.now()};users.push(user);await saveUsers(users);return beginSession(res,user)}
  if(!existing)return sendJson(res,401,{code:'invalid_credentials',message:'Email or password is incorrect.'});const secure=await passwordHash(password,existing.passwordSalt),received=Buffer.from(secure.hash,'hex'),expected=Buffer.from(existing.passwordHash,'hex');if(received.length!==expected.length||!timingSafeEqual(received,expected))return sendJson(res,401,{code:'invalid_credentials',message:'Email or password is incorrect.'});return beginSession(res,existing)
}
async function requestPasswordReset(req,res){if(!sameOrigin(req))return sendJson(res,403,{code:'origin_rejected',message:'Request origin was rejected.'});const body=await readJson(req);normalizedEmail(body.email);return sendJson(res,202,{ok:true,message:'If that account exists, reset instructions will be sent after the private email service is connected.'})}
async function validatedQuote(input){
  const models=await getModels(),model=models.find(item=>item.id===input.model);if(!model)throw Object.assign(new Error('Unknown model'),{status:404,code:'unknown_model'});
  const duration=Number(input.duration),resolution=String(input.resolution||''),aspect=String(input.aspect||''),outputs=Number(input.outputs||1);
  if(!Number.isInteger(outputs)||outputs<1||outputs>5)throw Object.assign(new Error('Outputs must be between 1 and 5'),{status:400,code:'invalid_outputs'});
  if(!model.supported_resolutions?.includes(resolution)||!model.supported_aspect_ratios?.includes(aspect)||!model.supported_durations?.includes(duration))throw Object.assign(new Error('Unsupported model configuration'),{status:400,code:'unsupported_configuration'});
  const pricing=selectRate(model,resolution,aspect,input.mode||'text');if(!pricing.exact)throw Object.assign(new Error('Provider-specific quote required'),{status:422});const supplierUsd=supplierCost(pricing,duration,outputs),bufferedVnd=supplierUsd*26300*1.09,tokens=Math.max(5,Math.ceil((bufferedVnd/.75)/500/5)*5);
  return {model:model.id,resolution,aspect,duration,outputs,tokens,supplierUsd:Number(supplierUsd.toFixed(4)),exact:pricing.exact};
}
async function createGeneration(req,res){
  if(!sameOrigin(req))return sendJson(res,403,{code:'origin_rejected',message:'Request origin was rejected.'});
  const user=currentUser(req);if(!user)return sendJson(res,401,{code:'sign_in_required',message:'Sign in before starting a protected render.'});
  if(!OPENROUTER_API_KEY)return sendJson(res,503,{code:'provider_not_connected',message:'The private generation provider is not connected yet.'});
  const body=await readJson(req);const prompt=String(body.prompt||'').trim();if(prompt.length<8||prompt.length>1200)return sendJson(res,400,{code:'invalid_prompt',message:'Prompt must be between 8 and 1,200 characters.'});
  const estimate=await validatedQuote(body);return sendJson(res,402,{code:'insufficient_tokens',message:'Add tokens before this render can be reserved.',requiredTokens:estimate.tokens,balance:0});
}
async function createCheckout(req,res){
  if(!sameOrigin(req))return sendJson(res,403,{code:'origin_rejected',message:'Request origin was rejected.'});
  const user=currentUser(req);if(!user)return sendJson(res,401,{code:'sign_in_required',message:'Sign in before opening secure checkout.'});
  const body=await readJson(req);const offers=new Set(['plan:Starter','plan:Creator','plan:Studio','pack:50','pack:150','pack:2000']);if(!offers.has(String(body.offer||'')))return sendJson(res,400,{code:'invalid_offer',message:'That offer is not available.'});
  if(!PAYMENT_PROVIDER)return sendJson(res,503,{code:'billing_not_connected',message:'Checkout is protected but no payment provider is connected yet.'});
  return sendJson(res,503,{code:'billing_not_connected',message:'Payment adapter setup is incomplete. No charge was made.'});
}

async function beginGoogle(req,res){
  if(!GOOGLE_CLIENT_ID||!GOOGLE_CLIENT_SECRET)return redirect(res,'/?auth=unconfigured');
  const state=randomBytes(24).toString('base64url'),verifier=randomBytes(48).toString('base64url'),challenge=createHash('sha256').update(verifier).digest('base64url');
  const params=new URLSearchParams({client_id:GOOGLE_CLIENT_ID,redirect_uri:`${ORIGIN}/auth/google/callback`,response_type:'code',scope:'openid email profile',state,code_challenge:challenge,code_challenge_method:'S256',prompt:'select_account'});
  res.writeHead(302,securityHeaders({'Location':`https://accounts.google.com/o/oauth2/v2/auth?${params}`,'Set-Cookie':[cookie('hcmc_oauth_state',sign(state),600),cookie('hcmc_oauth_verifier',sign(verifier),600)]}));res.end();
}
async function finishGoogle(req,res,url){
  const cookies=parseCookies(req),expectedState=verify(cookies.hcmc_oauth_state),verifier=verify(cookies.hcmc_oauth_verifier),state=url.searchParams.get('state'),code=url.searchParams.get('code');
  if(!expectedState||!verifier||!state||!code||state!==expectedState)return redirect(res,'/?auth=failed');
  const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:GOOGLE_CLIENT_ID,client_secret:GOOGLE_CLIENT_SECRET,code,code_verifier:verifier,grant_type:'authorization_code',redirect_uri:`${ORIGIN}/auth/google/callback`})});
  if(!tokenResponse.ok)return redirect(res,'/?auth=failed');const tokens=await tokenResponse.json();
  const userResponse=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${tokens.access_token}`}});if(!userResponse.ok)return redirect(res,'/?auth=failed');
  const profile=await userResponse.json();if(!profile.sub||!profile.email)return redirect(res,'/?auth=failed');
  const sessionId=randomBytes(32).toString('base64url');sessions.set(sessionId,{expires:Date.now()+86400000,user:{id:profile.sub,email:profile.email,name:profile.name||profile.email,picture:profile.picture||null}});
  res.writeHead(302,securityHeaders({'Location':'/','Set-Cookie':[cookie('hcmc_session',sign(sessionId),86400),cookie('hcmc_oauth_state','',0),cookie('hcmc_oauth_verifier','',0)]}));res.end();
}

async function serveStatic(res,pathname){
  if(!STATIC_FILES.has(pathname))return send(res,404,'Not found',{'Content-Type':'text/plain; charset=utf-8'});
  const relative=pathname==='/'?'index.html':pathname.slice(1),safe=normalize(relative);if(safe.includes('..'))return send(res,400,'Bad request');
  const file=await readFile(join(ROOT,safe));send(res,200,file,{'Content-Type':MIME[extname(safe)]||'application/octet-stream','Cache-Control':safe.endsWith('.png')?'public, max-age=86400':'no-store'});
}

const server=http.createServer(async(req,res)=>{
  try{
    if(!withinRateLimit(req))return sendJson(res,429,{error:'Too many requests'});
    const url=new URL(req.url,ORIGIN),path=url.pathname;
    if(req.method==='GET'&&path==='/api/health')return sendJson(res,200,{ok:true,oauthConfigured:Boolean(GOOGLE_CLIENT_ID&&GOOGLE_CLIENT_SECRET),catalogCached:modelCache.data.length});
    if(req.method==='GET'&&path==='/api/promotion'){const prices={Starter:199000,Creator:499000,Studio:1999000},endsAt=Date.parse(PROMO_ENDS_AT),configured=Boolean(prices[PROMO_PLAN]&&Number.isFinite(endsAt));return sendJson(res,200,{configured,active:configured&&endsAt>Date.now(),plan:configured?PROMO_PLAN:null,discountPercent:30,endsAt:configured?new Date(endsAt).toISOString():null,standardPrice:configured?prices[PROMO_PLAN]:null,promotionalPrice:configured?Math.round(prices[PROMO_PLAN]*.7):null,period:'first month',checkoutAvailable:false})}
    if(req.method==='GET'&&path==='/api/runtime')return sendJson(res,200,{local:true,catalogConnected:Boolean(modelCache.data.length),oauthConfigured:Boolean(GOOGLE_CLIENT_ID&&GOOGLE_CLIENT_SECRET),generationConfigured:Boolean(OPENROUTER_API_KEY),billingConfigured:Boolean(PAYMENT_PROVIDER)});
    if(req.method==='GET'&&path==='/api/models'){const data=await getModels();return sendJson(res,200,{data,live:modelCache.live,fetchedAt:modelCache.fetchedAt,source:'https://openrouter.ai/api/v1/videos/models'})}
    if(req.method==='GET'&&path==='/api/quote')return await quote(url,res);
    if(req.method==='GET'&&path==='/api/session')return sendJson(res,200,{user:currentUser(req)});
    if(req.method==='GET'&&path==='/auth/google')return await beginGoogle(req,res);
    if(req.method==='GET'&&path==='/auth/google/callback')return await finishGoogle(req,res,url);
    if(req.method==='POST'&&path==='/auth/email/register')return await emailAuth(req,res,'register');
    if(req.method==='POST'&&path==='/auth/email/login')return await emailAuth(req,res,'login');
    if(req.method==='POST'&&path==='/auth/password-reset')return await requestPasswordReset(req,res);
    if(req.method==='POST'&&path==='/auth/logout'){res.writeHead(204,securityHeaders({'Set-Cookie':cookie('hcmc_session','',0)}));return res.end()}
    if(req.method==='POST'&&path==='/api/generate')return await createGeneration(req,res);
    if(req.method==='POST'&&path==='/api/billing/checkout')return await createCheckout(req,res);
    if(req.method!=='GET'&&req.method!=='HEAD')return sendJson(res,405,{error:'Method not allowed'});
    return await serveStatic(res,path);
  }catch(error){console.error(error);sendJson(res,error.status||500,{code:error.code||'request_failed',message:error.status?error.message:'Request failed safely'})}
});

server.listen(PORT,'127.0.0.1',()=>console.log(`hcmc.ai local server ready at ${ORIGIN}${GOOGLE_CLIENT_ID?' with Google OAuth':' (OAuth not configured)'}`));
