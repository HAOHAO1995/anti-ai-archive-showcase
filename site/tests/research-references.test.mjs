import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import refs from '../lib/data/ai-research-references.json' with {type:'json'};
import visuals from '../lib/data/topic-illustrations.json' with {type:'json'};
const require=createRequire(import.meta.url);
const images={topicVisuals:visuals.records,topicVisualById:new Map(visuals.records.map(v=>[v.id,v])),topicIllustrationId:id=>visuals.records.find(v=>v.recordIds.includes(id))?.id};
const imageModule={exports:{}};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../components/topic-illustration.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module:imageModule,exports:imageModule.exports,require:n=>n==='@/lib/topic-images'?images:require(n)});
const source=readFileSync(new URL('../app/[locale]/topics/culture-governance/references/[id]/page.tsx',import.meta.url),'utf8');
const module={exports:{}};
const mocks={
 '@/components/topic-illustration':imageModule.exports,
 '@/lib/topic-images':images,
 'next/navigation':{notFound(){throw new Error('NOT_FOUND')}},
 '@/lib/data/ai-research-references.json':refs,
 '@/lib/i18n':{isLocale:v=>['en','zh'].includes(v),localizedPath:(p,l)=>'/'+l+p,siteOrigin:'https://salondesrefuses.cn',languageMetadata:(path,locale,title,description)=>({path,locale,title,description})}
};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:n=>mocks[n]??require(n)});
test('eight independent bilingual reference pages preserve scope, sources and individual research commentary',async()=>{
 assert.equal(refs.length,8);assert.equal(new Set(refs.map(r=>r.id)).size,8);
 for(const locale of ['en','zh'])for(const r of refs){
  const html=renderToStaticMarkup(await module.exports.default({params:Promise.resolve({locale,id:r.id})}));
  assert.ok(html.includes(r.url),r.id);
  const visual=visuals.records.find(v=>v.recordIds.includes(r.id));
  assert.ok(visual,'Missing reference illustration: '+r.id);
  assert.ok(html.includes('data-topic-visual="'+visual.id+'"'),r.id);
  assert.ok(html.includes(visual.src),r.id);
  assert.ok(html.includes(visual.sourceUrl),r.id);
  assert.ok(html.includes('selected='+r.id),r.id);
  assert.ok(html.includes('/topics/culture-governance/references/'+r.id),r.id);
  assert.equal(r.sections.length,4);
  for(const section of r.sections){assert.ok(section.body[locale].trim());assert.ok(html.includes('id="'+section.id+'"'));}
  assert.ok(!html.includes('/documents/'+r.documentId),'Do not link records absent from the published snapshot');
  if(locale==='en')assert.ok(!/[\u3400-\u9fff]/u.test(html),'English-only editorial text '+r.id);
 }
 assert.equal(refs.find(r=>r.id==='src-0774').publicationYear,'1990');
 assert.equal(refs.find(r=>r.id==='src-0774').publicationDate,null);
});
test('reference routing rejects unknown IDs and unsupported languages',async()=>{
 await assert.rejects(()=>module.exports.default({params:Promise.resolve({locale:'en',id:'unknown'})}),/NOT_FOUND/);
 await assert.rejects(()=>module.exports.default({params:Promise.resolve({locale:'fr',id:refs[0].id})}),/NOT_FOUND/);
});
