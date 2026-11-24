import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
import {nearestHistoryCard,historyHashId} from '../lib/history-position.mjs';
const source=await readFile(new URL('../components/use-history-timeline.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function harness({hash='',search='',previewOpen=false,hiddenTarget=false,reduced=false,grid=false,automaticRailScroll=false}={}){
 const window=new EventTarget(),document=new EventTarget(),effects=[],raf=new Map(),timers=new Map(),positions=[],navigation=[],restored=[],scrolls=[],messages=[];let serial=0,refCursor=0;const refs=[];
 class Element{closest(){return null;}constructor(parent=null){this.parentElement=parent;}contains(other){for(let node=other;node;node=node.parentElement)if(node===this)return true;return false;}}
 const viewport=new Element(),rail=new Element(viewport);
 const scroll=(target=document)=>{const event=new Event('scroll');Object.defineProperty(event,'target',{value:target});document.dispatchEvent(event);};
 Object.assign(window,{innerHeight:800,location:{hash,search},matchMedia:()=>({matches:reduced})});
 let rows=[{id:'001',top:80,bottom:300,height:220},{id:'002',top:340,bottom:560,height:220}];
 if(grid)rows[1]={...rows[1],top:80,bottom:300};
 const room=Object.assign(new Element(viewport),{closest:()=>({getBoundingClientRect:()=>({top:0,bottom:800})}),querySelectorAll:()=>rows.map(r=>({dataset:{historyId:r.id},getBoundingClientRect:()=>r})),querySelector:selector=>{
  if(selector==='.room-catalogue')return catalogue;
  if(selector==='.room-preview')return preview;
  const id=/data-history-id="(\d+)"/.exec(selector)?.[1];if(!rows.some(r=>r.id===id))return null;
  return {scrollIntoView:options=>{scrolls.push({id,...options});document.dispatchEvent(new Event('scroll'));}};
 }});
 const catalogue=new Element(room),preview=new Element(room);
 const publish=(id,source,motion='scrub')=>{const detail={id,source,motion};messages.push(detail);window.dispatchEvent(new CustomEvent('position',{detail}));if(automaticRailScroll&&source==='catalogue')scroll(rail);};
 const exports={};const context=vm.createContext({exports,window,document,Element,URLSearchParams,CustomEvent,Event,getComputedStyle:()=>({display:previewOpen?'none':'block'}),requestAnimationFrame:fn=>{const id=++serial;raf.set(id,fn);return id;},cancelAnimationFrame:id=>raf.delete(id),setTimeout:fn=>{const id=++serial;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),require:name=>name==='react'?{useEffect:fn=>effects.push(fn),useRef:value=>refs[refCursor++]??(refs[refCursor-1]={current:value})}:name.includes('history-position')?{nearestHistoryCard,historyHashId}:{HISTORY_POSITION:'position',publishHistoryPosition:publish}});
 vm.runInContext(code,context);
 const roomRef={current:room};
 const render=signature=>{refCursor=0;exports.useHistoryTimeline({enabled:true,roomRef,signature,onPosition:id=>positions.push(id),onNavigate:(id,restoreView)=>{navigation.push(id);restored.push(restoreView);if(hiddenTarget&&!rows.some(r=>r.id===id))rows.push({id,top:700,bottom:920,height:220});}});};
 render('node-001,node-002');
 const cleanups=effects.map(fn=>fn());
 const flush=()=>{let n=0;while(raf.size){assert.ok(++n<20,'No scroll feedback loop');const entries=[...raf];raf.clear();for(const [,fn] of entries)fn();}};
 return {filter(signature){effects.length=0;render(signature);effects[0]();},positions,navigation,restored,scrolls,messages,flush,publish,scroll,rail,preview,catalogue,viewport,input(type,target){const event=new Event(type);Object.defineProperty(event,'target',{value:target});document.dispatchEvent(event)},wheel(target){const event=new Event('wheel');Object.defineProperty(event,'target',{value:target});document.dispatchEvent(event)},settle:()=>{const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());},move:()=>{rows=rows.map(r=>({...r,top:r.top-260,bottom:r.bottom-260}));},key(target,key){const event=new Event('keydown');Object.defineProperties(event,{target:{value:target},key:{value:key}});document.dispatchEvent(event)},cleanup:()=>cleanups.forEach(fn=>fn?.())};
}
test('catalogue scrolling publishes exact node positions without commanding another catalogue scroll',()=>{
 const h=harness();h.scroll();h.flush();assert.deepEqual(h.positions,['001']);h.move();h.scroll();h.flush();assert.deepEqual(h.positions,['001','002']);assert.equal(h.scrolls.length,0);assert.equal(h.messages.at(-1).source,'catalogue');h.cleanup();
});
test('rail navigation waits for a filtered-out target, suppresses echo and honours reduced motion',()=>{
 const h=harness({hiddenTarget:true,reduced:true});h.publish('222','rail','select');h.flush();assert.deepEqual(h.navigation,['222']);assert.equal(h.scrolls[0].id,'222');assert.equal(h.scrolls[0].behavior,'instant');assert.equal(h.positions.length,0);assert.equal(h.messages.filter(m=>m.source==='rail').length,1);h.cleanup();
});
test('legacy node links restore the catalogue position and explicit selection scrolls smoothly',()=>{
 const h=harness({hash:'#node-002'});h.flush();assert.deepEqual(h.navigation,['002']);assert.equal(h.scrolls[0].id,'002');h.publish('001','rail','select');h.flush();assert.equal(h.scrolls.at(-1).behavior,'smooth');h.cleanup();
});

