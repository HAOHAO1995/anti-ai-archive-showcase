import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {nearestHistoryCard,historyHashId} from '../lib/history-position.mjs';
const records=JSON.parse(await readFile(new URL('../lib/data/genealogy.json',import.meta.url),'utf8')).records;
test('scroll positions distinguish every node, including multiple nodes in a single year',()=>{
 for(let active=0;active<records.length;active++){
  const rows=records.map((r,i)=>({id:r.id,top:(i-active)*240+80,bottom:(i-active)*240+300,height:220}));
  assert.equal(nearestHistoryCard(rows,180,0,800,null),records[active].id);
 }
});
test('guides, hidden mobile panes and offscreen cards do not steal the timeline position',()=>{
 assert.equal(nearestHistoryCard([{id:'001',top:700,bottom:900,height:200}],180,0,800,null),null);
 assert.equal(nearestHistoryCard([{id:'001',top:0,bottom:0,height:0}],180,0,800,null),null);
 assert.equal(nearestHistoryCard([{id:'001',top:-400,bottom:-200,height:200}],180,0,800,null),null);
});
test('grid keeps the selected node when two cards share the same row; filtered IDs do not renumber',()=>{
 const rows=[{id:'079',top:80,bottom:300,height:220},{id:'141',top:80,bottom:300,height:220}];
 assert.equal(nearestHistoryCard(rows,180,0,800,'141'),'141');
 assert.equal(nearestHistoryCard(rows.slice(1),180,0,800,null),'141');
});
test('legacy hashes retain stable node identity and ignore guides or malformed input',()=>{
 assert.equal(historyHashId('#node-222'),'222');assert.equal(historyHashId('#genealogy-001'),'001');
 for(const hash of ['#scope','#topic-guide','#node-1','#node-001extra',''])assert.equal(historyHashId(hash),null);
});
