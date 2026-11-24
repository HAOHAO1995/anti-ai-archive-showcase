import {createHash} from 'node:crypto';
export function checkGenealogy(data){
 const errors=[];const records=data.records??[];const ids=new Set();
 if(!Number.isInteger(data.sourceNodeCount)||data.sourceNodeCount<140||records.length!==data.sourceNodeCount)errors.push('genealogy: node count does not match the reconciled catalogue');
 const documents=new Map((data.sourceDocuments??[]).map(d=>[d.id,d]));const references=new Map();
 const contextual=records.filter(r=>r.timelineRole==='context');
 if(data.timelineNodeCount!==records.length-contextual.length||data.contextRecordCount!==contextual.length)errors.push('genealogy: timeline/context counts are stale');
 for(const [index,r] of records.entries()){
  const prefix=`genealogy/${r.id}`;
  if(!/^\d{3}$/.test(r.id)||ids.has(r.id))errors.push(`${prefix}: invalid or duplicate ID`);
  ids.add(r.id);
  if(r.timelineRole&&!['milestone','context'].includes(r.timelineRole))errors.push(`${prefix}: invalid timeline role`);
  if(r.timelineRole==='milestone'&&(!r.timelineRationale?.zh||!r.timelineRationale?.en))errors.push(`${prefix}: missing bilingual selection rationale`);
  if(r.timelineRole==='context'&&(!r.contextGuide||!r.contextGroup||!records.some(n=>n.id===r.contextParentId&&n.timelineRole!=='context')))errors.push(`${prefix}: invalid thematic placement`);
  if(!Number.isFinite(r.order)||(index&&r.order<records[index-1].order))errors.push(`${prefix}: invalid chronology`);
  for(const field of ['title','shortTitle','date','summary'])for(const lang of ['zh','en']){
   const text=r[field]?.[lang];
   if(typeof text!=='string'||text.trim().length<(field==='summary'?(lang==='en'?80:30):1))errors.push(`${prefix}: missing substantive ${field}.${lang}`);
  }
  for(const field of ['sourceUrl','originalSourceUrl']){try{const url=new URL(r[field]);if(url.protocol!=='https:'||url.username||url.password)throw Error();}catch{errors.push(`${prefix}: unsafe ${field}`);}}
  if(!r.originalTitle||!r.originalLanguage||!r.actors||!r.sourceLanguage)errors.push(`${prefix}: missing original metadata`);
  if(documents.get(r.sourceDocumentId)?.format==='web-register'?r.page!==null:(!Number.isInteger(r.page)||r.page<1||r.page>50))errors.push(`${prefix}: invalid master page`);
  if(!['paper','official','catalogue','record'].includes(r.sourceKind))errors.push(`${prefix}: invalid source kind`);
  if(r.translationOrigin!=='archive-ai-assisted'||!['pending','reviewed'].includes(r.translationReview))errors.push(`${prefix}: missing translation provenance`);
  if(!['pending','release-date-confirmed','verified'].includes(r.sourceVerification))errors.push(`${prefix}: missing source verification state`);
  if(!documents.has(r.sourceDocumentId)||!r.sourceRefs?.length)errors.push(`${prefix}: missing master provenance`);
  for(const lang of ['zh','en'])if(!r.releaseType?.[lang])errors.push(`${prefix}: missing release type ${lang}`);
  for(const ref of r.sourceRefs??[]){
   const doc=documents.get(ref.documentId),key=ref.documentId+'/'+ref.entryId;
   if(!doc||(doc.format==='web-register'?(ref.page!==null||!ref.locator?.zh||!ref.locator?.en):(!Number.isInteger(ref.page)||ref.page<1||ref.page>doc.pageCount)))errors.push(`${prefix}: invalid reference document/page`);
   if(references.has(key))errors.push(`${prefix}: duplicate master reference ${key}`);references.set(key,r.id);
   if(!ref.originalTitle||!ref.originalDate||!ref.title?.zh||!ref.title?.en)errors.push(`${prefix}: incomplete reference metadata`);
   try{const u=new URL(ref.url);if(u.protocol!=='https:'||u.username||u.password)throw Error();}catch{errors.push(`${prefix}: unsafe reference URL`);}
  }
  const hash=createHash('sha256').update(r.summary?.zh??'').digest('hex');
  if(r.translationContentHash!==hash)errors.push(`${prefix}: translation must be reconciled with changed Chinese account`);
 }
 for(let n=1;n<=data.sourceNodeCount;n++){const id=String(n).padStart(3,'0');if(!ids.has(id))errors.push(`genealogy: missing master node ${id}`);}
 for(const doc of documents.values())for(let n=1;n<=doc.nodeCount;n++){
  const entry=(doc.id==='visual-releases-2021-2026'?'R':'')+String(n).padStart(3,'0');
  if(!references.has(doc.id+'/'+entry))errors.push(`genealogy: missing source entry ${doc.id}/${entry}`);
 }
 for(const lang of ['zh','en'])if(new Set(records.map(r=>r.summary?.[lang])).size!==records.length)errors.push(`genealogy: repeated ${lang} descriptions`);
 return {errors,counts:{nodes:records.length-contextual.length,contextualWorks:contextual.length,researchRecords:records.length,sourceEntries:references.size,bilingualDescriptions:records.filter(r=>r.summary?.zh&&r.summary?.en).length,translationsAwaitingReview:records.filter(r=>r.translationReview==='pending').length,sourcesAwaitingFullVerification:records.filter(r=>r.sourceVerification!=='verified').length}};
}
