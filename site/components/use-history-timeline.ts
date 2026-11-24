'use client';
import {useEffect,useRef,type RefObject} from 'react';
import {nearestHistoryCard,historyHashId} from '@/lib/history-position.mjs';
import {HISTORY_POSITION,publishHistoryPosition,type HistoryPosition} from '@/lib/history-sync';

export function useHistoryTimeline({enabled,roomRef,signature,onPosition,onNavigate}:{enabled:boolean;roomRef:RefObject<HTMLElement|null>;signature:string;onPosition:(id:string)=>void;onNavigate:(id:string,restoreView?:boolean)=>void}){
 const handlers=useRef({onPosition,onNavigate});handlers.current={onPosition,onNavigate};
 const last=useRef<string|null>(null);
 const manualSelection=useRef(false);
 useEffect(()=>{
  const id=last.current;
  // Refining a filter must not release a selection that remains in the results.
  if(id&&!signature.split(',').includes(/^\d{3}$/.test(id)?'node-'+id:id)){
   last.current=null;manualSelection.current=false;
  }
 },[signature]);
 useEffect(()=>{
  if(!enabled)return;
  const room=roomRef.current;if(!room)return;
  let frame=0,navigateFrame=0,releaseTimer:ReturnType<typeof setTimeout>|undefined,following=false;
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const measure=()=>{
   frame=0;if(manualSelection.current||following||getComputedStyle(room.querySelector('.room-catalogue')!).display==='none')return;
   const viewport=room.closest('.viewport-frame')?.getBoundingClientRect();
   const top=Math.max(0,viewport?.top??0),bottom=Math.min(window.innerHeight,viewport?.bottom??window.innerHeight);
   const anchor=top+Math.min(180,(bottom-top)*.28);
   const rows=Array.from(room.querySelectorAll<HTMLElement>('[data-history-id]')).map(el=>{const r=el.getBoundingClientRect();return {id:el.dataset.historyId!,top:r.top,bottom:r.bottom,height:r.height};});
   const id=nearestHistoryCard(rows,anchor,top,bottom,last.current);
   if(id&&id!==last.current){last.current=id;handlers.current.onPosition(id);publishHistoryPosition(id,'catalogue');}
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  const catalogueScroll=(event:Event)=>{
   const target=event.target;
   const catalogue=room.querySelector('.room-catalogue');
   // Captured scroll events also come from the rail and the preview. Neither
   // moves catalogue cards, and following them would undo a manual selection.
   if(target===document||target===document.scrollingElement||target===window||
    (target instanceof Element&&(target.contains(room)||target===catalogue||catalogue?.contains(target))))queue();
  };
  const stopFollowing=()=>{following=false;if(releaseTimer)clearTimeout(releaseTimer);releaseTimer=undefined;};
  const interrupt=(event:Event)=>{
   if(room.querySelector('.room-preview')?.contains(event.target as Node))return;
   const target=event.target;
   if(target instanceof Element&&(room.contains(target)||target.contains(room))){
    // Scrolling interrupts an outstanding animated jump, not the user's choice.
    cancelAnimationFrame(navigateFrame);navigateFrame=0;stopFollowing();queue();
   }
  };
  const keyboard=(event:KeyboardEvent)=>{
   if(!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)||event.defaultPrevented)return;
   const target=event.target;
   if(target instanceof Element&&target.closest('input,textarea,select,button,a,[contenteditable="true"],[role="slider"]'))return;
   interrupt(event);
  };
  const navigate=(id:string,motion:'scrub'|'select',restoreView=false)=>{
   manualSelection.current=true;following=true;last.current=id;handlers.current.onNavigate(id,restoreView);
   if(releaseTimer)clearTimeout(releaseTimer);releaseTimer=undefined;if(navigateFrame)cancelAnimationFrame(navigateFrame);
   // Wait for filter/pane changes to commit, then position the matching card.
   navigateFrame=requestAnimationFrame(()=>{navigateFrame=requestAnimationFrame(()=>{
    navigateFrame=0;const row=room.querySelector<HTMLElement>(`[data-history-id="${id}"]`);
    if(!row){stopFollowing();return;}
    // Clearing filters may reset the browsing state between these frames.
    manualSelection.current=true;
    if(!restoreView||getComputedStyle(room.querySelector('.room-catalogue')!).display!=='none')row.scrollIntoView({block:'center',inline:'nearest',behavior:motion==='select'&&!reduced()?'smooth':'instant'});
    // This acknowledges a rail position; it is not another manual card click.
    publishHistoryPosition(id,'catalogue');
    releaseTimer=setTimeout(stopFollowing,motion==='select'&&!reduced()?1000:120);
   });});
  };
  const position=(event:Event)=>{
   const d=(event as CustomEvent<HistoryPosition>).detail;
   if(!d)return;
   if(d.source==='catalogue'){
    last.current=d.id;
    if(d.motion==='select'){
     manualSelection.current=true;
     // A click wins over a previously queued scroll sample or rail jump,
     // including clicks on introductory guides without a historical-node ID.
     cancelAnimationFrame(frame);frame=0;
     cancelAnimationFrame(navigateFrame);navigateFrame=0;
     stopFollowing();
    }
    return;
   }
   if(!/^\d{3}$/.test(d.id))return;
   if(d.source==='rail')navigate(d.id,d.motion);
  };
  const restore=()=>{const hash=historyHashId(window.location.hash);const requested=/^node-(\d{3})$/.exec(new URLSearchParams(window.location.search).get('selected')??'')?.[1];const id=hash??(requested&&(!window.location.hash||window.location.hash==='#topic-catalogue')&&room.querySelector(`[data-history-id="${requested}"]`)?requested:null);if(id)navigate(id,'scrub',true);};
  window.addEventListener(HISTORY_POSITION,position);
  document.addEventListener('scroll',catalogueScroll,true);window.addEventListener('resize',queue);
  document.addEventListener('wheel',interrupt,{passive:true});document.addEventListener('touchstart',interrupt,{passive:true});
  document.addEventListener('keydown',keyboard);document.addEventListener('pointerdown',interrupt,{passive:true});
  window.addEventListener('hashchange',restore);
  restore();
  return()=>{window.removeEventListener(HISTORY_POSITION,position);document.removeEventListener('scroll',catalogueScroll,true);window.removeEventListener('resize',queue);document.removeEventListener('wheel',interrupt);document.removeEventListener('touchstart',interrupt);document.removeEventListener('keydown',keyboard);document.removeEventListener('pointerdown',interrupt);window.removeEventListener('hashchange',restore);cancelAnimationFrame(frame);cancelAnimationFrame(navigateFrame);if(releaseTimer)clearTimeout(releaseTimer);};
 },[enabled,roomRef]);
}
