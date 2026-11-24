import {notFound} from 'next/navigation';
import {TopicIllustration} from '@/components/topic-illustration';
import {topicIllustrationId} from '@/lib/topic-images';
import references from '@/lib/data/ai-research-references.json';
import {isLocale,languageMetadata,localizedPath,siteOrigin} from '@/lib/i18n';
type Params={params:Promise<{locale:string;id:string}>};
export async function generateMetadata({params}:Params){
 const {locale,id}=await params,ref=references.find(r=>r.id===id);
 return isLocale(locale)&&ref?languageMetadata(`/topics/culture-governance/references/${id}`,locale,ref.title[locale],ref.annotation[locale]):{};
}
export default async function ReferencePage({params}:Params){
 const {locale,id}=await params;if(!isLocale(locale))notFound();
 const ref=references.find(r=>r.id===id);if(!ref)notFound();
 const zh=locale==='zh',href=(p:string)=>localizedPath(p,locale),url=siteOrigin+href(`/topics/culture-governance/references/${id}`);
 const related=ref.relatedReferenceIds.map(rid=>references.find(r=>r.id===rid)!);
 const illustrationId=topicIllustrationId(ref.id);
 const date=ref.publicationDate??ref.publicationYear??(zh?'日期待核':'Date not established');
 const schema={'@context':'https://schema.org','@type':'WebPage',url,name:ref.title[locale],description:ref.annotation[locale],inLanguage:zh?'zh-CN':'en',dateModified:ref.editorialUpdated,citation:ref.url,isPartOf:{'@id':siteOrigin+href('/topics/culture-governance')+'#page'},publisher:{'@id':siteOrigin+'/#project'}};
 return <main id="main" className="history-guide-page research-reference-page">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replaceAll('<','\\u003c')}}/>
  <nav className="breadcrumb" aria-label={zh?'面包屑导航':'Breadcrumb'}><a href={href('/')}>ANTI-AI ARCHIVE</a><span>/</span><a href={href('/topics/culture-governance')}>{zh?'文化与治理':'Culture & Governance'}</a></nav>
  <header className="record-header"><span className="eyebrow">{zh?'研究参考':'RESEARCH REFERENCE'} · {ref.id.toUpperCase()}</span><h1>{ref.title[locale]}</h1>{zh&&<p className="original-title" lang={ref.language}>{ref.originalTitle}</p>}<p className="lead">{ref.researchQuestion[locale]}</p><p className="muted">{ref.author?ref.author+' · ':''}{ref.publisher}</p></header>
  <div className="detail-grid"><aside className="record-meta"><dl>
   <dt>{zh?'来源发表日期':'Source publication'}</dt><dd>{date}</dd>
   <dt>{zh?'来源语言':'Source language'}</dt><dd>English</dd>
   <dt>{zh?'研究方向':'Research focus'}</dt><dd>{ref.category[locale]}</dd>
   <dt>{zh?'来源核读日期':'Source accessed'}</dt><dd>{ref.accessDate}</dd>
   <dt>{zh?'本页编写':'Archive commentary'}</dt><dd>ANTI-AI ARCHIVE<br/>LUOCAO / CHEN HAOHAO</dd>
   <dt>{zh?'导读修订':'Commentary revised'}</dt><dd>{ref.editorialUpdated}</dd>
  </dl></aside><article className="record-body">
   <p className="lead">{ref.annotation[locale]}</p>
   {illustrationId&&<TopicIllustration id={illustrationId} locale={locale}/>}
   {ref.sections.map(s=><section className="detail-section" key={s.id} id={s.id}><h2>{s.title[locale]}</h2><p>{s.body[locale]}</p></section>)}
   <section className="detail-section"><h2>{zh?'原始来源与阅读范围':'Original source and reading scope'}</h2><a className="primary-link" href={ref.url} target="_blank" rel="noreferrer">{zh?'阅读英文原始来源':'Read the original in English'} ↗</a>{ref.publisherUrl&&<p><a className="text-link" href={ref.publisherUrl} target="_blank" rel="noreferrer">{zh?'原刊 DOI 页面':'Original publication / DOI'} ↗</a></p>}<p>{ref.readingScope[locale]}</p><p className="translation-note">{zh?'本页为档案编写的双语研究导读，并非原文全文译本。文本采用 AI 辅助编写与翻译，尚待独立人工审校；来源核读不等于所有历史主张均已获得独立事实核验。':'This page is bilingual research commentary written by the archive, not a full translation of the source. It uses AI-assisted writing and translation and awaits independent human review. Reading a source does not independently verify every historical claim.'}</p></section>
   <section className="detail-section"><h2>{zh?'引用与方法':'Citation and method'}</h2><p>{zh?'引用原作者的观点时，请引用原文；引用本页的研究用途与评论时，请注明本档案及访问日期。':'Cite the original for its author’s arguments. For this page’s research framing and commentary, cite the archive and include your access date.'}</p><p className="citation">{ref.author?ref.author+'. ':''}{ref.originalTitle}. {ref.publisher}. {ref.publicationDate??ref.publicationYear??(zh?'未注明日期':'Undated')}. {ref.url}</p><p className="citation">ANTI-AI ARCHIVE. {ref.title[locale]}. {ref.editorialUpdated}. {url}</p><a className="text-link" href={href('/about')}>{zh?'研究方法与编辑说明':'Methodology and editorial notes'} ↗</a></section>
   <section className="detail-section"><h2>{zh?'相关研究参考':'Related research references'}</h2>{related.map(r=><a className="plain-record" key={r.id} href={href('/topics/culture-governance/references/'+r.id)}>{r.title[locale]} ↗</a>)}</section>
   <a className="primary-link" href={href('/topics/culture-governance')+'?selected='+id+'&kind=reference#topic-catalogue'}>{zh?'返回所选参考卡片':'Return to the selected reference card'} ↗</a>
  </article></div>
 </main>;
}
