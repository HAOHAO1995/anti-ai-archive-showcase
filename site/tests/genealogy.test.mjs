import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {checkGenealogy} from '../scripts/lib/check-genealogy.mjs';
import {indexFromPosition,indexAfterKey,chronologicalNumber,timelineRecords} from '../lib/genealogy-navigation.mjs';
const data=JSON.parse(await readFile(new URL('../lib/data/genealogy.json',import.meta.url),'utf8'));
test('all reconciled master nodes have distinct bilingual cards, chronology, provenance and safe source links',()=>{
 assert.deepEqual(checkGenealogy(data).errors,[]);
 assert.equal(data.records[0].order,1943);
 assert.equal(Math.floor(data.records.at(-1).order),2026);
 assert.equal(data.publicationState,'prototype');
});
test('publication checks reject missing nodes, untranslated cards, unsafe links and stale translations',()=>{
 for(const [mutate,expected] of [
  [d=>d.records.pop(),/missing (master node|source entry)/],
  [d=>d.records[0].summary.en='',/summary.en/],
  [d=>d.records[0].sourceUrl='javascript:alert(1)',/unsafe sourceUrl/],
  [d=>d.records[0].summary.zh+='修订内容',/translation must be reconciled/],
 ]){const copy=structuredClone(data);mutate(copy);assert.ok(checkGenealogy(copy).errors.some(e=>expected.test(e)));}
});
test('vertical ruler reaches every node including multiple entries in the same year',()=>{
 const count=data.records.length;
 for(let i=0;i<count;i++)assert.equal(indexFromPosition(20+i/(count-1)*600,20,600,count),i);
 assert.equal(indexFromPosition(-50,20,600,count),0);
 assert.equal(indexFromPosition(900,20,600,count),count-1);
 assert.equal(indexAfterKey('End',0,count),count-1);
 assert.equal(indexAfterKey('ArrowDown',count-1,count),count-1);
 assert.equal(indexAfterKey('Home',count-1,count),0);
 assert.equal(indexAfterKey('ArrowUp',0,count),0);
 assert.equal(indexAfterKey('PageDown',2,count),12);
 const sameYear=data.records.findIndex((r,i)=>i>0&&r.year===data.records[i-1].year);
 assert.equal(indexAfterKey('ArrowDown',sameYear-1,count),sameYear);
 assert.equal(indexAfterKey('Tab',1,count),null);
});

test('web research has a real locator rather than an invented PDF page number',()=>{
 const web=data.records.find(r=>r.sourceDocumentId==='historical-expansion-2026-10-02');assert.ok(web);assert.equal(web.page,null);assert.equal(web.sourceRefs[0].page,null);
 const copy=structuredClone(data);copy.records.find(r=>r.id===web.id).sourceRefs[0].locator.en='';assert.ok(checkGenealogy(copy).errors.some(e=>e.includes('invalid reference document/page')));
 const old=structuredClone(data);old.records[0].page=null;assert.ok(checkGenealogy(old).errors.some(e=>e.includes('invalid master page')));
});

test('supplement reconciles all 195 entries and keeps product, API and model stages distinct',()=>{
 const references=data.records.flatMap(r=>r.sourceRefs.filter(ref=>ref.documentId==='visual-releases-2021-2026').map(ref=>[ref.entryId,r.id]));
 const map=new Map(references);assert.equal(references.length,195);assert.equal(map.size,195);
 assert.equal(data.records.filter(r=>Number(r.id)>140 && r.sourceRefs.some(ref=>ref.documentId==='visual-releases-2021-2026')).length,82);
 assert.equal(map.get('R016'),'082');assert.equal(map.get('R017'),'082');
 assert.notEqual(map.get('R016'),map.get('R041'));
 assert.notEqual(map.get('R077'),map.get('R080'));
 assert.notEqual(map.get('R095'),map.get('R104'));assert.notEqual(map.get('R104'),map.get('R112'));
 assert.notEqual(map.get('R073'),map.get('R096'));
 assert.equal(data.records.find(r=>r.id===map.get('R192')).date.en,'2026-02-12');
 assert.match(data.records.find(r=>r.id===map.get('R044')).dateNote.en,/unresolved/);
 const copy=structuredClone(data);copy.records.find(r=>r.id===map.get('R192')).sourceRefs=[];
 assert.ok(checkGenealogy(copy).errors.some(e=>e.includes('missing source entry')));
});


test('public numbering is sequential by chronology without changing historical identities',()=>{
 const timeline=timelineRecords(data.records);
 for(let i=0;i<timeline.length;i++){
  assert.equal(chronologicalNumber(data.records,timeline[i].id),String(i+1).padStart(3,'0'));
  if(i)assert.ok(timeline[i].order>=timeline[i-1].order);
 }
 const retrospective=data.records.find(r=>r.id==='255');
 assert.ok(retrospective);assert.equal(chronologicalNumber(data.records,'255'),'');
 assert.equal(timeline.length,336);assert.equal(data.records.length-timeline.length,55);
 assert.equal(chronologicalNumber(data.records,'missing'),'');
});

test('Irreverencias is placed at its April 2025 opening rather than the end of the year',()=>{
 const at=id=>data.records.findIndex(r=>r.id===id);
 assert.ok(at('362')>at('131'));assert.ok(at('362')<at('132'));assert.equal(data.records[at('362')].order,2025.0402);
});