test('manual selection in a gallery row remains the preferred node while scrolling',()=>{
 const h=harness({grid:true});h.publish('002','catalogue','select');h.scroll();h.flush();assert.equal(h.positions.length,0);assert.equal(h.messages.at(-1).id,'002');h.cleanup();
});

test('automatic rail scrolling cannot undo repeated card selections or start a feedback loop',()=>{
 const h=harness({automaticRailScroll:true});h.scroll();h.flush();assert.deepEqual(h.positions,['001']);
 for(let i=0;i<30;i++){const id=i%2?'001':'002';h.publish(id,'catalogue','select');h.flush();assert.equal(h.messages.at(-1).id,id);}
 assert.deepEqual(h.positions,['001']);assert.equal(h.scrolls.length,0);h.cleanup();
});

test('manual clicks, including guides, supersede already queued catalogue measurements',()=>{
 const h=harness();h.scroll();h.publish('002','catalogue','select');h.flush();assert.deepEqual(h.positions,[]);
 h.scroll();h.publish('guide-scope','catalogue','select');h.flush();assert.deepEqual(h.positions,[]);
 h.move();h.scroll();h.flush();assert.deepEqual(h.positions,[]);h.cleanup();
});

test('a manual card click cancels a pending rail jump and stays selected during page scrolling',()=>{
 const h=harness();h.publish('002','rail','select');h.publish('001','catalogue','select');h.flush();assert.equal(h.scrolls.length,0);
 h.move();h.scroll();h.flush();assert.deepEqual(h.positions,[]);h.cleanup();
});

test('only page, viewport and catalogue scrolling can update the selected preview',()=>{
 const h=harness();h.scroll(h.rail);h.scroll(h.preview);h.flush();assert.deepEqual(h.positions,[]);
 h.scroll(h.viewport);h.flush();assert.deepEqual(h.positions,['001']);
 h.move();h.scroll(h.catalogue);h.flush();assert.deepEqual(h.positions,['001','002']);h.cleanup();
});

