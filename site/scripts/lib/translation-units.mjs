import {createHash} from 'node:crypto';
export const contentFields={events:['title','summary','what_changed','historical_significance','notes'],cases:['title','summary','research_significance','notes'],documents:['title','description','material_description','translation_zh','original_excerpt'],sources:['title','locator','notes']};
export const textId=text=>createHash('sha256').update(text).digest('hex').slice(0,20);
export function translationUnits(data){
 const units=new Map();
 function add(text,sourceLanguage,ref){
  if(typeof text!=='string'||!text.trim())return;
  const id=textId(text);const language=/[\u3040-\u30ff]/u.test(text)?'ja':(sourceLanguage!=='en'&&sourceLanguage!=='zh'?sourceLanguage:(/[\u3400-\u9fff]/u.test(text)?'zh':sourceLanguage));
  const existing=units.get(id);if(existing){existing.refs.push(ref);return;}
  units.set(id,{id,text,sourceLanguage:language,refs:[ref]});
 }
 for(const [kind,fields] of Object.entries(contentFields))for(const row of data[kind]){
  for(const field of fields)add(row[field],(field==='title'||field==='original_excerpt')&&row.language?row.language:'zh',`${row.id}.${field}`);
  for(const [i,e] of (row.evidence??[]).entries())for(const field of ['claim','locator'])add(e[field],'zh',`${row.id}.evidence.${i}.${field}`);
 }
 for(const row of data.people)if(/[\u3400-\u9fff]/u.test(row.name))add(row.name,'zh',`${row.id}.name`);
 for(const row of [...data.documents,...data.sources])for(const field of ['publisher','author','creator_credit'])if(/[\u3400-\u9fff]/u.test(row[field]??''))add(row[field],'zh',`${row.id}.${field}`);
 for(const [key,value] of Object.entries(data.taxonomy.claims_status))add(value,'zh',`taxonomy.claims_status.${key}`);
 for(const [key,value] of Object.entries(data.taxonomy.fields))add(value,'zh',`taxonomy.fields.${key}`);
 return [...units.values()];
}
