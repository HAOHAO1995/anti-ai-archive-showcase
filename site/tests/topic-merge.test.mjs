import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {mergedTopicRedirect} from '../lib/topic-redirect.mjs';
import topics from '../lib/data/topics.json' with {type:'json'};
import images from '../lib/data/topic-illustrations.json' with {type:'json'};
test('all three previous categories retain deep links, selection, filters and language',()=>{
 for(const locale of ['en','zh'])for(const [old,intro] of Object.entries({'anti-ai-events':'anti-ai-movements','creative-labour-ai-rights':'creative-labour','ai-art':'ai-art-research'})){
  const url=new URL(mergedTopicRedirect(`https://salondesrefuses.cn/${locale}/topics/${old}?selected=guide&q=voice&view=gallery#topic-catalogue`));
  assert.equal(url.pathname,`/${locale}/topics/culture-governance`);assert.equal(url.searchParams.get('selected'),'guide-'+intro);assert.equal(url.searchParams.get('q'),'voice');assert.equal(url.hash,'#topic-catalogue');
  assert.equal(new URL(mergedTopicRedirect(`https://salondesrefuses.cn/${locale}/topics/${old}/guides/overview`)).pathname,`/${locale}/topics/culture-governance/guides/${intro}`);
 }
 assert.equal(new URL(mergedTopicRedirect('https://salondesrefuses.cn/en/topics/ai-art/references/src-0768')).pathname,'/en/topics/culture-governance/references/src-0768');
 assert.equal(mergedTopicRedirect('https://salondesrefuses.cn/en/topics/ai-art-history'),null);
});
test('merged guide retains distinct bodies, case sets and source illustrations',()=>{
 assert.deepEqual(topics.map(t=>t.slug),['ai-art-history','culture-governance']);
 const t=topics[1];for(const id of ['ai-art-research','definition','questions','history','generative-comparison','anti-ai-movements','demands','evidence','comparison','creative-labour','replicas','bargaining','institutions','permission'])assert.ok(t.sections.find(s=>s.id===id),id);
 assert.equal(new Set(t.caseIds).size,t.caseIds.length);
 for(const id of ['guide-ai-art-research','guide-anti-ai-movements','guide-creative-labour'])assert.ok(images.records.some(v=>v.recordIds.includes('culture-governance:'+id)),id);
});
test('global navigation and locale helpers do not import the archive or full translation catalogue',()=>{
 const shell=fs.readFileSync(new URL('../components/site-shell.tsx',import.meta.url),'utf8');const locale=fs.readFileSync(new URL('../lib/locale.ts',import.meta.url),'utf8');
 assert.ok(!shell.includes("from '@/lib/i18n'"));assert.ok(!locale.includes('import '));assert.ok(shell.includes('topic-navigation.json'));
});
