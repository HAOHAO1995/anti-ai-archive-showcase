import {translationUnits,textId} from './translation-units.mjs';
export function checkContent(data,catalog){
 const errors=[];const groups=['cases','events','documents','sources','people'];const ids={};
 for(const k of groups){ids[k]=new Set();for(const row of data[k]){if(!row.id||ids[k].has(row.id))errors.push(`${k}: missing/duplicate id ${row.id}`);ids[k].add(row.id);}}
 const ref=(kind,id,where)=>{if(!ids[kind].has(id))errors.push(`${where}: missing ${kind} reference ${id}`)};
 for(const e of data.events){ref('cases',e.case_id,e.id);if(!e.date)errors.push(`${e.id}: chronology requires a date`);for(const id of [...e.primary_sources,...e.secondary_sources,...e.evidence.map(v=>v.source_id)])ref('sources',id,e.id);for(const id of e.document_ids)ref('documents',id,e.id);for(const id of [...e.actors,...e.organizations])ref('people',id,e.id);}
 for(const c of data.cases){for(const id of c.related_cases)ref('cases',id,c.id);for(const id of [...c.primary_sources,...c.secondary_sources])ref('sources',id,c.id);}
 for(const d of data.documents){for(const id of d.source_ids)ref('sources',id,d.id);for(const id of d.case_ids)ref('cases',id,d.id);if(!d.language)errors.push(`${d.id}: original language missing`);if(d.original_excerpt&&!d.translation_zh)errors.push(`${d.id}: original excerpt lacks translated excerpt`);}
 for(const s of data.sources){try{const u=new URL(s.original_url);if(!['http:','https:'].includes(u.protocol))throw Error();}catch{errors.push(`${s.id}: invalid original URL`)}if(!s.language)errors.push(`${s.id}: original language missing`);}
 const units=translationUnits(data);
 for(const u of units){const e=catalog[u.text];for(const l of ['zh','en'])if(!e?.[l]?.trim())errors.push(`${u.refs[0]}: missing ${l} translation (${u.id})`);if(e&&(e.id!==textId(u.text)||e.sourceText!==u.text))errors.push(`${u.refs[0]}: translation source mismatch`);}
 return {errors,textUnits:units.length,counts:Object.fromEntries(groups.map(k=>[k,data[k].length]))};
}
