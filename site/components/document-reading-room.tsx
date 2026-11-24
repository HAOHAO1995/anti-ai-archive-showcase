'use client';
import {TopicIllustration} from './topic-illustration';
import {topicIllustrationId} from '@/lib/topic-images';
import {readingSubtitle} from '@/lib/reading-subtitle';
import {ReadingRoomPanes,useReadingRoomPanes} from './reading-room-panes';
import {useSyncExternalStore,useMemo,useDeferredValue,memo,useRef} from 'react';
import {ArrowUpRight,Search,X,LayoutGrid,List} from 'lucide-react';
import {Link,useLanguage} from './site-shell';
import {localizedPath} from '@/lib/locale';
import type {documentCatalogue} from '@/lib/document-catalogue';

function subscribe(notify:()=>void){
 window.addEventListener('popstate',notify);window.addEventListener('archive-search',notify);
 return()=>{window.removeEventListener('popstate',notify);window.removeEventListener('archive-search',notify)};
}
export function DocumentReadingRoom({records,updated}:{records:ReturnType<typeof documentCatalogue>;updated:string}){
 const {roomRef,pane,showPane}=useReadingRoomPanes();
 const {lang}=useLanguage(),zh=lang==='zh';
 const t=(cn:string,en:string)=>zh?cn:en;
 const search=useSyncExternalStore(subscribe,()=>window.location.search,()=> '');
 const params=new URLSearchParams(search),query=params.get('q')??'',year=params.get('year')??'all',gallery=params.get('view')==='gallery';
 function update(values:Record<string,string>){
  const next=new URLSearchParams(window.location.search);
  for(const [key,value] of Object.entries(values)){if(value&&value!=='all')next.set(key,value);else next.delete(key)}
  window.history.replaceState(window.history.state,'',window.location.pathname+(next.size?'?'+next.toString():'')+window.location.hash);
  window.dispatchEvent(new Event('archive-search'));
 }
 const deferredQuery=useDeferredValue(query);
 const tokens=useMemo(()=>deferredQuery.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean),[deferredQuery]);
 const filtered=useMemo(()=>records.filter(d=>(year==='all'||d.year===year)&&tokens.every(token=>d.search.toLocaleLowerCase().includes(token))),[records,year,tokens]);
 const selected=filtered.find(d=>d.id===params.get('selected'))??filtered[0];
 const years=[...new Set(records.map(d=>d.year).filter(Boolean))].sort();
 function select(id:string){update({selected:id});showPane('preview',true,id)}
 function read(id:string){window.location.assign(localizedPath('/documents/'+id,lang))}
 const actions=useRef({select,read});actions.current={select,read};
 return <main id="main" className="reading-room" ref={roomRef} data-pane={pane}>
  <div className="room-intro"><span>ANTI-AI ARCHIVE / {t('文献与作品','DOCUMENTS & WORKS')}</span><span>{t('资料更新','UPDATED')} {updated}</span></div>
  <ReadingRoomPanes pane={pane} onChange={showPane}/>
  <div className="room-spread">
   <aside className="room-preview" tabIndex={0} aria-label={t('所选文献预览','Selected document preview')}>
    {selected?<>
     <div className="room-cover" id="document-preview">
      <div className="room-cover-top"><span>{selected.kind}</span><span>{selected.year||'—'}</span></div>
      <div className="room-cover-title"><Link href={'/documents/'+selected.id}><h2>{selected.title}</h2>{zh?selected.alternative!==selected.title&&<p lang="en">{selected.alternative}</p>:<p lang="en">{readingSubtitle(selected.subtitle)}</p>}</Link></div>
      <div className="room-cover-bottom"><span>{selected.author}</span><span>{selected.id.toUpperCase()}</span></div>
     </div>
     <p className="room-cover-note">{t('档案题签 · 非原刊封面','ARCHIVE TITLE CARD · NOT AN ORIGINAL COVER')}</p>
     <div className="room-preview-meta"><span>{selected.date}</span><span>{selected.language}</span></div>
     <p className="room-description">{selected.description}</p>{topicIllustrationId(selected.id)&&<TopicIllustration key={selected.id} id={topicIllustrationId(selected.id)!} locale={lang}/>}
     <Link className="room-read" href={'/documents/'+selected.id}>{selected.full?t('阅读全文','Read full text'):t('查看文献档案与来源','Read record & sources')}<ArrowUpRight size={18}/></Link>
     <p className="room-method">{t('已核读所引来源；这不代表所有主张均已获得独立核实。','Sources have been read; not every claim has been independently verified.')} <Link href="/about">{t('研究方法 ↗','Methodology ↗')}</Link></p>
    </>:<p className="room-description">{t('调整筛选，继续阅读。','Adjust the filters to continue reading.')}</p>}
   </aside>
   <section className="room-catalogue" aria-label={t('文献目录','Document catalogue')}>
    <div className="room-heading"><div><span className="eyebrow">{t('文献与作品','DOCUMENTS & WORKS')}</span><h1>{t('文献阅览室','Reading room')}</h1></div><span className="room-count" aria-live="polite">{filtered.length} / {records.length}</span></div>
    <p className="room-deck">{t('作品、公开信、协议、政策与研究文本。选择一份文献，沿着证据继续阅读。','Works, open letters, agreements, policies and research texts. Select a document and follow the evidence.')}</p>
    <div className="room-search"><Search size={17}/><input type="search" aria-label={t('检索文献','Search documents')} placeholder={t('检索名称、人物、关键词…','Search names, people, keywords…')} value={query} onChange={e=>update({q:e.target.value})}/>{query&&<button onClick={()=>update({q:''})} aria-label={t('清空搜索','Clear search')}><X size={16}/></button>}</div>
    <div className="room-tools"><label>{t('年份','Year')} <select value={year} onChange={e=>update({year:e.target.value})}><option value="all">{t('全部年份','All years')} ({records.length})</option>{years.map(y=><option key={y} value={y}>{y} ({records.filter(d=>d.year===y).length})</option>)}</select></label><div role="group" aria-label={t('目录视图','Catalogue view')}><button aria-pressed={!gallery} onClick={()=>update({view:''})}><List size={15}/>{t('列表','List')}</button><button aria-pressed={gallery} onClick={()=>update({view:'gallery'})}><LayoutGrid size={15}/>{t('网格','Grid')}</button></div></div>
    {(query||year!=='all')&&<button className="room-reset" onClick={()=>update({q:'',year:'',field:'',region:'',actor:''})}>{t('重置筛选','Reset filters')} ×</button>}
    {!filtered.length&&<div className="empty-state"><h2>{t('没有找到匹配记录','No matching records')}</h2><p>{t('试试其他关键词，或重置筛选。','Try another keyword or reset the filters.')}</p></div>}
    <div className={'room-records'+(gallery?' room-gallery':'')}>
     {filtered.map(d=><DocumentCard key={d.id} d={d} active={selected?.id===d.id} gallery={gallery} lang={lang} actions={actions}/>)}
    </div>
   </section>
  </div>
 </main>;
}

