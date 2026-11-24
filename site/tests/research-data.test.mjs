import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const metrics=JSON.parse(readFileSync(new URL('lib/data/public-release.json',root)));
const manifest=JSON.parse(readFileSync(new URL('../data/manifest.json',root)));
test('website counts match the canonical public export without counting guides as nodes',()=>{
 assert.deepEqual(metrics.counts,manifest.counts);
 const c=metrics.counts;assert.equal(c.history_records,c.history_timeline_nodes+c.history_context_records);
 assert.equal(c.documents_total,c.catalogue_documents+c.authored_documents);
 assert.equal(c.event_linked_entities,413);assert.equal(c.event_linked_entity_ids,414);
});
test('both languages expose downloads, licence boundaries and source limits',()=>{
 const page=readFileSync(new URL('app/[locale]/research/page.tsx',root),'utf8');
 for(const marker of ['Dataset','DataDownload','CC BY 4.0','MIT','third-party','第三方','independently','原始来源','date','download','CITATION.cff'])assert.ok(page.includes(marker),marker);
 assert.ok(page.includes('id="main"'));assert.ok(page.includes('languageMetadata'));
 const shell=readFileSync(new URL('components/site-shell.tsx',root),'utf8');assert.ok(shell.includes('href="/research"'));
});
