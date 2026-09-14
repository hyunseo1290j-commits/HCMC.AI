// Public pricing arithmetic shared by the browser and protected quote endpoint.
// Source: https://openrouter.ai/api/v1/videos/models (snapshot date is in model-catalog.json).
// Seedance Mini/Fast token formula: each model's official OpenRouter model page.
const TOKEN_FORMULA_MODELS=new Set(['bytedance/seedance-2.0-mini','bytedance/seedance-2.0-fast']);
export function selectRate(model,resolution,aspect='16:9',mode='text'){
  const sku=model.pricing_skus||{},res=String(resolution||'').toLowerCase();
  const unknown={rate:0,exact:false,sku:'Provider quote required',basis:'Provider-specific pricing',inputCost:0};
  if(!model.supported_resolutions?.includes(resolution))return unknown;
  if(sku.video_tokens){
    if(!TOKEN_FORMULA_MODELS.has(model.id))return {...unknown,basis:'Video-token billing · see provider pricing'};
    const [aw,ah]=aspect.split(':').map(Number),shortSide=Number.parseInt(res);
    const size=(model.supported_sizes||[]).map(item=>String(item).split('x').map(Number)).find(([w,h])=>Math.min(w,h)===shortSide&&Math.abs(w/h-aw/ah)<.01);
    if(!size)return unknown;
    return {rate:size[0]*size[1]*24/1024*Number(sku.video_tokens),exact:true,sku:'video_tokens',basis:size.join('×')+' · 24 fps · video-token rate',inputCost:0};
  }
  const prefix=mode==='image'?'image_to_video':'text_to_video';
  const keys=[`duration_seconds_with_audio_${res}`,'duration_seconds_with_audio',`${prefix}_duration_seconds_${res}`,`duration_seconds_${res}`,`cents_per_video_output_second_${res}`,`cents_per_second_output_${res}`,'duration_seconds','cents_per_video_output_second','cents_per_second_output'];
  for(const key of keys){const value=Number(sku[key]);if(Number.isFinite(value)&&value>0){
    const inputCost=mode==='image'?(Number(sku.cents_per_image_input||0)/100+Number(sku.reference_images||0)):0;
    return {rate:key.startsWith('cents_')?value/100:value,exact:true,sku:key,basis:(model.generate_audio?'With audio where priced separately':'Provider output rate')+(inputCost?' · one image input':''),inputCost};
  }}
  return unknown;
}
export function supplierCost(pricing,seconds,outputs=1){return (pricing.rate*seconds+pricing.inputCost)*outputs}
