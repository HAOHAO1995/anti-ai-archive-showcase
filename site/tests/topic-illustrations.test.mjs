import {assetInfo} from './asset-info.mjs';
import test from 'node:test';
import {mergedTopicRedirect} from '../lib/topic-redirect.mjs';
import assert from 'node:assert/strict';
import data from '../lib/data/topic-illustrations.json' with {type:'json'};
import authored from '../lib/data/authored-documents.json' with {type:'json'};
import archive from '../lib/data/archive.json' with {type:'json'};
import references from '../lib/data/ai-research-references.json' with {type:'json'};
import topics from '../lib/data/topics.json' with {type:'json'};
test('topic images have unique source assets, bilingual attribution and valid record mappings',()=>{
 const keys=new Set([...archive.cases,...archive.events,...archive.documents,...authored,...references].map(r=>r.id).concat(topics.flatMap(t=>['guide','guide-references',...t.sections.map(s=>'guide-'+s.id)].map(id=>t.slug+':'+id)))),mapped=new Set(),hashes=new Set();
 for(const v of data.records){
  assert.ok(v.recordIds.length);assert.ok(!hashes.has(v.sha256),v.id);hashes.add(v.sha256);
  assert.match(v.sourceUrl,/^https?:\/\//);
  for(const id of v.recordIds){const [slug,card]=id.split(':');const legacy=card&&mergedTopicRedirect('https://example.com/en/topics/'+slug+'?selected='+card);const target=legacy?new URL(legacy):null;assert.ok(keys.has(id)||(target&&keys.has('culture-governance:'+target.searchParams.get('selected'))),id);assert.ok(!mapped.has(id),id);mapped.add(id);}
  for(const field of ['caption','credit','sourceTitle'])for(const lang of ['zh','en'])assert.ok(v[field][lang].trim(),v.id+' '+field+' '+lang);
  assert.ok(!/[\u3400-\u9fff]/u.test(v.caption.en+v.credit.en+v.sourceTitle.en),v.id);
  const bytes=assetInfo(new URL('../public'+v.src,import.meta.url));assert.equal(bytes.sha256,v.sha256);
  assert.ok(v.width>0&&v.height>0);assert.equal(v.translationReview,'pending');
 }
});
