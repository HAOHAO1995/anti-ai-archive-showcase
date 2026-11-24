import {createHash} from 'node:crypto';
export function checkHistoryEssays(data,genealogy){
 const errors=[],seen=new Set();
 const bilingual=(value,label)=>{for(const locale of ['zh','en'])if(!value?.[locale]?.trim())errors.push(`${label}: missing ${locale}`);};
 for(const r of data.records??[]){
  if(seen.has(r.nodeId))errors.push(`${r.nodeId}: duplicate essay`);seen.add(r.nodeId);
  const n=genealogy.records.find(n=>n.id===r.nodeId);
  if(!n){errors.push(`${r.nodeId}: unknown node`);continue;}
  const hash=createHash('sha256').update(JSON.stringify([n.title,n.summary,n.date,n.actors,n.sourceUrl])).digest('hex');
  if(hash!==r.nodeRevision)errors.push(`${r.nodeId}: stale historical context`);
  bilingual(r.deck,r.nodeId+' deck');bilingual(r.limits,r.nodeId+' limits');
  if(!r.revisedAt||!r.factReview||!r.translationOrigin||!r.translationReview)errors.push(`${r.nodeId}: missing provenance`);
  if(!['editorial-preview','research-account'].includes(r.status))errors.push(`${r.nodeId}: unknown account status`);
  const sourceIds=new Set(),sectionIds=new Set();
  for(const s of r.sources??[]){
   if(sourceIds.has(s.id))errors.push(`${r.nodeId}: duplicate source`);sourceIds.add(s.id);
   if(!/^https:\/\//.test(s.url)||!s.originalTitle||!s.language||!s.checkedAt||!s.review)errors.push(`${r.nodeId}: incomplete source`);
   bilingual(s.title,`${r.nodeId}/${s.id} title`);bilingual(s.locator,`${r.nodeId}/${s.id} locator`);
  }
  if(!r.sections?.length)errors.push(`${r.nodeId}: empty account`);
  for(const s of r.sections??[]){
   if(sectionIds.has(s.id)||!s.id)errors.push(`${r.nodeId}: invalid section identifier`);sectionIds.add(s.id);
   bilingual(s.heading,`${r.nodeId}/${s.id}`);
   if(!s.paragraphs?.length)errors.push(`${r.nodeId}/${s.id}: empty section`);
   for(const p of s.paragraphs??[])bilingual(p,`${r.nodeId}/${s.id} paragraph`);
   if(!s.sourceIds?.length||s.sourceIds.some(id=>!sourceIds.has(id)))errors.push(`${r.nodeId}/${s.id}: unsupported source reference`);
  }
  for(const related of r.related??[]){if(!genealogy.records.some(n=>n.id===related.nodeId))errors.push(`${r.nodeId}: unknown related node`);bilingual(related.reason,r.nodeId+' related reason');}
 }
 for(const n of genealogy.records)if(!seen.has(n.id))errors.push(`${n.id}: missing bilingual historical account`);
 const paragraphs=new Map();
 for(const r of data.records??[])for(const s of r.sections??[])for(const p of s.paragraphs??[]){
  const text=p.en?.trim();if(text&&paragraphs.has(text)&&paragraphs.get(text)!==r.nodeId)errors.push(`${r.nodeId}: body paragraph duplicates ${paragraphs.get(text)}`);
  if(text)paragraphs.set(text,r.nodeId);
 }
 return {counts:{expanded:data.records?.length??0,total:genealogy.records.length},errors};
}
