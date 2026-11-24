import test from 'node:test';
import assert from 'node:assert/strict';
import {cultureSections} from '../lib/culture-sections.mjs';
import {mergedTopicRedirect} from '../lib/topic-redirect.mjs';
import topics from '../lib/data/topics.json' with {type:'json'};
import archive from '../lib/data/archive.json' with {type:'json'};
import refs from '../lib/data/ai-research-references.json' with {type:'json'};
const topic=topics.find(t=>t.slug==='culture-governance');
const entries=[{id:'guide',kind:'guide'},...topic.sections.map(s=>({id:'guide-'+s.id,kind:'guide'})),{id:'guide-references',kind:'guide'},...refs.map(r=>({id:r.id,kind:'reference'}))];
for(const id of topic.caseIds){entries.push({id,kind:'case'});entries.push(...archive.events.filter(e=>e.case_id===id).sort((a,b)=>(a.date??'').localeCompare(b.date??'')).filter((e,index)=>index<2||topic.eventIds?.includes(e.id)).map(e=>({id:e.id,kind:'event'})));}
test('newly accessioned events remain discoverable beyond the first two historical case events',()=>{
 const groups=cultureSections(entries,archive.events,'en');
 for(const id of ['evt-0462','evt-0463','evt-0464','evt-0465'])for(const group of groups.slice(1))assert.ok(group.entryIds.includes(id));
});
test('three sections retain every published card and all eight research references',()=>{
 for(const locale of ['en','zh']){
  const groups=cultureSections(entries,archive.events,locale);
  assert.equal(groups.length,3);
  assert.deepEqual(new Set(groups.flatMap(s=>s.entryIds)),new Set(entries.map(e=>e.id)));
  for(const group of groups){assert.equal(group.entryIds.length,new Set(group.entryIds).size);assert.ok(group.entryIds.includes(group.introId));assert.ok(group.title);assert.ok(group.description);}
  for(const ref of refs){assert.ok(groups[0].entryIds.includes(ref.id));assert.ok(!groups[1].entryIds.includes(ref.id));}
 }
});
test('shared cases and their events appear under both relevant reading paths',()=>{
 const groups=cultureSections(entries,archive.events,'en');
 for(const group of groups.slice(1)){
  assert.ok(group.entryIds.includes('case-0006'));
  const event=entries.find(e=>e.kind==='event'&&archive.events.find(a=>a.id===e.id)?.case_id==='case-0006');
  assert.ok(event);assert.ok(group.entryIds.includes(event.id));
 }
});
test('legacy category links open their corresponding section and retain filters',()=>{
 for(const id of ['ai-art','anti-ai-events','creative-labour-ai-rights'])for(const locale of ['en','zh']){
  const target=new URL(mergedTopicRedirect(`https://salondesrefuses.cn/${locale}/topics/${id}?view=gallery`));
  assert.equal(target.searchParams.get('section'),id);assert.equal(target.searchParams.get('view'),'gallery');
 }
 assert.equal(new URL(mergedTopicRedirect('https://salondesrefuses.cn/en/topics/ai-art?section=anti-ai-events')).searchParams.get('section'),'anti-ai-events');
});

test('October16 accessions are discoverable in their specific cultural paths',()=>{
 const groups=cultureSections(entries,archive.events,'en');
 for(const [index,ids] of [[0,['evt-0467','evt-0468','evt-0472']],[1,['evt-0470']],[2,['evt-0466','evt-0468','evt-0469','evt-0470','evt-0471','evt-0472','evt-0473']]])for(const id of ids)assert.ok(groups[index].entryIds.includes(id),id);
});
