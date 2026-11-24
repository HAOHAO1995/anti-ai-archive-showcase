import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalRedirect} from '../lib/canonical-redirect.mjs';
import {recordDescription,recordGraph} from '../lib/search-records.mjs';
import {identityGraph} from '../lib/site-identity.mjs';
import {checkSearchHead} from '../scripts/lib/check-search-head.mjs';
test('search metadata in a streamed body fragment is rejected even when the HTML contains correct values',()=>{
 const metadata='<title>Archive</title><meta name="description" content="Research"><meta property="og:description" content="Research"><link rel="canonical" href="https://salondesrefuses.cn/en">'+[['en','en'],['zh-CN','zh'],['x-default','en']].map(([language,locale])=>`<link rel="alternate" href="https://salondesrefuses.cn/${locale}" hreflang="${language}">`).join('');
 assert.doesNotThrow(()=>checkSearchHead(`<html><head>${metadata}</head><body></body></html>`,'/en'));
 assert.throws(()=>checkSearchHead(`<html><head></head><body><div hidden>${metadata}</div></body></html>`,'/en'),/initial head/);
});
test('public aliases preserve record, filters and language without redirecting preview hosts',()=>{
 for(const root of ['http://salondesrefuses.cn','http://www.salondesrefuses.cn','https://www.salondesrefuses.cn'])assert.equal(canonicalRedirect(root+'/zh/events/evt-0392?q=AI&year=2023'),'https://salondesrefuses.cn/zh/events/evt-0392?q=AI&year=2023');
 for(const u of ['https://salondesrefuses.cn/en','http://127.0.0.1:18787/en','https://anti-ai-archive.chenhaohao1995.workers.dev/en','https://salondesrefuses.cn.example.org/en'])assert.equal(canonicalRedirect(u),null);
});
test('catalogue metadata retains attribution and never turns a record into an event or scholarly publication',()=>{
 const row={id:'evt-test',title:'Disputed claim',summary:'The union alleges a breach; this has not been independently verified. A later note follows.',date:'2023-01-01',updated_at:'2026-09-22',primary_sources:['s1'],secondary_sources:[]};
 const data={sources:[{id:'s1',original_url:'https://example.org/statement'}]};
 const description=recordDescription('events',row,data,'en');assert.ok(description.includes('not been independently verified'));
 const g=recordGraph('events',row,data,'en','https://salondesrefuses.cn');
 assert.equal(g['@graph'][0]['@type'],'WebPage');assert.equal(g['@graph'][0].dateModified,'2026-09-22');assert.equal(g['@graph'][0].datePublished,undefined);assert.equal(g['@graph'][0].author,undefined);
 assert.deepEqual(g['@graph'][0].citation,['https://example.org/statement']);
 const source={id:'s1',title:'Original statement',publisher:'Issuer',publication_date:null,access_date:'2026-09-22'};
 assert.equal(recordGraph('sources',source,data,'en','https://salondesrefuses.cn')['@graph'][0].dateModified,undefined);
});
test('project identity is shared between languages without inventing a person or professional credentials',()=>{
 const en=identityGraph('https://salondesrefuses.cn','en'),zh=identityGraph('https://salondesrefuses.cn','zh');
 assert.deepEqual(en['@graph'].map(n=>n['@id']),zh['@graph'].map(n=>n['@id']));
 assert.equal(en['@graph'][1].publisher['@id'],en['@graph'][0]['@id']);
 assert.equal(en['@graph'].some(n=>['Person','ScholarlyArticle'].includes(n['@type'])),false);
});
test('case snippets use current evidence counts instead of stale collection-status prose',()=>{
 const data={events:[{case_id:'case-test',date:'2024-01-01'},{case_id:'case-test',date:'2026-09-20'},{case_id:'another',date:'2022-01-01'}]};
 const en=recordDescription('cases',{id:'case-test',title:'Case',summary:'This case contains three dated events; see the timeline.'},data,'en');
 assert.ok(en.includes('2 dated events'));assert.ok(en.includes('2024-01-01–2026-09-20'));assert.ok(en.includes('remains under research'));assert.ok(!en.includes('three'));
 const zh=recordDescription('cases',{id:'case-test',title:'案例',summary:'本案已收录3个带日期节点；详见时间线。'},data,'zh');
 assert.ok(zh.includes('2 个带日期事件'));assert.ok(zh.includes('完整案史仍在补收'));
});
