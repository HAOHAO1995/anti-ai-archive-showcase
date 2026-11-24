import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as navigation from '../lib/index-navigation.mjs';
const require=createRequire(import.meta.url);
let search='',lang='en',focused='',notifications=0;
const window={location:{pathname:'/en/index',get search(){return search;}},history:{state:{},pushState(_state,_title,url){search=url.slice(url.indexOf('?'));}},dispatchEvent(){notifications++;}};
const document={getElementById:id=>({focus(){focused=id;}})};
const archive={cases:[{}],sources:[{},{}],people:[{id:'p1'},{id:'p2'}],events:[{actors:['p1'],organizations:[]}]};
const mocks={react:{...React,useSyncExternalStore:()=>search},'./archive-explorer':{ArchiveExplorer:({kind})=>React.createElement('div',null,kind)},'./people-index':{PeopleIndex:()=>React.createElement('div',null,'people')},'./archive-hooks':{useArchive:()=>archive},'./site-shell':{useLanguage:()=>({lang}),useArchive:()=>archive},'@/lib/index-navigation.mjs':navigation};
const module={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../components/unified-index.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{module,exports:module.exports,window,document,Event,require:name=>mocks[name]??require(name)});
const {UnifiedIndex}=module.exports;
test('Index exposes one selected tab and matching panel in either language',()=>{
 for(lang of ['zh','en'])for(const view of navigation.indexViews){search='?view='+view;const html=renderToStaticMarkup(React.createElement(UnifiedIndex));assert.equal((html.match(/<main/g)||[]).length,1);assert.equal((html.match(/<h1>/g)||[]).length,1);assert.equal((html.match(/aria-selected="true"/g)||[]).length,1);assert.equal((html.match(/hidden=""/g)||[]).length,2);assert.match(html,new RegExp(`id="index-tab-${view}"[^>]*aria-selected="true"`));assert.match(html,new RegExp(`id="index-panel-${view}"[^>]*tabindex="0">`));}
});
test('tab clicks and keyboard navigation preserve other collections’ filters',()=>{
 search='?view=cases&cases-q=ArtStation&people-q=Chen&sources-year=2026';
 let buttons=UnifiedIndex().props.children[1].props.children;
 buttons[1].props.onClick();assert.equal(navigation.indexView(search),'people');assert.equal(new URLSearchParams(search).get('cases-q'),'ArtStation');
 buttons=UnifiedIndex().props.children[1].props.children;
 let prevented=false;buttons[1].props.onKeyDown({key:'ArrowRight',preventDefault(){prevented=true;}});
 assert.ok(prevented);assert.equal(navigation.indexView(search),'sources');assert.equal(focused,'index-tab-sources');assert.equal(new URLSearchParams(search).get('people-q'),'Chen');assert.equal(notifications,2);
});
