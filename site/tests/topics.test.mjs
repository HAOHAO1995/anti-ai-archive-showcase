import test from 'node:test';
import assert from 'node:assert/strict';
import topics from '../lib/data/topics.json' with {type:'json'};
import archive from '../lib/data/archive.json' with {type:'json'};
import {checkTopics} from '../scripts/lib/check-topics.mjs';
test('guide publication blocks missing English, broken case references and unsynchronised source changes',()=>{
 assert.deepEqual(checkTopics(topics,archive).errors,[]);
 const missing=structuredClone(topics);missing[0].sections[0].body.en='';assert.ok(checkTopics(missing,archive).errors.some(e=>e.includes('missing en')));
 const broken=structuredClone(topics);broken[1].caseIds.push('case-does-not-exist');assert.ok(checkTopics(broken,archive).errors.some(e=>e.includes('missing case')));
 const stale=structuredClone(topics);stale[0].sections[0].body.zh+='新增论述。';assert.ok(checkTopics(stale,archive).errors.some(e=>e.includes('reconciled')));
});
test('expanded overview blocks missing translation and dangling primary-source references',()=>{
 const copy=structuredClone(topics),topic=copy.find(t=>t.slug==='culture-governance');
 topic.sections.find(s=>s.id==='anti-ai-movements').subsections[0].body.en='';
 topic.sections.find(s=>s.id==='anti-ai-movements').subsections[1].sourceIds.push('missing-primary-source');
 const errors=checkTopics(copy,archive).errors;
 assert.ok(errors.some(e=>e.includes('anti-ai-movements/positions/body: missing en')));
 assert.ok(errors.some(e=>e.includes('missing source missing-primary-source')));
});
