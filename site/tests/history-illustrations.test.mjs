import {assetInfo} from './asset-info.mjs';
import test from 'node:test';
import * as navigation from '../lib/genealogy-navigation.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {checkGenealogyIllustrations} from '../scripts/lib/check-genealogy-illustrations.mjs';
const root=new URL('../',import.meta.url),require=createRequire(import.meta.url);
const data=JSON.parse(readFileSync(new URL('lib/data/genealogy-illustrations.json',root)));
const nodes=JSON.parse(readFileSync(new URL('lib/data/genealogy.json',root)));
const compiled=ts.transpileModule(readFileSync(new URL('components/history-illustration.tsx',root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const module={exports:{}};
vm.runInNewContext(compiled,{exports:module.exports,module,require:n=>n==='@/lib/data/genealogy-illustrations.json'?data:n==='@/lib/data/genealogy-navigation.json'?nodes:n==='@/lib/genealogy-navigation.mjs'?navigation:require(n)});
const {HistoryIllustration}=module.exports;
test('every historical node has a current source image or an explicit pending status',()=>{assert.deepEqual(checkGenealogyIllustrations(data,nodes).errors,[]);assert.equal(data.records.length,nodes.records.length);});
test('source-image records match the frozen media inventory (bytes verified only when bundled)',()=>{for(const r of data.records.filter(r=>r.src)){const bytes=assetInfo(new URL('public'+r.src,root));assert.equal(bytes.sha256,r.sha256,r.nodeId);}});
test('all node/language combinations show only their source figure or no illustration',()=>{for(const node of nodes.records)for(const locale of ['zh','en']){const r=data.records.find(v=>v.nodeId===node.id);const html=renderToStaticMarkup(React.createElement(HistoryIllustration,{nodeId:node.id,locale}));if(r.kind==='pending'){assert.equal(html,'');continue;}assert.ok(html.includes(`data-visual-node="${node.id}"`));assert.ok(html.includes('figcaption'));const number=navigation.chronologicalNumber(nodes.records,node.id);assert.ok(html.includes(number?'#'+number+'<':locale==='zh'?'专题作品':'THEMATIC WORK'),node.id+' figure chronology or thematic label');assert.ok(html.includes('loading="lazy"'));assert.ok(html.includes('<img'));assert.ok(!html.includes('<svg'));assert.ok(html.includes(r.sourceUrl.replaceAll('&','&amp;')));}});
test('missing language, stale context, unsafe asset and duplicate mappings block publication',()=>{for(const mutate of [d=>d.records[0].caption.en='',d=>d.records[0].nodeRevision='stale',d=>{d.records[0].kind='source-image';d.records[0].src='https://example.com/x.jpg'},d=>d.records.push(d.records[0]),d=>d.records.pop()]){const d=structuredClone(data);mutate(d);assert.ok(checkGenealogyIllustrations(d,nodes).errors.length);}});

test('self-drawn substitutes and duplicate source images fail the publication check',()=>{const d=structuredClone(data);d.records[0].kind='diagram';assert.ok(checkGenealogyIllustrations(d,nodes).errors.length);const x=structuredClone(data),photos=x.records.filter(r=>r.src);photos[1].sha256=photos[0].sha256;assert.ok(checkGenealogyIllustrations(x,nodes).errors.some(e=>e.includes('reused image')));});

test('English historical illustrations render English descriptions and keep source-language titles separately labelled',()=>{
 for(const node of nodes.records){
  const r=data.records.find(v=>v.nodeId===node.id);
  const html=renderToStaticMarkup(React.createElement(HistoryIllustration,{nodeId:node.id,locale:'en'}));
  const presentation=html.replace(/<details\b[^>]*class="original-source-metadata"[^>]*>[\s\S]*?<\/details>/g,'');
  assert.ok(!/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/u.test(presentation),`English figure ${node.id} contains untranslated display text`);
  if(r.sourceTitleLocalized){
   assert.ok(html.includes('View original source title'),node.id);
   assert.ok(html.includes(r.sourceTitle.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#x27;')),node.id);
  }
 }
});
