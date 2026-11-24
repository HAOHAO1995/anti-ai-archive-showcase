import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=name=>JSON.parse(readFileSync(new URL('../lib/data/'+name+'.json',import.meta.url)));
test('lightweight rail metadata preserves every stable ID, timeline role and displayed navigation field',()=>{
 const source=load('genealogy'),light=load('genealogy-navigation');
 assert.equal(light.records.length,source.records.length);
 for(let i=0;i<source.records.length;i++){
  for(const key of ['id','year','title','shortTitle','date','kind','timelineRole','contextParentId'])assert.deepEqual(light.records[i][key],source.records[i][key],source.records[i].id+' '+key);
  assert.equal('sourceRefs' in light.records[i],false);
 }
 assert.ok(JSON.stringify(light).length<JSON.stringify(source).length*.25);
});
