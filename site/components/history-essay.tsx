import essays from '@/lib/data/genealogy-essays.json';
import genealogy from '@/lib/data/genealogy.json';
import {localizedPath,type Locale} from '@/lib/locale';

export function HistoryEssay({nodeId,locale}:{nodeId:string;locale:Locale}){
 const essay=essays.records.find(r=>r.nodeId===nodeId);
 if(!essay)return null;
 const zh=locale==='zh',t=(cn:string,en:string)=>zh?cn:en;
 return <div className="history-essay" data-history-essay={nodeId}>
  <header className="history-essay-heading"><p className="eyebrow">{t('档案研究说明','RESEARCH ACCOUNT')}</p><h2>{essay.deck[locale]}</h2><p className="small muted">ANTI-AI ARCHIVE · {t('修订','Revised')} {essay.revisedAt}</p></header>
  <nav className="history-essay-contents" aria-label={t('本篇目录','In this account')}>{essay.sections.map(s=><a key={s.id} href={'#essay-'+s.id}>{s.heading[locale]}</a>)}</nav>
  {essay.sections.map(section=><section className="detail-section" key={section.id} aria-labelledby={'essay-'+section.id}>
   <h2 id={'essay-'+section.id}>{section.heading[locale]}</h2>
   {section.paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}
   <p className="history-essay-citations">{t('本节依据','Section sources')}: {section.sourceIds.map((id,i)=>{const source=essay.sources.find(s=>s.id===id)!;return <span key={id}>{i>0?' · ':''}<a href={'#essay-source-'+id}>{source.title[locale]}</a></span>})}</p>
  </section>)}
  <section className="detail-section"><h2>{t('正文引用资料','Sources for this account')}</h2>
   {essay.sources.map(source=><div className="history-essay-source" id={'essay-source-'+source.id} key={source.id}>
    <a href={source.url} target="_blank" rel="noreferrer">{source.title[locale]} ↗</a>
    <p className="small muted">{source.locator[locale]}</p>
    <details className="original-source-metadata"><summary>{t('原题与来源语言','Original title & source language')}</summary><p lang={source.language}>{source.originalTitle}</p><p>{source.language}</p></details>
   </div>)}
   <p className="research-note">{essay.limits[locale]} {t('正文与译文使用 AI 辅助，尚未经独立人工审校；分节引文标明依据，不代表已独立验证全部史实。','The account and translation are AI-assisted, pending independent human review. Section references identify evidence without claiming independent verification of every historical statement.')}</p>
  </section>
  <section className="detail-section"><h2>{t('带着问题继续阅读','Continue with a comparative question')}</h2>{essay.related.map(item=>{const node=genealogy.records.find(n=>n.id===item.nodeId)!;return <div className="history-essay-source" key={item.nodeId}><a href={localizedPath('/art-history/'+node.id,locale)}>{node.title[locale]} ↗</a><p>{item.reason[locale]}</p></div>})}</section>
 </div>;
}
