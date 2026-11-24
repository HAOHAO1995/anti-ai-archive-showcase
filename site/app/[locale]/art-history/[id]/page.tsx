import {chronologicalNumber,timelineRecords} from '@/lib/genealogy-navigation.mjs';
import {HistoryIllustration} from '@/components/history-illustration';
import {HistoryEssay} from '@/components/history-essay';
import essays from '@/lib/data/genealogy-essays.json';
import {notFound} from 'next/navigation';
import genealogy from '@/lib/data/genealogy.json';
import {isLocale,languageMetadata,localizedPath,siteOrigin} from '@/lib/i18n';
import {GenealogyProvenance} from '@/components/genealogy-provenance';
import officialLinks from '@/lib/data/history-source-links.json';

type Params={params:Promise<{locale:string;id:string}>};
const kinds:Record<string,{zh:string;en:string}>={theory:{zh:'思想背景',en:'Intellectual context'},art:{zh:'艺术实践',en:'Artistic practice'},institution:{zh:'展览与机构',en:'Exhibitions & institutions'},system:{zh:'技术与工具',en:'Systems & tools'}};
export async function generateMetadata({params}:Params){
 const {locale,id}=await params;const record=genealogy.records.find(r=>r.id===id);
 return isLocale(locale)&&record?languageMetadata(`/art-history/${id}`,locale,record.title[locale],record.summary[locale]):{};
}
export default async function Page({params}:Params){
 const {locale,id}=await params;if(!isLocale(locale))notFound();
 const index=genealogy.records.findIndex(r=>r.id===id);if(index<0)notFound();
 const number=chronologicalNumber(genealogy.records,id);
 const r=genealogy.records[index],zh=locale==='zh',t=(cn:string,en:string)=>zh?cn:en;
 const essay=essays.records.find(e=>e.nodeId===id);
 const href=(path:string)=>localizedPath(path,locale),url=siteOrigin+href(`/art-history/${id}`);
 const related=r as typeof r & {relatedCaseIds?:string[];relatedEventIds?:string[];relatedDocumentIds?:string[]};
 const sequence=timelineRecords(genealogy.records),position=sequence.findIndex(n=>n.id===id);
 const previous=position>=0?sequence[position-1]:undefined,next=position>=0?sequence[position+1]:undefined;
 const contextual='timelineRole' in r&&r.timelineRole==='context';
 const contextPath='/art-history/guides/generative-lineage#'+('contextGroup' in r?r.contextGroup:'contextual-works');
 const retired=('retiredSourceUrls' in r?r.retiredSourceUrls:[]) as string[];
 const official=(officialLinks as Record<string,{url:string;label:{zh:string;en:string}}[]>)[id]??[];
 const sources=[{url:r.sourceUrl,title:r.title[locale],original:r.originalTitle,current:true},...r.sourceRefs.map(ref=>({url:ref.url,title:ref.title[locale],original:ref.originalTitle,current:false})),{url:r.originalSourceUrl,title:r.title[locale],original:r.originalTitle,current:false}].filter((item,i,all)=>!retired.includes(item.url)&&all.findIndex(other=>other.url===item.url)===i);
 const schema={'@context':'https://schema.org','@type':'WebPage','@id':url,url,name:r.title[locale],description:r.summary[locale],inLanguage:zh?'zh-CN':'en',isPartOf:{'@id':siteOrigin+href('/topics/ai-art-history')+'#page'},citation:[...new Set([...official.map(s=>s.url),...sources.map(s=>s.url),...(essay?.sources.map(s=>s.url)??[])])]};
 return <main id="main" className="genealogy-detail">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replaceAll('<','\\u003c')}}/>
  <nav className="breadcrumb" aria-label={t('面包屑导航','Breadcrumb')}><a href={href('/')}>ANTI-AI ARCHIVE</a><span>/</span><a href={href('/topics/ai-art-history')}>{t('生成艺术史','Generative Art History')}</a><span>/</span><span>{number?'#'+number:t('专题作品','Thematic work')}</span></nav>
  <header className="record-header"><span className="eyebrow">{contextual?t('专题作品','THEMATIC WORK'):t('艺术史节点','ART-HISTORY NODE')}{number?' / '+number:''} · {r.date[locale]}</span><h1>{r.title[locale]}</h1><p className="original-title" lang={r.originalLanguage}>{r.originalTitle}</p><p className="muted">{r.actors}</p></header>
  <nav className="record-source-links" aria-label={t('原始来源快捷入口','Original source shortcuts')}>
   {official.map(s=><a className="primary-link" key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label[locale]} ↗</a>)}
   {!official.some(s=>s.url===r.sourceUrl)&&<a className="primary-link" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">{id==='243'?t('MoMA 官方新闻稿（PDF）','MoMA official press release (PDF)'):t('查看原始资料','Open original source')} ↗</a>}
   <a className="text-link" href="#history-sources">{t('全部来源与引用','All sources & references')} ↓</a>
  </nav>
  <div className="detail-grid">
   <aside className="record-meta" aria-label={t('节点信息','Node information')}><dl>
    <dt>{t('历史日期','Historical date')}</dt><dd>{r.date[locale]}</dd>
    <dt>{t('节点类型','Node type')}</dt><dd>{kinds[r.kind][locale]}<small>{r.releaseType[locale]}</small></dd>
    <dt>{t('人物与机构','People & organisations')}</dt><dd>{r.actors}</dd>
    <dt>{t('原题语言代码','Original-title language code')}</dt><dd>{r.originalLanguage}</dd>
    <dt>{contextual?t('阅读位置','Reading context'):t('时间顺序编号','Chronological number')}</dt><dd>{number?'#'+number:t('生成艺术专题','Generative-art guide')}</dd>
   </dl><a className="text-link" href={contextual?href(contextPath):href('/topics/ai-art-history')+'?selected=node-'+id+'#topic-catalogue'}>{contextual?t('返回专题讨论','Return to the thematic discussion'):t('返回所选节点','Back to selected node')} ↗</a></aside>
   <article className="record-body">
    <section className="detail-section" aria-labelledby="history-account"><h2 id="history-account">{essay?t('导读','Introduction'):t('历史背景与研究说明','Historical context & research account')}</h2><p>{r.summary[locale]}</p></section>
    {contextual&&<p className="research-note">{t('本作作为生成艺术专题中的比较实例保留，不单列为主时间线转折。','This work is retained as a comparative example in the generative-art guide, rather than a separate turning point in the main timeline.')} <a href={href(contextPath)}>{t('阅读相关专题','Read the thematic discussion')} ↗</a></p>}
    {'timelineRationale' in r&&r.timelineRationale&&<section className="detail-section"><h2>{t('为何保留在主线','Why this entry remains in the timeline')}</h2><p>{r.timelineRationale[locale]}</p><p className="muted small">{t('基于所列来源的档案编辑判断；不等同于已经证明全球首创。','Archive editorial judgment based on the cited sources; this does not establish global priority.')}</p></section>}
    <HistoryIllustration nodeId={id} locale={locale}/>
    <HistoryEssay nodeId={id} locale={locale}/>
    <section className="detail-section" aria-labelledby="history-dates"><h2 id="history-dates">{t('日期与版本记录','Dates & version record')}</h2><p>{t('节点标注日期','Date displayed for this node')}{t('：',': ')}{r.date[locale]} · {t('来源记录的历史日期','Historical date recorded for the source')}{t('：',': ')}{r.masterDate}</p>{r.dateNote[locale]&&<p>{r.dateNote[locale]}</p>}<p className="muted small">{t('以上日期属于历史事件或资料所记版本，不是本站页面的上线日期；保留原有日期精度与待核事项。','These dates refer to the historical event or recorded version, not this page’s publication date. The original date precision and unresolved questions are retained.')}</p></section>
    <section className="detail-section" aria-labelledby="history-sources"><h2 id="history-sources">{t('原始资料与进一步阅读','Original sources & further reading')}</h2><p className="muted small">{t('以下链接通往来源的论文、文章、机构或会议页面。外部原文的语言以来源为准。','These links lead to the cited paper, article, institution or conference page. External texts retain their source languages.')}</p>
     {sources.map((s,i)=><div className="reference-row" key={s.url}><span>{String(i+1).padStart(2,'0')}</span><div><a className="reference-title" href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><p>{s.original}</p><p className="source-url">{s.url}</p><p>{s.current?t('当前引用地址','Current cited URL'):t('母版或补充资料所引地址，可能已迁移或失效','URL cited in a research master or supplement; it may have moved or expired')}</p></div></div>)}
     {r.sourceNote[locale]&&<p className="research-note">{r.sourceNote[locale]}</p>}
    </section>
    {(related.relatedCaseIds?.length || related.relatedEventIds?.length || related.relatedDocumentIds?.length) ? <section className="detail-section"><h2>{t('相关档案','Related archive records')}</h2>
     {related.relatedCaseIds?.map(id=><p key={id}><a href={href('/cases/'+id)}>{t('阅读相关案例与研究背景','Read the related case and research context')} ↗</a></p>)}
     {related.relatedEventIds?.map(id=><p key={id}><a href={href('/events/'+id)}>{t('查看事件、日期与证据','Read the event, dates and evidence')} ↗</a></p>)}
     {related.relatedDocumentIds?.map(id=><p key={id}><a href={href('/documents/'+id)}>{t('阅读原始文献编目','Read the original-document catalogue record')} ↗</a></p>)}
    </section> : null}
    <section className="detail-section" aria-labelledby="history-provenance"><h2 id="history-provenance">{t('出处、翻译与核验状态','Provenance, translation & verification')}</h2><GenealogyProvenance record={r} locale={locale} expanded/></section>
    <section className="detail-section"><h2>{contextual?t('引用本作品资料','Cite this work record'):t('引用本节点','Cite this node')}</h2><p className="citation">ANTI-AI ARCHIVE. {r.title[locale]}. {contextual?t('专题作品资料','Thematic work record'):t('艺术史节点','Art-history node')}{number?' #'+number:''}. {url}</p><p className="muted small">{t('引用具体史实时，请同时引用上方原始资料，并补充你的访问日期。本站说明不是外链全文译本。','For specific historical claims, also cite the original sources above and include your access date. This account is not a full translation of the linked work.')}</p></section>
    <nav className="genealogy-detail-nav" aria-label={t('继续阅读历史节点','Continue reading historical nodes')}>
     {previous&&<a className="plain-record" href={href('/art-history/'+previous.id)}><span>← {t('上一节点','Previous node')} · {previous.date[locale]}</span>{previous.title[locale]}</a>}
     {next&&<a className="plain-record" href={href('/art-history/'+next.id)}><span>{t('下一节点','Next node')} → · {next.date[locale]}</span>{next.title[locale]}</a>}
    </nav>{!contextual&&<p className="muted small">{t('相邻节点按时间顺序排列，不意味着二者存在直接影响或因果关系。','Adjacent nodes follow chronological order; adjacency does not establish direct influence or causation.')}</p>}
   </article>
  </div>
 </main>;
}
