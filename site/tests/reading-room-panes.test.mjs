import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
const code=ts.transpileModule(await readFile(new URL('../components/reading-room-panes.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function harness({compact=true,fold=false,search='?selected=node-028&year=1979',hash='',scrollPreview=false,previewTop=180}={}){
 const window=new EventTarget(),effects=[],raf=new Map(),scrolls=[],focus=[],history=[],states=[];let serial=0;
 window.location=new URL('https://example.test/en/topics/ai-art-history'+search+hash);window.scrollY=920;
 const write=(kind,state,url)=>{history.push({kind,state,url});window.location=new URL(url,window.location)};
 window.history={state:{router:'kept'},pushState(state,_,url){write('push',state,url)},replaceState(state,_,url){write('replace',state,url)}};
 window.innerHeight=800;window.visualViewport=Object.assign(new EventTarget(),{offsetTop:0,height:800});
 window.scrollTo=options=>scrolls.push({target:'window',...options});
 const frame={getBoundingClientRect:()=>({top:200,bottom:700}),scrollTop:640,scrollTo:options=>scrolls.push({target:'frame',...options})};
 const target=name=>({focus:()=>focus.push(name),scrollIntoView:options=>scrolls.push({target:name,...options})});
 const title=target('title'),selected=target('selected');
 class Node{};const styles=new Map();const preview=Object.assign(new Node(),{scrollTop:0,contains:node=>node===preview,getBoundingClientRect:()=>({top:previewTop}),style:{getPropertyValue:key=>styles.get(key)??'',setProperty:(key,value)=>styles.set(key,value),removeProperty:key=>styles.delete(key)}});
 const document=Object.assign(new EventTarget(),{documentElement:{dataset:{fold:fold?'single-segment':''}}});
 const room={querySelector:selector=>selector==='.room-preview'?(scrollPreview?preview:null):selector==='.room-spread'?{}:selector==='.room-cover-title a'?title:selector==='.room-record.is-selected .room-select'?selected:null,closest:()=>frame,scrollIntoView:options=>scrolls.push({target:'room',...options})};
 const exports={};
 const context=vm.createContext({exports,Event,URLSearchParams,window,document,Node,getComputedStyle:()=>({getPropertyValue:()=>compact?'0':'1'}),requestAnimationFrame:fn=>{const id=++serial;raf.set(id,fn);return id},cancelAnimationFrame:id=>raf.delete(id),require:name=>name==='react'?{useRef:current=>({current}),useState:initial=>[initial,next=>states.push(next)],useEffect:fn=>effects.push(fn)}:name==='./site-shell'?{useLanguage:()=>({lang:'en'})}:{}});
 vm.runInContext(code,context);const hook=exports.useReadingRoomPanes();hook.roomRef.current=room;const cleanups=effects.map(fn=>fn());
 return {hook,window,history,scrolls,focus,states,preview,styles,movePreview(top){previewTop=top;const event=new Event('scroll');document.dispatchEvent(event)},previewScroll(){const event=new Event('scroll');Object.defineProperty(event,'target',{value:preview});document.dispatchEvent(event)},flush(){const pending=[...raf.values()];raf.clear();pending.forEach(fn=>fn())},back(search){window.location=new URL(window.location.pathname+search,window.location);window.dispatchEvent(new Event('popstate'))},cleanup(){cleanups.forEach(fn=>fn?.())}};
}
test('mobile preview keeps filters and router state, and returning restores the catalogue scroll position',()=>{
 const h=harness({hash:'#topic-catalogue'});h.hook.showPane('preview');h.flush();assert.equal(h.window.location.search,'?selected=node-028&year=1979&pane=preview');assert.equal(h.window.location.hash,'#topic-catalogue');assert.equal(h.history[0].kind,'push');assert.equal(h.history[0].state.router,'kept');assert.equal(h.focus.at(-1),'title');h.window.scrollY=40;h.hook.showPane('catalogue');h.flush();assert.equal(h.focus.at(-1),'selected');assert.equal(h.scrolls.at(-1).top,920);assert.equal(h.window.location.search,'?selected=node-028&year=1979');h.cleanup();
});
test('browser Back returns from the mobile preview without losing the previous list position',()=>{
 const h=harness();h.hook.showPane('preview');h.flush();h.back('?selected=node-028&year=1979');h.flush();assert.equal(h.states.at(-1),'catalogue');assert.equal(h.scrolls.at(-1).top,920);assert.equal(h.history.length,1);h.cleanup();
});
test('a copied or language-switched preview link restores preview and returns to the selected card',()=>{
 const h=harness({search:'?selected=node-028&pane=preview'});assert.equal(h.states.at(-1),'preview');h.hook.showPane('catalogue');h.flush();assert.equal(h.scrolls.at(-1).target,'selected');assert.equal(h.scrolls.at(-1).block,'center');h.cleanup();
});
test('foldable single-segment navigation restores the actual scrolling frame instead of window',()=>{
 const h=harness({fold:true});h.hook.showPane('preview');h.flush();h.hook.showPane('catalogue');h.flush();assert.equal(h.scrolls.at(-1).target,'frame');assert.equal(h.scrolls.at(-1).top,640);h.cleanup();
});
test('desktop selection does not alter URLs or scroll the page',()=>{
 const h=harness({compact:false});h.hook.showPane('preview');h.flush();assert.equal(h.history.length,0);assert.equal(h.scrolls.length,0);assert.equal(h.focus.length,0);h.cleanup();
});
test('rapid pane changes cancel obsolete scrolling and cleanup cancels pending focus',()=>{
 const h=harness();h.hook.showPane('preview');h.hook.showPane('catalogue');h.flush();assert.deepEqual(h.focus,['selected']);h.hook.showPane('preview');h.cleanup();h.flush();assert.deepEqual(h.focus,['selected']);
});

test('preview height fits below its actual top and updates with page and visual viewport changes',()=>{
 const h=harness({compact:false,scrollPreview:true,previewTop:180});assert.equal(h.styles.get('--room-preview-height'),'600px');
 h.preview.scrollTop=300;h.previewScroll();h.flush();assert.equal(h.preview.scrollTop,300);assert.equal(h.styles.get('--room-preview-height'),'600px');
 h.movePreview(20);h.flush();assert.equal(h.styles.get('--room-preview-height'),'760px');
 h.window.visualViewport.height=600;h.window.visualViewport.dispatchEvent(new Event('resize'));h.flush();assert.equal(h.styles.get('--room-preview-height'),'560px');
 h.cleanup();assert.equal(h.styles.has('--room-preview-height'),false);
});
test('a folded viewport sizes the preview against its usable scrolling segment',()=>{
 const h=harness({compact:false,fold:true,scrollPreview:true,previewTop:250});assert.equal(h.styles.get('--room-preview-height'),'430px');
 h.movePreview(150);h.flush();assert.equal(h.styles.get('--room-preview-height'),'460px');h.cleanup();
});

test('selecting a different record resets only its preview scroll and preserves the catalogue position',()=>{
 const h=harness({compact:false,scrollPreview:true});
 h.preview.scrollTop=600;h.hook.showPane('preview',true,'doc-001');assert.equal(h.preview.scrollTop,0);
 h.preview.scrollTop=240;h.hook.showPane('preview',true,'doc-001');assert.equal(h.preview.scrollTop,240);
 h.hook.showPane('preview',true,'node-002');h.flush();assert.equal(h.preview.scrollTop,0);
 assert.equal(h.window.scrollY,920);assert.equal(h.scrolls.length,0);assert.equal(h.focus.length,0);h.cleanup();
});
