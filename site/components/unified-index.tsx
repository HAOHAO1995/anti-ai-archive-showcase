'use client';
import {useArchive} from './archive-hooks';
import {useSyncExternalStore} from 'react';
import {ArchiveExplorer} from './archive-explorer';
import {PeopleIndex} from './people-index';
import {useLanguage} from './site-shell';
import {indexView,indexViews,indexTabSearch} from '@/lib/index-navigation.mjs';
function subscribe(notify:()=>void){window.addEventListener('popstate',notify);window.addEventListener('archive-search',notify);return()=>{window.removeEventListener('popstate',notify);window.removeEventListener('archive-search',notify)}}
export function UnifiedIndex(){
 const {lang}=useLanguage(),zh=lang==='zh',archive=useArchive();
 const search=useSyncExternalStore(subscribe,()=>window.location.search,()=>''),view=indexView(search);
 const counts={cases:archive.cases.length,people:archive.people.filter(p=>archive.events.some(e=>e.actors.includes(p.id)||e.organizations.includes(p.id))).length,sources:archive.sources.length};
 const labels:Record<string,string>={cases:zh?'案例':'Cases',people:zh?'人物与地区':'People & places',sources:zh?'来源':'Sources'};
 function select(next:string){if(next===view)return;window.history.pushState(window.history.state,'',window.location.pathname+'?'+indexTabSearch(window.location.search,next));window.dispatchEvent(new Event('archive-search'));}
 function keyboard(event:React.KeyboardEvent<HTMLButtonElement>,i:number){let next=i;if(event.key==='ArrowRight')next=(i+1)%3;else if(event.key==='ArrowLeft')next=(i+2)%3;else if(event.key==='Home')next=0;else if(event.key==='End')next=2;else return;event.preventDefault();select(indexViews[next]);document.getElementById('index-tab-'+indexViews[next])?.focus();}
 return <main id="main" className="unified-index">
  <header className="page-heading"><span className="eyebrow">ANTI-AI ARCHIVE / INDEX</span><h1>Index</h1><p>{zh?'从案例、人物与地区、原始来源三个方向检索档案。':'Search the archive through cases, people and places, and original sources.'}</p></header>
  <div className="index-tabs" role="tablist" aria-label={zh?'检索目录':'Index collections'}>{indexViews.map((key,i)=><button key={key} id={'index-tab-'+key} role="tab" type="button" aria-selected={view===key} aria-controls={'index-panel-'+key} tabIndex={view===key?0:-1} onClick={()=>select(key)} onKeyDown={event=>keyboard(event,i)}><span>{labels[key]}</span><span className="index-tab-count">{counts[key as keyof typeof counts]}</span></button>)}</div>
  <section id="index-panel-cases" role="tabpanel" aria-labelledby="index-tab-cases" tabIndex={0} hidden={view!=='cases'}><ArchiveExplorer kind="cases" embedded/></section>
  <section id="index-panel-people" role="tabpanel" aria-labelledby="index-tab-people" tabIndex={0} hidden={view!=='people'}><PeopleIndex embedded/></section>
  <section id="index-panel-sources" role="tabpanel" aria-labelledby="index-tab-sources" tabIndex={0} hidden={view!=='sources'}><ArchiveExplorer kind="sources" embedded/></section>
  <noscript><style>{'.unified-index [role="tabpanel"][hidden]{display:block!important}.unified-index .index-tabs{display:none}'}</style></noscript>
 </main>;
}