test('manual selection stays pinned through programmatic scroll events and explicit rail selections',()=>{
 const h=harness({automaticRailScroll:true});h.publish('001','catalogue','select');
 h.move();h.scroll();h.scroll(h.viewport);h.scroll(h.catalogue);h.flush();assert.deepEqual(h.positions,[]);
 h.publish('002','rail','scrub');h.flush();h.settle();h.scroll();h.flush();assert.deepEqual(h.positions,[]);assert.equal(h.navigation.at(-1),'002');
 h.publish('001','catalogue','select');h.move();h.scroll();h.flush();assert.deepEqual(h.positions,[]);assert.equal(h.messages.at(-1).id,'001');h.cleanup();
});

 test('restoring a mobile selected entry preserves its preview without scrolling a hidden catalogue',()=>{
 const h=harness({search:'?selected=node-002&pane=preview',previewOpen:true});h.flush();assert.deepEqual(h.navigation,['002']);assert.deepEqual(h.restored,[true]);assert.equal(h.scrolls.length,0);h.publish('001','rail','select');h.flush();assert.equal(h.restored.at(-1),false);assert.equal(h.scrolls.at(-1).id,'001');h.cleanup();
 });

test('wheel input in the preview never samples catalogue positions or changes the selected node',()=>{
 const h=harness();h.wheel(h.preview);h.flush();assert.deepEqual(h.positions,[]);
 h.wheel(h.catalogue);h.flush();assert.deepEqual(h.positions,['001']);
 h.move();h.wheel(h.preview);h.flush();assert.deepEqual(h.positions,['001']);h.cleanup();
});


test('catalogue wheel scrolling keeps the clicked node and rail selection fixed',()=>{
 const h=harness({automaticRailScroll:true});h.publish('001','catalogue','select');
 h.move();h.wheel(h.catalogue);h.scroll(h.catalogue);h.flush();
 assert.deepEqual(h.positions,[]);assert.equal(h.messages.at(-1).id,'001');assert.equal(h.scrolls.length,0);h.cleanup();
});
test('page and preview keyboard scrolling preserve an explicit selection',()=>{
 const h=harness();h.publish('001','catalogue','select');h.move();
 h.key(h.preview,'PageDown');h.flush();assert.deepEqual(h.positions,[]);
 h.key(h.viewport,'PageDown');h.flush();assert.deepEqual(h.positions,[]);h.cleanup();
});
test('viewport wheel scrolling preserves a restored deep link',()=>{
 const h=harness({search:'?selected=node-001'});h.flush();h.settle();h.move();h.wheel(h.viewport);h.flush();
 assert.deepEqual(h.positions,[]);h.cleanup();
});

test('touch and pointer input do not release a clicked card or guide, even after kinetic scroll',()=>{
 for(const id of ['002','guide-scope']){
  const h=harness({automaticRailScroll:true,grid:true});h.publish(id,'catalogue','select');
  for(const type of ['pointerdown','touchstart','wheel']){h.input(type,h.catalogue);h.move();h.scroll(h.catalogue);h.flush();}
  h.settle();h.scroll(h.viewport);h.flush();assert.deepEqual(h.positions,[]);assert.equal(h.messages.at(-1).id,id);h.cleanup();
 }
});
test('scrolling cancels a queued rail jump while retaining its explicit selection',()=>{
 const h=harness();h.publish('002','rail','select');h.wheel(h.catalogue);h.flush();h.settle();h.scroll();h.flush();
 assert.equal(h.scrolls.length,0);assert.deepEqual(h.positions,[]);assert.equal(h.navigation.at(-1),'002');
 h.publish('001','rail','select');h.flush();assert.equal(h.scrolls.at(-1).id,'001');h.cleanup();
});

test('filter changes retain an explicit selection while it remains visible; removing it releases the stale pin',()=>{
 const h=harness();h.publish('002','catalogue','select');h.filter('node-002');h.scroll();h.flush();assert.deepEqual(h.positions,[]);
 h.filter('node-001');h.scroll();h.flush();assert.deepEqual(h.positions,['001']);h.cleanup();
});
test('a selected introduction is not replaced by a node when the filter still contains the guide',()=>{
 const h=harness();h.publish('guide-scope','catalogue','select');h.filter('guide-scope,node-001');h.wheel(h.catalogue);h.scroll();h.flush();assert.deepEqual(h.positions,[]);h.cleanup();
});
