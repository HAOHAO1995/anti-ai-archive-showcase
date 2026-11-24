import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {checkHistoryEssays} from '../scripts/lib/check-history-essays.mjs';
const root=new URL('../',import.meta.url),require=createRequire(import.meta.url);
const data=JSON.parse(readFileSync(new URL('lib/data/genealogy-essays.json',root)));
const genealogy=JSON.parse(readFileSync(new URL('lib/data/genealogy.json',root)));
const compiled=ts.transpileModule(readFileSync(new URL('components/history-essay.tsx',root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const module={exports:{}};
vm.runInNewContext(compiled,{exports:module.exports,module,require:n=>n==='@/lib/data/genealogy-essays.json'?data:n==='@/lib/data/genealogy.json'?genealogy:n==='@/lib/locale'?{localizedPath:(p,l)=>'/'+l+p}:require(n)});
const {HistoryEssay}=module.exports;
test('expanded history accounts retain bilingual evidence and current historical context',()=>{assert.deepEqual(checkHistoryEssays(data,genealogy).errors,[]);});
test('every node must retain its own body and a missing or recycled body blocks release',()=>{
 const missing=structuredClone(data);missing.records.pop();assert.ok(checkHistoryEssays(missing,genealogy).errors.some(e=>e.includes('missing bilingual')));
 const repeated=structuredClone(data);repeated.records[1].sections[0].paragraphs[0]=structuredClone(repeated.records[0].sections[0].paragraphs[0]);assert.ok(checkHistoryEssays(repeated,genealogy).errors.some(e=>e.includes('body paragraph duplicates')));
 assert.equal(data.records.length,genealogy.records.length);
});
test('missing translations, stale context and broken evidence or related links block publication',()=>{
 for(const change of [d=>d.records[0].sections[0].paragraphs[0].en='',d=>d.records[0].nodeRevision='stale',d=>d.records[0].sections[0].sourceIds=['missing'],d=>d.records[0].sources[0].url='javascript:alert(1)',d=>d.records[0].related=[{nodeId:'missing',reason:{zh:'比较',en:'Compare'}}]]){const changed=structuredClone(data);change(changed);assert.ok(checkHistoryEssays(changed,genealogy).errors.length);}
});
test('both languages render full sections, evidence anchors and scoped related links; unexpanded nodes stay unchanged',()=>{
 for(const record of data.records)for(const locale of ['zh','en']){
  const html=renderToStaticMarkup(React.createElement(HistoryEssay,{nodeId:record.nodeId,locale}));
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for(const ref of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(ref[1]),ref[1]);
  for(const related of record.related)assert.ok(html.includes(`/${locale}/art-history/${related.nodeId}`));
  for(const section of record.sections)assert.ok(html.includes(`id="essay-${section.id}"`));
  assert.ok(html.includes(record.revisedAt));assert.ok(html.includes(locale==='en'?'pending independent human review':'尚未经独立人工审校'));
  if(locale==='en')assert.ok(!/[\u3400-\u9fff]/u.test(html.replace(/<details class="original-source-metadata"[\s\S]*?<\/details>/g,'')),'English long-form account must not contain Chinese interface text');
 }
 assert.equal(renderToStaticMarkup(React.createElement(HistoryEssay,{nodeId:'999',locale:'en'})),'');
});
