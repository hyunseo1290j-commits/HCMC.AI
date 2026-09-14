import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectRate,supplierCost} from '../pricing.mjs';
const {data}=JSON.parse(readFileSync(new URL('../model-catalog.json',import.meta.url),'utf8'));
const model=id=>data.find(item=>item.id===id);
test('verified catalog includes all 29 snapshot models and Seedance Mini',()=>{
  assert.equal(data.length,29);assert.ok(model('bytedance/seedance-2.0-mini'));
});
test('Seedance Mini converts documented video tokens using actual frame size',()=>{
  const wide=selectRate(model('bytedance/seedance-2.0-mini'),'720p','16:9');
  const square=selectRate(model('bytedance/seedance-2.0-mini'),'720p','1:1');
  assert.equal(wide.exact,true);assert.ok(Math.abs(wide.rate-.0756)<1e-9);
  assert.ok(Math.abs(square.rate-.042525)<1e-9);
  assert.ok(Math.abs(supplierCost(wide,8,5)-3.024)<1e-9);
});
test('Seedance Fast matches the official 720p per-second equivalent',()=>{
  assert.ok(Math.abs(selectRate(model('bytedance/seedance-2.0-fast'),'720p','16:9').rate-.09072)<1e-9);
});
test('separately priced audio takes precedence over silent Kling SKUs',()=>{
  assert.equal(selectRate(model('kwaivgi/kling-v3.0-std'),'720p').rate,.126);
  assert.equal(selectRate(model('kwaivgi/kling-v3.0-pro'),'720p').rate,.168);
});
test('image input uses the image-generation SKU and input fees',()=>{
  assert.equal(selectRate(model('alibaba/wan-2.6'),'720p','16:9','text').rate,.08);
  assert.equal(selectRate(model('alibaba/wan-2.6'),'720p','16:9','image').rate,.10);
  const grok=selectRate(model('x-ai/grok-imagine-video'),'720p','16:9','image');
  assert.equal(grok.inputCost,.002);assert.ok(Math.abs(supplierCost(grok,5,2)-.704)<1e-9);
});
test('unsupported dimensions and unverified conversions never invent a rate',()=>{
  assert.equal(selectRate(model('bytedance/seedance-2.0-mini'),'1080p').exact,false);
  assert.equal(selectRate(model('bytedance/seedance-2.5'),'720p').exact,false);
  assert.equal(selectRate({supported_resolutions:['720p'],pricing_skus:{}},'720p').exact,false);
});
