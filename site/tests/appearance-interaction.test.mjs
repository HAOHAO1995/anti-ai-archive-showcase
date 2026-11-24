import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {appearanceInteraction} from '../lib/appearance-interaction.mjs';

function page({blocked=false,lang='en',search=''}={}) {
  const handlers={},windowHandlers={},writes=[],events=[],attrs={};
  const text={textContent:'Dark'},icon={innerHTML:''};
  const button={disabled:false,setAttribute(k,v){attrs[k]=v;},hasAttribute(){return false;},querySelector(s){return s==='span'?text:icon;}};
  class Element {closest(){return button;}}
  const root={dataset:{theme:'light'},lang,classList:{toggle(k,v){this[k]=v;}}};
  const window={location:{href:'https://example.test/en'+search},history:{state:null,replaceState(state,title,url){this.url=url;}},addEventListener(k,fn){windowHandlers[k]=fn;},dispatchEvent(e){events.push(e.type);}};
  const context={window,Element,URL,Event,document:{head:{appendChild(){}},createElement(){return {};},documentElement:root,querySelectorAll(){return [button];},addEventListener(k,fn){handlers[k]=fn;}},localStorage:{setItem(k,v){if(blocked)throw Error();writes.push([k,v]);}},sessionStorage:{removeItem(){if(blocked)throw Error();}}};
  vm.runInNewContext(appearanceInteraction,context);
  const click=()=>{let stopped=false;handlers.click({target:new Element(),preventDefault(){},stopImmediatePropagation(){stopped=true;}});assert.ok(stopped,'must prevent React replay/double toggling');};
  return {root,click,attrs,text,writes,events,handlers,windowHandlers,window,context};
}
test('theme switches before React exists and clicks toggle exactly once',()=>{
  const p=page();p.click();assert.equal(p.root.dataset.theme,'dark');assert.equal(p.root.classList.dark,true);assert.equal(p.attrs['aria-label'],'Switch to light mode');assert.equal(p.attrs['aria-label'],'Switch to light mode');
  p.click();assert.equal(p.root.dataset.theme,'light');assert.equal(p.attrs['aria-label'],'Switch to dark mode');assert.equal(p.writes.length,2);
});
test('blocked storage does not disable switching and Chinese labels follow theme',()=>{
  const p=page({blocked:true,lang:'zh-CN'});p.click();assert.equal(p.attrs['aria-label'],'切换为浅色模式');p.click();assert.equal(p.attrs['aria-label'],'切换为深色模式');
});
test('preview choice is cleared but other query parameters and hash survive',()=>{
  const p=page({search:'?preview-theme=light&filter=art#records'});p.click();assert.equal(p.window.history.url,'/en?filter=art#records');assert.ok(p.events.includes('archive-search'));
});
test('duplicate initialization is harmless and storage events synchronize controls',()=>{
  const p=page(),click=p.handlers.click;vm.runInNewContext(appearanceInteraction,p.context);assert.equal(p.handlers.click,click);
  p.windowHandlers.storage({key:'archive-appearance',newValue:'dark'});assert.equal(p.attrs['aria-label'],'Switch to light mode');
  p.windowHandlers.storage({key:null,newValue:null});assert.equal(p.root.dataset.theme,'light');
});

test('does not mutate React-owned text and icons before hydration',()=>{const p=page();p.click();assert.equal(p.text.textContent,'Dark');});
