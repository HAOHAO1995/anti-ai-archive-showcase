import {createHash} from 'node:crypto';
export const visualTextHash=record=>createHash('sha256').update(JSON.stringify([record.title,record.summary,record.date,record.actors,record.sourceUrl])).digest('hex');
export function checkGenealogyIllustrations(data,genealogy){
 const errors=[],ids=new Set(),hashes=new Set(),counts={illustrated:0,sourceImages:0,paperPages:0,pending:0};
 for(const r of data.records??[]){
  if(ids.has(r.nodeId))errors.push(`${r.nodeId}: duplicate visual`);ids.add(r.nodeId);
  const node=genealogy.records.find(n=>n.id===r.nodeId);
  if(!node){errors.push(`${r.nodeId}: unknown node`);continue;}
  if(r.nodeRevision!==visualTextHash(node))errors.push(`${r.nodeId}: stale node visual context`);
  if(!['pending','source-image','paper-page'].includes(r.kind))errors.push(`${r.nodeId}: invalid kind`);
  for(const key of (r.kind==='pending'?['caption','title','date']:['caption','alt','credit','rights','title','date']))for(const locale of ['zh','en'])if(!r[key]?.[locale]?.trim())errors.push(`${r.nodeId}: missing ${key}.${locale}`);
  if(!/^https:\/\//.test(r.sourceUrl))errors.push(`${r.nodeId}: unsafe source URL`);
  if(r.kind!=='pending'){
   if(!/^\/images\/[\w\/-]+\.(jpg|png|webp)$/.test(r.src??''))errors.push(`${r.nodeId}: invalid local asset`);
   if(!(r.width>0&&r.height>0)||! /^[a-f0-9]{64}$/.test(r.sha256??''))errors.push(`${r.nodeId}: missing image integrity`);
   if(!r.assetReview||!/^https?:\/\//.test(r.originalImageUrl??''))errors.push(`${r.nodeId}: missing asset provenance`);
  }
  if(r.kind==='pending'){counts.pending++;if(r.src)errors.push(`${r.nodeId}: pending image must not be displayed`);}
  else{if(hashes.has(r.sha256))errors.push(`${r.nodeId}: reused image`);hashes.add(r.sha256);counts.illustrated++;counts[r.kind==='paper-page'?'paperPages':'sourceImages']++;}
 }
 for(const r of genealogy.records)if(!ids.has(r.id))errors.push(`${r.id}: missing visual`);
 return {counts,errors};
}
