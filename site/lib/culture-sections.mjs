import definitions from './data/culture-sections.json' with {type:'json'};
// Membership follows the three pre-merge reading paths, not keyword matching.
// Events inherit their case's memberships, including intentional overlaps.
export function cultureSections(entries,events,locale){
 const caseForEvent=new Map(events.map(e=>[e.id,e.case_id]));
 return definitions.map(section=>({
  id:section.id,title:section.title[locale],description:section.description[locale],introId:section.introId,
  entryIds:entries.filter(e=>e.id==='guide'||section.guideIds.includes(e.id)||
   (section.id==='ai-art'&&(e.kind==='reference'||e.id==='guide-references'))||
   section.caseIds.includes(e.kind==='event'?caseForEvent.get(e.id):e.id)).map(e=>e.id)
 }));
}
