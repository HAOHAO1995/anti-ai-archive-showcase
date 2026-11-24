import test from 'node:test';
import * as navigation from '../lib/genealogy-navigation.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=new URL('../',import.meta.url),require=createRequire(import.meta.url);
const nodes=JSON.parse(readFileSync(new URL('lib/data/genealogy.json',root)));
function component(path,mocks){
 const code=ts.transpileModule(readFileSync(new URL(path,root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(code,{module,exports:module.exports,URLSearchParams,require:n=>Object.hasOwn(mocks,n)?mocks[n]:require(n)});
 return module.exports;
}
const {HistoryIllustration}=component('components/history-illustration.tsx',{'@/lib/data/genealogy-navigation.json':nodes,'@/lib/genealogy-navigation.mjs':navigation,'@/lib/data/genealogy-illustrations.json':JSON.parse(readFileSync(new URL('lib/data/genealogy-illustrations.json',root)))});
let gallery=false;
const {TopicReadingRoom}=component('components/topic-reading-room.tsx',{
 react:{...React,useSyncExternalStore:()=>gallery?'?view=gallery':''},
 './history-illustration':{HistoryIllustration},
 './topic-illustration':{TopicIllustration:()=>null},
 '@/lib/reading-subtitle':component('lib/reading-subtitle.ts',{}),
 './use-history-timeline':{useHistoryTimeline:()=>{}},
 '@/lib/history-sync':{publishHistoryPosition:()=>{}},
 './reading-room-panes':{ReadingRoomPanes:()=>null,useReadingRoomPanes:()=>({roomRef:null,pane:'preview',showPane:()=>{}})},
 './site-shell':{useLanguage:()=>({lang:'en'}),Link:({href,...props})=>React.createElement('a',{...props,href:'/en'+href})},
 '@/lib/locale':{localizedPath:(path,locale)=>'/'+locale+path}
});
test('each of the English history selections renders an English preview and matching reading link',()=>{
 for(const n of navigation.timelineRecords(nodes.records)){
  const entry={id:'node-'+n.id,sequence:navigation.chronologicalNumber(nodes.records,n.id),title:n.title.en,alternative:n.title.zh,description:n.summary.en,year:n.date.en.slice(0,4),date:n.date.en,credit:n.actors,kind:'node',href:'/art-history/'+n.id,search:n.title.en+' '+n.title.zh};
  const markup=renderToStaticMarkup(React.createElement(TopicReadingRoom,{title:'AI art history',description:'Historical context and sources',entries:[entry],historyTimeline:true}));
  const defaultPresentation=markup.replace(/<details\b[^>]*class="original-source-metadata"[^>]*>[\s\S]*?<\/details>/g,'');
  assert.ok(!/[\u3400-\u9fff]/u.test(defaultPresentation),`Chinese display copy in English node ${n.id}`);
  assert.ok(!markup.includes('Historical context &amp; original sources'),n.id);assert.ok(markup.includes('NODE-'+navigation.chronologicalNumber(nodes.records,n.id)+'<'));
  assert.ok(markup.includes(`href="/en/art-history/${n.id}"`),n.id);
  const visual=JSON.parse(readFileSync(new URL('lib/data/genealogy-illustrations.json',root))).records.find(v=>v.nodeId===n.id);
  assert.equal(markup.includes(`data-visual-node="${n.id}"`),visual.kind!=='pending',n.id);
  assert.ok(markup.includes('<h2>'+n.title.en.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;')+'</h2>'),n.id);
 }
});

test('historical grids use node-specific images and mark pending images without substitute pictures',()=>{
 gallery=true;
 for(const id of ['014','224']){
  const n=nodes.records.find(n=>n.id===id),entry={id:'node-'+id,title:n.title.en,alternative:n.title.zh,description:n.summary.en,year:n.date.en.slice(0,4),date:n.date.en,credit:n.actors,kind:'node',href:'/art-history/'+id,search:n.title.en};
  const html=renderToStaticMarkup(React.createElement(TopicReadingRoom,{title:'AI art history',description:'History',entries:[entry],historyTimeline:true}));
  const card=html.match(/<article[\s\S]*?<\/article>/)[0];
  assert.ok(card.includes('room-card-image'));
  if(id==='014'){assert.ok(card.includes('data-card-node="014"'));assert.ok(card.indexOf('<img')<card.indexOf('room-record-title'));}
  else {assert.ok(card.includes('Source image pending'));assert.ok(!card.includes('<img'));}
  assert.ok(!card.match(/<button[\s\S]*?<\/button>/)[0].includes('<a '));
 }
 gallery=false;
});
