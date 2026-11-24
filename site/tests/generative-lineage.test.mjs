import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import {renderToStaticMarkup} from 'react-dom/server';
const root=new URL('../',import.meta.url),require=createRequire(import.meta.url);
const topics=JSON.parse(readFileSync(new URL('lib/data/topics.json',root)));
const genealogy=JSON.parse(readFileSync(new URL('lib/data/genealogy.json',root)));
const guide=topics.find(t=>t.slug==='ai-art-history').sections.find(s=>s.id==='generative-lineage');
const compiled=ts.transpileModule(readFileSync(new URL('app/[locale]/art-history/guides/[id]/page.tsx',root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const testModule={exports:{}};
vm.runInNewContext(compiled,{module:testModule,exports:testModule.exports,require:n=>{
 if(n==='@/lib/data/topics.json')return topics;
 if(n==='@/lib/data/genealogy.json')return genealogy;
 if(n==='@/lib/topic-images')return {topicIllustrationId:()=>undefined};
 if(n==='@/components/history-illustration')return {HistoryIllustration:()=>null};
 if(n==='@/components/topic-illustration')return {TopicIllustration:()=>null};
 if(n==='next/navigation')return {notFound:()=>{throw Error('not found');}};
 if(n==='@/lib/i18n')return {isLocale:l=>['zh','en'].includes(l),localizedPath:(p,l)=>'/'+l+p,siteOrigin:'https://example.test'};
 return require(n);
}});
test('the generative reading path resolves unique stable nodes and both languages render direct record links',async()=>{
 assert.equal(new Set(guide.nodeIds).size,guide.nodeIds.length);
 const grouped=guide.nodeGroups.flatMap(group=>group.nodeIds);
 assert.deepEqual([...grouped].sort((a,b)=>a.localeCompare(b)),[...guide.nodeIds].sort((a,b)=>a.localeCompare(b)));
 for(const id of guide.nodeIds)assert.ok(genealogy.records.some(n=>n.id===id),id);
 for(const locale of ['zh','en']){
  const html=renderToStaticMarkup(await testModule.exports.default({params:Promise.resolve({locale,id:guide.id})}));
  for(const id of guide.nodeIds)assert.ok(html.includes(`href="/${locale}/art-history/${id}"`),`${locale}/${id}`);
  assert.ok(html.includes(locale==='zh'?'沿这条线索阅读':'Follow this reading path'));
  for(const group of guide.nodeGroups){
   assert.ok(html.includes(`href="#${group.id}"`));
   assert.ok(html.includes(`id="${group.id}"`));
   assert.ok(html.includes(group.title[locale]));
  }
  for(const reference of guide.references)assert.ok(html.includes(`href="${reference.url}"`));
  if(locale==='en')assert.ok(!/[\u3400-\u9fff]/u.test(html));
 }
});

// A contextual work must remain discoverable without becoming a timeline stop.
test('contextual crypto works appear once in thematic discussion and retained milestones stay distinct',async()=>{
 const groups=guide.contextGroups;const ids=groups.flatMap(g=>g.nodeIds);assert.equal(ids.length,55);assert.equal(new Set(ids).size,55);
 assert.equal(guide.nodeIds.length,46);
 for(const id of ids){const node=genealogy.records.find(n=>n.id===id);assert.equal(node.timelineRole,'context');assert.ok(!guide.nodeIds.includes(id));}
 for(const locale of ['zh','en']){const html=renderToStaticMarkup(await testModule.exports.default({params:Promise.resolve({locale,id:guide.id})}));
  for(const group of groups){assert.ok(html.includes(group.body[locale]));assert.ok(html.includes(`id="${group.id}"`));}
  for(const id of ids){assert.ok(html.includes(`id="work-${id}"`));assert.ok(html.includes(`href="/${locale}/art-history/${id}"`));}
 }
});
