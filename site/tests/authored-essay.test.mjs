import {assetInfo} from './asset-info.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const essay=JSON.parse(readFileSync(new URL('lib/data/authored/cybernetics-control-2026.json',root),'utf8'));
const catalogue=JSON.parse(readFileSync(new URL('lib/data/authored-documents.json',root),'utf8'));
test('author-supplied bilingual research retains original file, attribution and all sections',()=>{
 assert.equal(essay.author,'陈浩浩 CHEN HAOHAO');assert.equal(essay.year,'2026');
 const bytes=assetInfo(new URL('public'+essay.sourceDownload,root));assert.equal(bytes.sha256,essay.sourceSha256);
 for(const lang of ['zh','en']){const blocks=essay.blocks[lang];assert.equal(blocks.length,37);assert.equal(blocks.filter(b=>b.type==='heading').length,9);for(const b of blocks)assert.equal(b.runs.map(r=>r.text).join(''),b.text);}
 assert.equal(essay.blocks.zh[0].text,'摘要');assert.equal(essay.blocks.en[0].text,'Abstract');
 assert.ok(essay.translation.origin.includes('supplied by the author'));
});
test('document catalogue pins the new research first while retaining the older commentary',()=>{
 assert.equal(catalogue[0].id,essay.id);assert.equal(catalogue[0].pinned,true);assert.equal(catalogue[0].author,essay.author);
 assert.equal(new Set(catalogue.map(d=>d.id)).size,catalogue.length);assert.ok(catalogue.some(d=>d.id==='disco-ai-2023'));
 for(const d of catalogue)assert.ok(d.title.zh&&d.title.en&&d.description.zh&&d.description.en&&/^\d{4}$/.test(d.year));
});
