'use client';
import {readingSubtitle} from '@/lib/reading-subtitle';
import {TopicIllustration} from './topic-illustration';
import {HistoryIllustration} from './history-illustration';
import {useHistoryTimeline} from './use-history-timeline';
import {publishHistoryPosition} from '@/lib/history-sync';
import {ReadingRoomPanes,useReadingRoomPanes} from './reading-room-panes';
import {useEffect,useSyncExternalStore,useMemo,useDeferredValue,memo,useRef} from 'react';
import {ArrowUpRight,Search,X,List,LayoutGrid} from 'lucide-react';
import {useLanguage,Link} from './site-shell';
import {localizedPath} from '@/lib/locale';

export type TopicReadingEntry={id:string;sequence?:string;title:string;alternative:string;description:string;year:string;date:string;credit:string;kind:'guide'|'case'|'event'|'node'|'reference';href:string;originalUrl?:string;originalLanguage?:string;search:string;illustrationId?:string};
export type TopicSection={id:string;title:string;description:string;introId:string;entryIds:string[]};
function subscribe(notify:()=>void){window.addEventListener('popstate',notify);window.addEventListener('archive-search',notify);return()=>{window.removeEventListener('popstate',notify);window.removeEventListener('archive-search',notify)}}
function revealAnchor(){
 const id=decodeURIComponent(window.location.hash.slice(1)),target=document.getElementById(id);
 if(!target)return;
 if(target instanceof HTMLDetailsElement)target.open=true;
 let parent=target.parentElement;
 while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement}
 target.scrollIntoView({block:'start'});
}
export function TopicReadingRoom({title,description,entries,updated,historyTimeline=false,guideHref,sections}:{title:string;description:string;entries:TopicReadingEntry[];updated?:string;historyTimeline?:boolean;guideHref?:string;sections?:TopicSection[]}){
 const {roomRef,pane,showPane}=useReadingRoomPanes();
 const {lang}=useLanguage(),zh=lang==='zh',t=(cn:string,en:string)=>zh?cn:en;
 const search=useSyncExternalStore(subscribe,()=>window.location.search,()=> '');
 const params=new URLSearchParams(search),query=params.get('q')??'',year=params.get('year')??'all',kind=params.get('kind')??'all',grid=params.get('view')==='gallery';
 const kinds={guide:t('研究导读','Research guide'),case:t('案例','Case'),event:t('事件','Event'),node:t('历史节点','Historical node'),reference:t('研究参考','Research reference')};
 function update(values:Record<string,string>){const next=new URLSearchParams(window.location.search);for(const [key,value] of Object.entries(values)){if(value&&value!=='all')next.set(key,value);else next.delete(key)}window.history.replaceState(window.history.state,'',window.location.pathname+(next.size?'?'+next.toString():'')+window.location.hash);window.dispatchEvent(new Event('archive-search'))}
 useEffect(()=>{revealAnchor();window.addEventListener('hashchange',revealAnchor);return()=>window.removeEventListener('hashchange',revealAnchor)},[]);
 function read(href:string){if(href.startsWith('#')){if(window.location.hash===href)revealAnchor();else window.location.hash=href}else window.location.assign(localizedPath(href,lang))}
 function anchorClick(event:React.MouseEvent<HTMLAnchorElement>,href:string){if(href.startsWith('#')&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();read(href)}}
 function select(id:string){update({selected:id});showPane('preview',true,id);if(historyTimeline)publishHistoryPosition(id.startsWith('node-')?id.slice(5):id,'catalogue','select')}
 const activeSection=sections?.find(s=>s.id===params.get('section'))??sections?.find(s=>s.entryIds.includes(params.get('selected')??''))??sections?.[0];
 const sectionEntries=useMemo(()=>{if(!activeSection)return entries;const ids=new Set(activeSection.entryIds);return entries.filter(e=>ids.has(e.id)).sort((a,b)=>Number(b.id===activeSection.introId)-Number(a.id===activeSection.introId));},[entries,activeSection]);
 function switchSection(section:TopicSection){update({section:section.id,selected:section.introId,q:'',kind:'',year:'',pane:''});showPane('catalogue',false,section.introId)}
 const deferredQuery=useDeferredValue(query);
 const tokens=useMemo(()=>deferredQuery.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean),[deferredQuery]);
 const filtered=useMemo(()=>sectionEntries.filter(e=>(kind==='all'||e.kind===kind)&&(year==='all'||e.year===year)&&tokens.every(token=>e.search.toLocaleLowerCase().includes(token))),[sectionEntries,kind,year,tokens]);
 const selected=filtered.find(e=>e.id===params.get('selected'))??filtered[0];
 const years=[...new Set(sectionEntries.map(e=>e.year).filter(Boolean))].sort();
 useHistoryTimeline({enabled:historyTimeline,roomRef,signature:filtered.map(e=>e.id).join(','),
  onPosition:id=>{if(params.get('selected')!=='node-'+id)update({selected:'node-'+id});},
  onNavigate:(id,restoreView)=>{if(!entries.some(e=>e.id==='node-'+id))return;const visible=filtered.some(e=>e.id==='node-'+id);update({selected:'node-'+id,...(!visible?{q:'',year:'',kind:''}:{})});if(!restoreView)showPane('catalogue',false,'node-'+id);}
 });
 useEffect(()=>{if(historyTimeline&&selected?.kind==='node')publishHistoryPosition(selected.id.slice(5),'catalogue');},[historyTimeline,selected?.id,selected?.kind]);
 const actions=useRef({select,read,anchorClick});actions.current={select,read,anchorClick};
 return <section id="topic-catalogue" ref={roomRef} data-pane={pane} className={'reading-room topic-reading-room'+(historyTimeline?' history-linked-room':'')} aria-label={t('专题阅览室','Topic reading room')}>
  <div className="room-intro"><span>ANTI-AI ARCHIVE / {t('研究专题','RESEARCH GUIDES')}</span>{updated&&<span>{t('导读修订','GUIDE REVISED')} {updated}</span>}</div>
  <ReadingRoomPanes pane={pane} onChange={showPane}/>
  <div className="room-spread">
   <aside className="room-preview" tabIndex={0} aria-label={t('所选条目介绍','Selected entry preview')}>
    {selected?<>
     <div className="room-cover" id="topic-preview" key={historyTimeline?selected.id:undefined}><div className="room-cover-top"><span>{kinds[selected.kind]}</span><span>{selected.date}</span></div>
      <div className="room-cover-title"><Link href={selected.href} onClick={e=>anchorClick(e,selected.href)}><h2>{selected.title}</h2>{zh?selected.alternative!==selected.title&&<p lang="en">{selected.alternative}</p>:<p lang="en">{readingSubtitle(selected.description)}</p>}</Link></div>
      <div className="room-cover-bottom"><span>{selected.credit}</span><span>{selected.sequence?'NODE-'+selected.sequence:selected.id.toUpperCase()}</span></div>
     </div>
     <p className="room-cover-note">{t('档案题签 · 非原刊封面','ARCHIVE TITLE CARD · NOT AN ORIGINAL COVER')}</p>
     <p className="room-description">{selected.description}</p>{selected.originalUrl&&<p className="room-method"><a href={selected.originalUrl} target="_blank" rel="noreferrer">{t('阅读原始来源','Read original source')} · {selected.originalLanguage?.toUpperCase()} ↗</a></p>}
     {historyTimeline&&selected.kind==='node'&&<HistoryIllustration nodeId={selected.id.slice(5)} locale={lang}/>}{selected.illustrationId&&<TopicIllustration key={selected.illustrationId} id={selected.illustrationId} locale={lang}/>}
     <Link className="room-read" href={selected.href} onClick={e=>anchorClick(e,selected.href)}>{selected.kind==='guide'?t('阅读专题导读','Read the research guide'):t('阅读条目与来源','Read entry & sources')}<ArrowUpRight size={18}/></Link>
     <p className="room-method">{t('点击条目预览，点击“阅读”打开详情；鼠标也可双击阅读。','Tap an entry to preview and use “Read” for details; mouse users can also double-click.')} {(historyTimeline||guideHref)?<Link href={guideHref??'/art-history/guides/overview'}>{t('阅读导读与引用 ↗','Read guide & citation ↗')}</Link>:<a href="#topic-guide" onClick={e=>anchorClick(e,'#topic-guide')}>{t('完整导读与引用 ↓','Full guide & citation ↓')}</a>}</p>
    </>:<p className="room-description">{t('调整筛选，继续阅读。','Adjust the filters to continue reading.')}</p>}
   </aside>
   <section className="room-catalogue" aria-label={t('专题目录','Topic catalogue')}>
    <div className="room-heading"><div><span className="eyebrow">{t('专题阅览室','TOPIC READING ROOM')}</span><h1>{title}</h1></div><span className="room-count" aria-live="polite">{filtered.length} / {sectionEntries.length}</span></div>
    <p className="room-deck">{description}</p>
    {sections&&activeSection&&<div className="culture-sections"><div className="culture-section-controls" role="group" aria-label={t('文化与治理分区','Culture & Governance sections')}>{sections.map(section=><button type="button" key={section.id} aria-pressed={section.id===activeSection.id} aria-controls="culture-section-results" onClick={()=>switchSection(section)}><span>{section.title}</span><span className="culture-section-count">{section.entryIds.length}</span></button>)}</div><h2 id="culture-section-heading">{activeSection.title}</h2><p>{activeSection.description}</p></div>}

    {sectionEntries.some(e=>e.kind==='reference')&&<button className="room-reference-shortcut" aria-pressed={kind==='reference'} onClick={()=>update({kind:kind==='reference'?'':'reference',q:'',year:''})}>{kind==='reference'?t('查看全部条目','Show all entries'):t('浏览 8 个核心研究参考','Explore 8 core research references')} <ArrowUpRight size={15} aria-hidden="true"/></button>}
    <div className="room-search"><Search size={17}/><input type="search" aria-label={t('检索专题条目','Search topic entries')} placeholder={t('检索标题、人物、关键词…','Search titles, people, keywords…')} value={query} onChange={e=>update({q:e.target.value})}/>{query&&<button onClick={()=>update({q:''})} aria-label={t('清空搜索','Clear search')}><X size={16}/></button>}</div>
    <div className="room-tools"><label>{t('类型','Type')}<select value={kind} onChange={e=>update({kind:e.target.value})}><option value="all">{t('全部类型','All types')}</option>{([...new Set(sectionEntries.map(e=>e.kind))]).map(k=><option key={k} value={k}>{kinds[k]}</option>)}</select></label>{years.length>0&&<label>{t('年份','Year')}<select value={year} onChange={e=>update({year:e.target.value})}><option value="all">{t('全部年份','All years')}</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></label>}<div role="group" aria-label={t('目录视图','Catalogue view')}><button aria-pressed={!grid} onClick={()=>update({view:''})}><List size={15}/>{t('列表','List')}</button><button aria-pressed={grid} onClick={()=>update({view:'gallery'})}><LayoutGrid size={15}/>{t('网格','Grid')}</button></div></div>
    {(query||year!=='all'||kind!=='all')&&<button className="room-reset" onClick={()=>update({q:'',year:'',kind:''})}>{t('重置筛选','Reset filters')} ×</button>}
    {!filtered.length&&<div className="empty-state"><h2>{t('没有找到匹配条目','No matching entries')}</h2><p>{t('试试其他关键词，或重置筛选。','Try another keyword or reset the filters.')}</p></div>}
    <div id={sections?'culture-section-results':undefined} aria-labelledby={sections?'culture-section-heading':undefined} className={'room-records'+(grid?' room-gallery':'')}>
     {filtered.map(e=><TopicCard key={e.id} e={e} active={selected?.id===e.id} grid={grid} historyTimeline={historyTimeline} lang={lang} actions={actions}/>)}
    </div>
   </section>
  </div>
 </section>;
}

