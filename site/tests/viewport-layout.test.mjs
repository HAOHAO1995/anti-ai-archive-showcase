import test from 'node:test';
import assert from 'node:assert/strict';
import {viewportLayout} from '../lib/viewport-layout.mjs';
test('ordinary phones, outer screens, split view and unsupported browsers keep fluid layout',()=>{
 for(const width of [320,375,430,600,720,840,1024,1440]){
  assert.equal(viewportLayout(undefined,width,900).mode,'continuous');
  assert.equal(viewportLayout([{x:0,y:0,width,height:900}],width,900).mode,'continuous');
 }
});
test('book panes use unequal reported regions and the actual hinge, independent of order',()=>{
 const a={x:0,y:0,width:380,height:800},b={x:414,y:0,width:460,height:800};
 assert.deepEqual(viewportLayout([b,a],874,800),{mode:'book',left:a,right:b,gap:34});
 assert.equal(viewportLayout([a,{...b,x:380}],840,800).gap,0);
});
test('tabletop prefers lower equal-area segment and respects asymmetric browser chrome',()=>{
 const lower={x:0,y:420,width:700,height:380};
 assert.deepEqual(viewportLayout([{x:0,y:0,width:700,height:380},lower],700,800),{mode:'single-segment',region:lower});
 assert.deepEqual(viewportLayout([{x:0,y:0,width:700,height:300},lower],700,800).region,lower);
});
test('narrow or multi-fold segments fall back to one intact region, never bridge a hinge',()=>{
 const small={x:0,y:0,width:280,height:700},large={x:304,y:0,width:420,height:700};
 assert.deepEqual(viewportLayout([small,large],724,700),{mode:'single-segment',region:large});
 const third={x:748,y:0,width:420,height:700};
 assert.equal(viewportLayout([small,large,third],1168,700).mode,'single-segment');
});
test('stale, overlapping, missing and malformed geometry does not clip the page',()=>{
 for(const rects of [[],[{x:0,y:0,width:400,height:800},{x:200,y:0,width:400,height:800}], [{x:0,y:0,width:400,height:800},{x:440,y:0,width:400,height:800}], [{x:0,y:0,width:NaN,height:800},{}]])assert.equal(viewportLayout(rects,600,800).mode,'continuous');
});
