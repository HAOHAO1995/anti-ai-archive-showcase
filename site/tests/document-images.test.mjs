import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=new URL('../',import.meta.url),require=createRequire(import.meta.url);
const json=p=>JSON.parse(fs.readFileSync(new URL(p,root)));
const archive=json('lib/data/archive.json'),dictionary=json('lib/data/i18n/translations.json'),authored=json('lib/data/authored-documents.json'),visuals=json('lib/data/topic-illustrations.json').records;
const translate=(v,locale)=>typeof v==='string'?(dictionary[v]?.[locale]??v):Array.isArray(v)?v.map(x=>translate(x,locale)):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,translate(x,locale)])):v;
const localized={en:translate(archive,'en'),zh:translate(archive,'zh')};let selected='',locale='en',gallery=false;
function load(path,mocks={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(path,root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,URLSearchParams,require:n=>Object.hasOwn(mocks,n)?mocks[n]:require(n)});return module.exports;}
const images={topicVisuals:visuals,topicVisualById:new Map(visuals.map(v=>[v.id,v])),topicIllustrationId:id=>visuals.find(v=>v.recordIds.includes(id))?.id};
const illustration=load('components/topic-illustration.tsx',{'@/lib/topic-images':images});
const {DocumentReadingRoom}=load('components/document-reading-room.tsx',{
 react:{...React,useSyncExternalStore:()=>'?selected='+selected+(gallery?'&view=gallery':'')},
 './topic-illustration':illustration,'@/lib/topic-images':images,
 '@/lib/reading-subtitle':load('lib/reading-subtitle.ts'),
 './reading-room-panes':{ReadingRoomPanes:()=>null,useReadingRoomPanes:()=>({roomRef:null,pane:'preview',showPane:()=>{}})},
 './archive-hooks':{useArchive:()=>localized[locale]},
 './site-shell':{useArchive:()=>localized[locale],useLanguage:()=>({lang:locale}),Link:({href,...p})=>React.createElement('a',{...p,href:'/'+locale+href})},
 '@/lib/data/authored-documents.json':authored,
 '@/lib/locale':{ searchVariants:t=>t,typeLabel:t=>t.replaceAll('-',' '),getArchive:l=>localized[l],localizedPath:(p,l)=>'/'+l+p}
});
const {documentCatalogue}=load('lib/document-catalogue.ts',{'./data/authored-documents.json':authored,'./i18n':{getArchive:l=>localized[l],searchVariants:t=>t,typeLabel:t=>t.replaceAll('-',' ')}});
test('each illustrated document selection has the matching source image and reading link in both languages',()=>{
 const ids=visuals.flatMap(v=>v.recordIds).filter(id=>id.startsWith('doc-')||authored.some(d=>d.id===id));
 assert.ok(ids.includes('doc-0054'));
 for(const lang of ['en','zh'])for(const id of ids){locale=lang;selected=id;const markup=renderToStaticMarkup(React.createElement(DocumentReadingRoom,{records:documentCatalogue(locale),updated:archive.updated}));const preview=markup.match(/<aside\b[\s\S]*?<\/aside>/)[0];const image=visuals.find(v=>v.recordIds.includes(id));assert.ok(preview.includes(`data-topic-visual="${image.id}"`),id);assert.ok(preview.includes(`href="/${lang}/documents/${id}"`),id);assert.ok(preview.includes(image.src),id);}
});

test('document grids put the matching source image before its title, with no nested links in preview buttons',()=>{
 gallery=true;selected='doc-0054';
 for(const lang of ['en','zh']){
  locale=lang;const html=renderToStaticMarkup(React.createElement(DocumentReadingRoom,{records:documentCatalogue(locale),updated:archive.updated}));
  const card=html.match(/<article[^>]*data-document-id="doc-0054"[\s\S]*?<\/article>/)[0];
  const image=visuals.find(v=>v.recordIds.includes('doc-0054'));
  assert.ok(card.includes(image.src));assert.ok(card.indexOf('<img')<card.indexOf('room-record-title'));
  const button=card.match(/<button[\s\S]*?<\/button>/)[0];assert.ok(!button.includes('<a '));assert.ok(button.includes('loading="lazy"'));
  assert.ok(card.includes(`href="/${lang}/documents/doc-0054"`));
 }
 gallery=false;
 const html=renderToStaticMarkup(React.createElement(DocumentReadingRoom,{records:documentCatalogue(locale),updated:archive.updated}));
 const cards=html.slice(html.indexOf('class="room-records"'));
 assert.ok(!cards.includes('room-card-image'));
});