const TopicCard=memo(function TopicCard({e,active,grid,historyTimeline,lang,actions}:{e:TopicReadingEntry;active:boolean;grid:boolean;historyTimeline:boolean;lang:'en'|'zh';actions:{current:{select:(id:string)=>void;read:(href:string)=>void;anchorClick:(event:React.MouseEvent<HTMLAnchorElement>,href:string)=>void}}}){const t=(zh:string,en:string)=>lang==='zh'?zh:en;const kinds={guide:t('研究导读','Research guide'),case:t('案例','Case'),event:t('事件','Event'),node:t('历史节点','Historical node'),reference:t('研究参考','Research reference')};return <article key={e.id} data-topic-entry={e.id} data-history-id={historyTimeline&&e.kind==='node'?e.id.slice(5):undefined} id={e.kind==='node'?e.id:e.id==='guide'?'topic-guide':e.id.replace(/^guide-/,'')} className={'room-record'+(active?' is-selected':'')}><button className="room-select" aria-label={t('预览：','Preview: ')+e.title} title={t('单击预览，双击阅读','Click to preview; double-click to read')} aria-pressed={active} aria-controls="topic-preview" onClick={()=>actions.current.select(e.id)} onDoubleClick={()=>actions.current.read(e.href)}>{grid&&(historyTimeline&&e.kind==='node'?<HistoryIllustration nodeId={e.id.slice(5)} locale={lang} variant="thumbnail"/>:<TopicIllustration id={e.illustrationId??''} locale={lang} variant="thumbnail"/>)}<span className="room-date">{e.year||'—'}</span><span className="room-record-copy"><span className="room-record-title">{e.title}</span><span className="room-record-description">{e.description}</span><span className="room-record-meta">{[e.sequence?'NODE-'+e.sequence:'',kinds[e.kind],e.credit].filter(Boolean).join(' · ')}</span></span></button><Link className="room-record-link" href={e.href} onClick={event=>actions.current.anchorClick(event,e.href)} aria-label={t('阅读：','Read: ')+e.title}><ArrowUpRight size={18}/><span>{t('阅读','Read')}</span><span className="sr-only">{e.title}</span></Link></article>;});
