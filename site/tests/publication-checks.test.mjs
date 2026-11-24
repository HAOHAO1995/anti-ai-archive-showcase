import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {checkContent} from '../scripts/lib/check-content.mjs';
const data=JSON.parse(await readFile(new URL('../lib/data/archive.json',import.meta.url),'utf8'));
const catalog=JSON.parse(await readFile(new URL('../lib/data/i18n/translations.json',import.meta.url),'utf8'));
test('current snapshot has both languages and valid internal references',()=>assert.deepEqual(checkContent(data,catalog).errors,[]));
test('case-linked background interviews remain discoverable without an invented dated event',()=>{
 const interview=data.documents.find(d=>d.id==='doc-0333');
 assert.ok(interview,'Viazovska background interview must survive archive synchronisation');
 assert.equal(interview.date,null);
 assert.deepEqual(interview.event_ids,[]);
 assert.ok(interview.case_ids.includes('case-0152'));
 assert.ok(interview.source_ids.includes('src-0345'));
});
test('an edited paragraph invalidates its old translation',()=>{const changed=structuredClone(data);changed.events[0].summary+=' 新增研究陈述。';assert.ok(checkContent(changed,catalog).errors.some(e=>e.includes('missing en translation')));});
test('missing English blocks publication even when Chinese is present',()=>{const changed=structuredClone(catalog);delete changed[data.events[0].summary].en;assert.ok(checkContent(data,changed).errors.some(e=>e.includes('missing en translation')));});
test('missing original URL and broken source relationship block publication',()=>{const changed=structuredClone(data);changed.sources[0].original_url='';changed.events[0].evidence[0].source_id='missing-source';const errors=checkContent(changed,catalog).errors;assert.ok(errors.some(e=>e.includes('invalid original URL')));assert.ok(errors.some(e=>e.includes('missing sources reference')));});