type DocumentCardEntry={id:string;title:string;description:string;year:string;author:string;kind:string;language:string;pinned:boolean};
const DocumentCard=memo(function DocumentCard({d,active,gallery,lang,actions}:{d:DocumentCardEntry;active:boolean;gallery:boolean;lang:'en'|'zh';actions:{current:{select:(id:string)=>void;read:(id:string)=>void}}}){const t=(zh:string,en:string)=>lang==='zh'?zh:en;return <article key={d.id} data-document-id={d.id} className={'room-record'+(active?' is-selected':'')+(d.pinned?' pinned-document':'')}>
      <button className="room-select" aria-label={t('预览：','Preview: ')+d.title} title={t('单击预览，双击进入阅读','Click to preview; double-click to read')} aria-pressed={active} aria-controls="document-preview" onClick={()=>actions.current.select(d.id)} onDoubleClick={()=>actions.current.read(d.id)}>
       {gallery&&<TopicIllustration id={topicIllustrationId(d.id)??''} locale={lang} variant="thumbnail"/>}
       <span className="room-date">{d.year||'—'}{d.pinned&&<span className="room-pin">{t('置顶','PINNED')}</span>}</span>
       <span className="room-record-copy"><span className="room-record-title">{d.title}</span><span className="room-record-description">{d.description}</span><span className="room-record-meta">{[d.author,d.kind,d.language].filter(Boolean).join(' · ')}</span></span>
      </button>
      <Link className="room-record-link" href={'/documents/'+d.id} aria-label={t('打开：','Open: ')+d.title}><ArrowUpRight size={18}/><span>{t('阅读','Read')}</span><span className="sr-only">{d.title}</span></Link>
     </article>;});
