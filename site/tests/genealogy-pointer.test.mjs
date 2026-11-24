import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
import * as navigation from '../lib/genealogy-navigation.mjs';
const data=JSON.parse(await readFile(new URL('../lib/data/genealogy.json',import.meta.url),'utf8'));
const code=ts.transpileModule(await readFile(new URL('../components/genealogy-rail.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function harness({mobile=false,pathname='/en/topics/ai-art-history',search='',hash=''}={}){
 const stateChanges=[],focus=[],positions=[],effects=[],capture=new Set(),window=new EventTarget(),exports={};
 window.location={search,hash};
 const jsx=(type,props)=>({type,props});
 const react={useState:x=>[x,next=>stateChanges.push(next)],useRef:x=>({current:x}),useCallback:fn=>fn,useEffect:fn=>effects.push(fn),lazy:fn=>fn,Suspense:()=>null};
 vm.runInNewContext(code,{exports,window,URLSearchParams,getComputedStyle:()=>({display:mobile?'flex':'none'}),requestAnimationFrame:fn=>fn(),require:name=>{
  if(name==='react')return react;
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx};
  if(name==='next/navigation')return {usePathname:()=>pathname};
  if(name.includes('genealogy-navigation.json'))return {default:data};
  if(name.includes('genealogy-navigation'))return navigation;
  if(name.includes('history-sync'))return {HISTORY_POSITION:'position',publishHistoryPosition:(...x)=>positions.push(x)};
  if(name.includes('locale'))return {localizedPath:(path,locale)=>'/'+locale+path};
  return {};
 }});
 const tree=exports.GenealogyRail({locale:'en'});
 const nodes=[];function walk(node){if(!node)return;if(Array.isArray(node)){node.forEach(walk);return;}if(typeof node==='object'){nodes.push(node);walk(node.props?.children);}}walk(tree);
 const toggle=nodes.find(n=>n.props?.className==='genealogy-toggle');toggle.props.ref.current={focus:()=>focus.push('toggle')};
 const nodeButtons=nodes.filter(n=>n.type==='button'&&n.props?.className==='genealogy-node');
 const input=nodes.find(n=>n.type==='input').props,list=nodes.find(n=>n.type==='ol').props;
 const element={getBoundingClientRect:()=>({top:0,height:1016}),setPointerCapture:id=>capture.add(id),hasPointerCapture:id=>capture.has(id),releasePointerCapture:id=>capture.delete(id),focus:()=>{}};
 const event=(values={})=>({pointerId:1,pointerType:'mouse',button:0,buttons:0,isPrimary:true,clientY:500,currentTarget:element,preventDefault:()=>{},...values});
 return {input,list,positions,event,capture,nodes,stateChanges,focus,restore:effects[0],window};
}
test('hovering the ruler never seeks, and scrolling its list never changes the selected node',()=>{
 const h=harness();for(let y=10;y<1000;y+=10)h.input.onPointerMove(h.event({clientY:y}));assert.deepEqual(h.positions,[]);
 assert.equal(h.input.onPointerEnter,undefined);assert.equal(h.input.onWheel,undefined);assert.equal(h.list.onScroll,undefined);
});
test('only a primary press followed by a captured drag seeks; release ends dragging',()=>{
 const h=harness();h.input.onPointerDown(h.event({button:2,buttons:2}));assert.equal(h.positions.length,0);
 h.input.onPointerDown(h.event({buttons:1,clientY:8}));assert.equal(h.positions.at(-1)[0],data.records[0].id);
 h.input.onPointerMove(h.event({buttons:1,pointerId:2,clientY:1008}));assert.equal(h.positions.length,1);
 h.input.onPointerMove(h.event({buttons:1,clientY:1008}));assert.equal(h.positions.at(-1)[0],data.records.at(-1).id);
 h.input.onPointerUp(h.event());h.input.onPointerMove(h.event({clientY:100}));assert.equal(h.positions.length,2);assert.equal(h.capture.size,0);
});
test('cancel, lost capture and missing mouse button stop interaction; touch dragging still works',()=>{
 for(const end of ['onPointerCancel','onLostPointerCapture']){const h=harness();h.input.onPointerDown(h.event({buttons:1}));h.input[end](h.event());h.input.onPointerMove(h.event({buttons:1,clientY:900}));assert.equal(h.positions.length,1);}
 const h=harness();h.input.onPointerDown(h.event({buttons:1}));h.input.onPointerMove(h.event({buttons:0,clientY:900}));assert.equal(h.positions.length,1);
 h.input.onPointerDown(h.event({pointerType:'touch',pointerId:3}));h.input.onPointerMove(h.event({pointerType:'touch',pointerId:3,clientY:900}));assert.equal(h.positions.length,3);
});
test('keyboard navigation remains an explicit supported choice',()=>{
 const h=harness();h.input.onKeyDown({key:'End',preventDefault:()=>{}});assert.equal(h.positions.at(-1)[0],data.records.at(-1).id);
 h.input.onKeyDown({key:'Home',preventDefault:()=>{}});assert.equal(h.positions.at(-1)[0],data.records[0].id);
});

test('tapping a linked mobile timeline node closes its overlay and returns focus; desktop stays open',()=>{
 for(const mobile of [true,false]){const h=harness({mobile});const row=h.nodes.find(n=>n.type==='li');const button=row.props.children;assert.equal(button.type,'button');button.props.onClick();assert.equal(h.positions.at(-1)[2],'select');assert.equal(h.focus.length,mobile?1:0);if(mobile)assert.equal(h.stateChanges.at(-1),false);}
});


test('direct detail routes and selected catalogue links restore the chronological rail position',()=>{
 const index=data.records.findIndex(r=>r.id==='233');
 for(const locale of ['en','zh'])for(const pathname of [`/${locale}/art-history/233`,`/${locale}/topics/ai-art-history`]){
  const h=harness({pathname,search:'?selected=node-233'});const cleanup=h.restore();
  assert.ok(h.stateChanges.includes(index));assert.ok(!h.stateChanges.includes(true),'no reading overlay on direct entry');
  h.window.location.search='?selected=node-234';h.window.dispatchEvent(new Event('popstate'));
  assert.equal(h.stateChanges.at(-1),pathname.includes('/art-history/')?index:data.records.findIndex(r=>r.id==='234'));
  cleanup();
 }
});


test('the rail omits contextual works and restores their related milestone without assigning a new position',()=>{
 const h=harness();const ids=h.nodes.filter(n=>n.type==='button'&&n.props?.id?.startsWith('genealogy-node-')).map(n=>n.props.id.slice(15));
 assert.equal(ids.length,336);assert.ok(ids.includes('357'));assert.ok(ids.includes('251'));assert.ok(ids.includes('315'));assert.ok(!ids.includes('254'));assert.ok(!ids.includes('252'));
 for(const record of data.records.filter(n=>n.timelineRole==='context')){assert.ok(!ids.includes(record.id));const detail=harness({pathname:'/en/art-history/'+record.id});detail.restore();assert.ok(detail.stateChanges.includes(navigation.timelineRecords(data.records).findIndex(n=>n.id===record.contextParentId)));}
});
