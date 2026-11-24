import {createHash} from 'node:crypto';
export function topicTranslationHash(topic){return createHash('sha256').update(JSON.stringify([topic.title.zh,topic.shortTitle.zh,topic.description.zh,topic.intro.zh,...(topic.indexDescription?[topic.indexDescription.zh]:[]),...(topic.overview?[topic.overview.title.zh,topic.overview.body.zh,...topic.overview.subsections.flatMap(s=>[s.title.zh,s.body.zh])]:[]),...topic.sections.flatMap(s=>[s.title.zh,s.body.zh,...(s.subsections??[]).flatMap(part=>[part.title.zh,part.body.zh]),...(s.contextGroups??[]).flatMap(part=>[part.title.zh,part.body.zh])])])).digest('hex');}
export function checkTopics(topics,archive){
 const errors=[],slugs=new Set(),caseIds=new Set(archive.cases.map(c=>c.id));
 const checkPair=(value,label)=>{for(const locale of ['zh','en'])if(typeof value?.[locale]!=='string'||!value[locale].trim())errors.push(`${label}: missing ${locale}`);};
 for(const t of topics){
  if(!/^[a-z]+(?:-[a-z]+)*$/.test(t.slug)||slugs.has(t.slug))errors.push(`topics/${t.slug}: invalid or duplicate slug`);slugs.add(t.slug);
  for(const field of ['title','shortTitle','description','intro'])checkPair(t[field],`topics/${t.slug}/${field}`);
  if(t.indexDescription)checkPair(t.indexDescription,`topics/${t.slug}/indexDescription`);
  if(t.overview){checkPair(t.overview.title,`topics/${t.slug}/overview/title`);checkPair(t.overview.body,`topics/${t.slug}/overview/body`);for(const s of t.overview.subsections){checkPair(s.title,`topics/${t.slug}/overview/${s.id}/title`);checkPair(s.body,`topics/${t.slug}/overview/${s.id}/body`);for(const id of s.sourceIds??[])if(!archive.sources.some(source=>source.id===id))errors.push(`topics/${t.slug}/overview: missing source ${id}`);}}
  const sectionIds=new Set();
  for(const s of t.sections){if(!s.id||sectionIds.has(s.id))errors.push(`topics/${t.slug}: duplicate section ID`);sectionIds.add(s.id);checkPair(s.title,`topics/${t.slug}/${s.id}/title`);checkPair(s.body,`topics/${t.slug}/${s.id}/body`);for(const part of [...(s.subsections??[]),...(s.contextGroups??[])]){checkPair(part.title,`topics/${t.slug}/${s.id}/${part.id}/title`);checkPair(part.body,`topics/${t.slug}/${s.id}/${part.id}/body`);for(const id of part.sourceIds??[])if(!archive.sources.some(source=>source.id===id))errors.push(`topics/${t.slug}/${s.id}: missing source ${id}`);}}
  for(const id of t.caseIds)if(!caseIds.has(id))errors.push(`topics/${t.slug}: missing case ${id}`);
  for(const section of t.sections)for(const id of section.caseIds??[])if(!caseIds.has(id))errors.push(`topics/${t.slug}/${section.id}: missing case ${id}`);
  if(t.translationOrigin!=='archive-ai-assisted'||!['pending','reviewed'].includes(t.translationReview))errors.push(`topics/${t.slug}: missing translation provenance`);
  if(t.translationContentHash!==topicTranslationHash(t))errors.push(`topics/${t.slug}: translation must be reconciled with changed Chinese guide`);
 }
 return {errors,counts:{guides:topics.length,localizedPages:topics.length*2}};
}
