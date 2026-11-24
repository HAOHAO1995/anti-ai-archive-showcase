'use client';
import {useCallback,useEffect,useRef,useState,lazy,Suspense,type PointerEvent} from 'react';
import {HISTORY_POSITION,publishHistoryPosition,type HistoryPosition} from '@/lib/history-sync';
import {usePathname} from 'next/navigation';
import {ArrowDown,ArrowUp,ArrowUpRight,X} from 'lucide-react';
import genealogy from '@/lib/data/genealogy-navigation.json';
const GenealogyDetailContent=lazy(()=>import('./genealogy-detail-content'));
import {clampIndex,indexFromPosition,indexAfterKey,chronologicalNumber,timelineRecords} from '@/lib/genealogy-navigation.mjs';
import {localizedPath,type Locale} from '@/lib/locale';
const records=timelineRecords(genealogy.records);
const kinds:Record<string,{zh:string;en:string}>={theory:{zh:'思想背景',en:'Intellectual context'},art:{zh:'艺术实践',en:'Artistic practice'},institution:{zh:'展览与机构',en:'Exhibitions & institutions'},system:{zh:'技术与工具',en:'Systems & tools'}};
const sourceKinds:Record<string,{zh:string;en:string}>={paper:{zh:'论文 / 原文',en:'Paper / original text'},official:{zh:'官方页面',en:'Official page'},catalogue:{zh:'机构馆藏 / 书目',en:'Institutional catalogue'},record:{zh:'官方档案',en:'Official record'}};
export function GenealogyRail({locale}:{locale:Locale}){
 const zh=locale==='zh';const pathname=usePathname();const linked=/^\/(en|zh)\/topics\/ai-art-history\/?$/.test(pathname);
 const [expanded,setExpanded]=useState(false);
 const [cursor,setCursor]=useState(0);
 const [selected,setSelected]=useState<number|null>(null);
 const [scrubbing,setScrubbing]=useState(false);
 const list=useRef<HTMLOListElement>(null);
 const ruler=useRef<HTMLInputElement>(null);
 const closeButton=useRef<HTMLButtonElement>(null);
 const toggle=useRef<HTMLButtonElement>(null);
 const cursorRef=useRef(0);
 const activePointer=useRef<number|null>(null);
 const selectedRecord=selected===null?null:records[selected];
 const moveCursor=useCallback((index:number)=>{cursorRef.current=index;setCursor(index);},[]);
 const seek=useCallback((index:number,notify=false,motion:HistoryPosition['motion']='scrub')=>{
  const bounded=clampIndex(index,records.length);moveCursor(bounded);
  const row=list.current?.children[bounded] as HTMLElement|undefined;
  if(row&&list.current)list.current.scrollTo({top:row.offsetTop,behavior:'instant'});
  if(linked&&notify)publishHistoryPosition(records[bounded].id,'rail',motion);
 },[moveCursor,linked]);
 function select(index:number){
  if(linked){setSelected(null);seek(index,true,'select');if(toggle.current&&getComputedStyle(toggle.current).display!=='none'){setExpanded(false);toggle.current.focus({preventScroll:true});}return;}
  setSelected(index);seek(index);
  window.history.replaceState(null,'',window.location.pathname+window.location.search+'#genealogy-'+records[index].id);
 }
 function scrub(event:PointerEvent<HTMLInputElement>){
  const bounds=event.currentTarget.getBoundingClientRect();
  seek(indexFromPosition(event.clientY,bounds.top+8,bounds.height-16,records.length),true);
 }
 function finishDrag(event:PointerEvent<HTMLInputElement>){
  if(activePointer.current!==event.pointerId)return;
  activePointer.current=null;setScrubbing(false);
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
 }
 const closeDetail=useCallback(()=>{
  if(selected!==null)(document.getElementById('genealogy-node-'+records[selected].id) as HTMLButtonElement|null)?.focus({preventScroll:true});
  setSelected(null);
  if(window.location.hash.startsWith('#genealogy-'))window.history.replaceState(null,'',window.location.pathname+window.location.search);
 },[selected]);
 useEffect(()=>{
  function restore(){
   const detailId=/^\/(?:en|zh)\/art-history\/(\d{3})\/?$/.exec(pathname)?.[1];
   const queryId=linked?/^node-(\d{3})$/.exec(new URLSearchParams(window.location.search).get('selected')??'')?.[1]:undefined;
   const hashId=/^#(?:genealogy|node)-(\d{3})$/.exec(window.location.hash)?.[1];
   const requested=detailId??queryId??hashId;
   const entry=genealogy.records.find(r=>r.id===requested);
   const id=entry&&'contextParentId' in entry?entry.contextParentId:requested;
   const index=records.findIndex(r=>r.id===id);
   if(index>=0){setSelected(linked||detailId?null:index);if(!linked&&!detailId)setExpanded(true);requestAnimationFrame(()=>seek(index));}else setSelected(null);
  }
  restore();window.addEventListener('hashchange',restore);window.addEventListener('popstate',restore);return()=>{window.removeEventListener('hashchange',restore);window.removeEventListener('popstate',restore);};
 },[seek,pathname,linked]);
 useEffect(()=>{
  if(!linked)return;
  const follow=(event:Event)=>{const d=(event as CustomEvent<HistoryPosition>).detail;if(d?.source!=='catalogue')return;const index=records.findIndex(r=>r.id===d.id);if(index>=0){setSelected(null);seek(index);}};
  window.addEventListener(HISTORY_POSITION,follow);return()=>window.removeEventListener(HISTORY_POSITION,follow);
 },[linked,seek]);
 useEffect(()=>{if(selected!==null)closeButton.current?.focus({preventScroll:true});},[selected]);
 useEffect(()=>{function escape(event:KeyboardEvent){if(event.key!=='Escape'||!document.getElementById('genealogy-rail')?.contains(event.target as Node))return;if(selected!==null)closeDetail();else{setExpanded(false);toggle.current?.focus();}}document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[selected,closeDetail]);
 function changeLanguage(event:React.MouseEvent<HTMLAnchorElement>){
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();window.location.assign(localizedPath(pathname,zh?'en':'zh')+window.location.search+'#genealogy-'+selectedRecord?.id);
 }
 return <>
  <button ref={toggle} className="genealogy-toggle" aria-expanded={expanded} aria-controls="genealogy-rail" onClick={()=>{if(expanded){closeDetail();setExpanded(false);}else{setExpanded(true);requestAnimationFrame(()=>seek(cursorRef.current));}}}><span className="genealogy-signal"/>{zh?'生成艺术史':'Generative Art History'}<span>1943—2026</span></button>
  <aside id="genealogy-rail" className={'genealogy-rail'+(expanded?' is-expanded':'')+(linked?' is-linked':'')} aria-label={zh?'生成艺术史时间线':'Generative Art History timeline'}>
   <header className="genealogy-heading"><span>CONTEXT / 01</span><button className="genealogy-mobile-close" aria-label={zh?'收起时间线':'Collapse timeline'} onClick={()=>{closeDetail();setExpanded(false);toggle.current?.focus();}}><X size={16}/></button><h2>{zh?'生成艺术史':'Generative Art History'}</h2><p>1943—2026 <span>· {records.length}</span></p><a className="genealogy-text-link" href={localizedPath('/topics/ai-art-history',locale)}>{zh?'阅读完整历史导读 ↗':'Read the history guide ↗'}</a></header>
   <div id="genealogy-ruler-hint" className="genealogy-scroll-caption">{zh?'按住刻度拖动定位 · 点击选择节点':'Press and drag the scale · click to select a node'}</div>
   <div className="genealogy-track">
    <ol id="genealogy-node-list" ref={list} className="genealogy-list">
     {records.map((r,i)=><li key={r.id}><button id={'genealogy-node-'+r.id} className={'genealogy-node'+(i===cursor?' is-current':'')} aria-label={`${r.date[locale]} ${r.title[locale]}`} title={r.title[locale]} aria-expanded={selected===i} aria-controls={selected===i?'genealogy-reading':undefined} onClick={()=>select(i)} onDoubleClick={()=>window.location.assign(localizedPath('/art-history/'+r.id,locale))}><span className="genealogy-tick"/><span className="genealogy-year">{r.date[locale]}</span><span className="genealogy-title">{r.shortTitle[locale]}</span></button></li>)}
    </ol>
    <div className={'genealogy-ruler'+(scrubbing?' is-scrubbing':'')}><input ref={ruler} className="genealogy-ruler-input" type="range" min={1} max={records.length} value={cursor+1} onChange={event=>seek(Number(event.target.value)-1,true)} aria-label={zh?'生成艺术史竖向时间刻度':'Generative Art History vertical time scale'} aria-describedby="genealogy-ruler-hint" aria-orientation="vertical" aria-valuemin={1} aria-valuemax={records.length} aria-valuenow={cursor+1} aria-valuetext={`${records[cursor].date[locale]} · ${records[cursor].title[locale]}`} aria-controls="genealogy-node-list" onPointerDown={event=>{
     if(event.button!==0||event.isPrimary===false)return;
     event.preventDefault();activePointer.current=event.pointerId;
     event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.focus({preventScroll:true});setScrubbing(true);scrub(event);
    }} onPointerMove={event=>{
     if(activePointer.current!==event.pointerId||!event.currentTarget.hasPointerCapture(event.pointerId))return;
     if(event.pointerType==='mouse'&&(event.buttons&1)===0){finishDrag(event);return;}
     scrub(event);
    }} onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag} onClick={()=>{if(!linked)select(cursorRef.current);}} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(cursorRef.current);return;}const next=indexAfterKey(event.key,cursorRef.current,records.length);if(next!==null){event.preventDefault();seek(next,true);}}}/>
     <div className="genealogy-ruler-ticks" aria-hidden="true">{records.map((r,i)=>{const distance=Math.abs(i-cursor);return <i key={r.id} className={i%10===0?'major':''} style={{width:distance<7?`${7+(7-distance)*1.6}px`:undefined,opacity:distance<7?1-distance*.07:undefined}}/>;})}</div>
     <span className="genealogy-ruler-marker" aria-hidden="true" style={{top:`calc(8px + (100% - 16px) * ${cursor/(records.length-1)})`}}><span>{records[cursor].year}</span></span>
    </div>
   </div>
   <div className="genealogy-controls"><div><button disabled={cursor===0} aria-label={zh?'上一节点':'Previous node'} onClick={()=>seek(cursor-1,true,'select')}><ArrowUp size={14}/></button><output>{String(cursor+1).padStart(3,'0')} <span>/ {records.length}</span></output><button disabled={cursor===records.length-1} aria-label={zh?'下一节点':'Next node'} onClick={()=>seek(cursor+1,true,'select')}><ArrowDown size={14}/></button></div><p>{zh?'谱系与发布编年 · 研究中':'Genealogy & releases · in progress'}</p></div>
   {selectedRecord&&<section id="genealogy-reading" className="genealogy-reading" aria-labelledby="genealogy-reading-title">
    <div className="genealogy-reading-top"><span>{kinds[selectedRecord.kind][locale]} · #{chronologicalNumber(records,selectedRecord.id)}</span><button ref={closeButton} onClick={closeDetail} aria-label={zh?'关闭节点详情':'Close node details'}><X size={18}/></button></div>
    <p className="genealogy-reading-date">{selectedRecord.date[locale]}</p><h3 id="genealogy-reading-title"><a href={localizedPath('/art-history/'+selectedRecord.id,locale)}>{selectedRecord.title[locale]}</a></h3>
    <Suspense fallback={<p role="status"><a href={localizedPath('/art-history/'+selectedRecord.id,locale)}>{zh?'正在载入说明，或直接阅读详情 ↗':'Loading account, or read the full entry ↗'}</a></p>}><GenealogyDetailContent id={selectedRecord.id} locale={locale}/></Suspense>
    <p className="genealogy-context">{zh?'这是一组相互交叉的历史线索，不是一条通向生成式 AI 的必然进步史。':'Intersecting historical threads, not an inevitable progression toward generative AI.'}</p>
    <div className="genealogy-reading-nav"><button disabled={selected===0} onClick={()=>{if(selected!==null)select(selected-1);}}>← {zh?'上一节点':'Previous'}</button><a href={localizedPath(pathname,zh?'en':'zh')+'#genealogy-'+selectedRecord.id} onClick={changeLanguage} hrefLang={zh?'en':'zh-CN'} lang={zh?'en':'zh-CN'}>{zh?'English':'中文'}</a><button disabled={selected===records.length-1} onClick={()=>{if(selected!==null)select(selected+1);}}>{zh?'下一节点':'Next'} →</button></div>
   </section>}
  </aside>
 </>;
}
