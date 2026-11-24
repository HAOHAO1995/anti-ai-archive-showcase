import {chronologicalNumber} from '@/lib/genealogy-navigation.mjs';
import genealogy from '@/lib/data/genealogy.json';
import type {Locale} from '@/lib/i18n';
type RecordEntry=(typeof genealogy.records)[number];
export function GenealogyProvenance({record,locale,expanded=false}:{record:RecordEntry;locale:Locale;expanded?:boolean}){
 const zh=locale==='zh';
 return <div className="genealogy-provenance">
  <p>{chronologicalNumber(genealogy.records,record.id)?(zh?'主线节点 #':'Timeline entry #')+chronologicalNumber(genealogy.records,record.id):(zh?'专题作品资料':'Thematic work record')} · {record.releaseType[locale]}</p>
  <details open={expanded}><summary>{zh?'研究资料与补充出处':'Research materials & supplement references'} · {record.sourceRefs.length}</summary>
   {record.sourceRefs.map(ref=>{const doc=genealogy.sourceDocuments.find(d=>d.id===ref.documentId)!;return <p key={ref.documentId+ref.entryId}>{doc.title[locale]} · {ref.page===null?('locator' in ref?ref.locator?.[locale]:''):('p. '+ref.page)} · {ref.entryId}<br/><span>{zh?'原记日期':'Date as recorded'}: {ref.originalDate}</span><br/><a href={ref.url} target="_blank" rel="noreferrer">{ref.title[locale]} ↗</a><br/><span lang={record.originalLanguage}>{ref.originalTitle}</span></p>;})}
  </details>
  {'officialLanguageUrls' in record&&record.officialLanguageUrls&&<p><a href={record.officialLanguageUrls.zh} target="_blank" rel="noreferrer">{zh?'官方中文版本':'Official Chinese version'} ↗</a><br/><a href={record.officialLanguageUrls.en} target="_blank" rel="noreferrer">{zh?'官方英文版本':'Official English version'} ↗</a></p>}
  <p>{zh?'站内说明依据所列研究资料撰写，非外链全文译本；AI 辅助翻译，待独立人工审校。':'Archive account based on the listed research materials, not a full translation of the linked work. AI-assisted translation; independent human review pending.'}</p>
  <p>{record.sourceVerification==='verified'?(zh?'已按条目所列范围核读官方资料；核读范围与待复核事项见来源说明。':'Official material was read within the stated scope; see the source note for reading limits and outstanding checks.'):record.sourceVerification==='release-date-confirmed'?(zh?'已对照官方来源核对所示日期；其他论述待核验。':'The displayed date was checked against an official source; other claims await verification.'):(zh?'母版研究论述与日期尚待独立核验。':'The master’s research claims and dates await independent verification.')}</p>
 </div>;
}
