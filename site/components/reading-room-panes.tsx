'use client';
import {useEffect,useRef,useState} from 'react';
import {useLanguage} from './site-shell';
export function readingPreviewHeight(top:number,viewportTop:number,viewportBottom:number){
 return Math.max(1,Math.floor(viewportBottom-Math.max(top,viewportTop+20)-20));
}
export function useReadingRoomPanes(){
 const roomRef=useRef<HTMLElement>(null);
 const [pane,setPane]=useState<'catalogue'|'preview'>('catalogue');
 const currentPane=useRef<'catalogue'|'preview'>('catalogue');
 const catalogueScroll=useRef<number|null>(null);
 const previewSelection=useRef<string|null>(null);
 const animation=useRef(0);
 useEffect(()=>{
  const room=roomRef.current,preview=room?.querySelector<HTMLElement>('.room-preview');
  if(!room||!preview)return;
  let frame=0;
  const measure=()=>{
   frame=0;
   const visual=window.visualViewport;
   let top=visual?.offsetTop??0,bottom=Math.min(window.innerHeight,top+(visual?.height??window.innerHeight));
   if(document.documentElement.dataset.fold==='single-segment'){
    const bounds=room.closest('.viewport-frame')?.getBoundingClientRect();
    if(bounds){top=Math.max(top,bounds.top);bottom=Math.min(bottom,bounds.bottom);}
   }
   const value=readingPreviewHeight(preview.getBoundingClientRect().top,top,bottom)+'px';
   if(preview.style.getPropertyValue('--room-preview-height')!==value)preview.style.setProperty('--room-preview-height',value);
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  // Inner scrolling does not change the space available to this pane.
  const outerScroll=(event:Event)=>{if(event.target instanceof Node&&preview.contains(event.target))return;queue();};
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(queue);
  observer?.observe(room);observer?.observe(preview);
  measure();
  document.addEventListener('scroll',outerScroll,true);window.addEventListener('resize',queue);
  window.visualViewport?.addEventListener('resize',queue);window.visualViewport?.addEventListener('scroll',queue);
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();document.removeEventListener('scroll',outerScroll,true);window.removeEventListener('resize',queue);window.visualViewport?.removeEventListener('resize',queue);window.visualViewport?.removeEventListener('scroll',queue);preview.style.removeProperty('--room-preview-height');};
 },[]);
 function compact(){const room=roomRef.current;return !!room&&getComputedStyle(room.querySelector('.room-spread')??room).getPropertyValue('--room-split').trim()==='0'}
 function scrollFrame(){return document.documentElement.dataset.fold==='single-segment'?roomRef.current?.closest<HTMLElement>('.viewport-frame'):null}
 function changePane(next:'catalogue'|'preview',focus:boolean){
  const narrow=compact();
  if(narrow&&currentPane.current==='catalogue'&&next==='preview')catalogueScroll.current=scrollFrame()?.scrollTop??window.scrollY;
  currentPane.current=next;setPane(next);
  cancelAnimationFrame(animation.current);
  if(!focus||!narrow)return;
  animation.current=requestAnimationFrame(()=>{
   const room=roomRef.current;if(!room||!compact())return;
   const target=room.querySelector<HTMLElement>(next==='preview'?'.room-cover-title a':'.room-record.is-selected .room-select')??room.querySelector<HTMLElement>('.room-heading h1');
   if(target?.tagName==='H1')target.tabIndex=-1;target?.focus({preventScroll:true});
   if(next==='preview')room.scrollIntoView({block:'start',behavior:'instant'});
   else if(catalogueScroll.current!==null){const options={top:catalogueScroll.current,behavior:'instant' as ScrollBehavior};const frame=scrollFrame();if(frame)frame.scrollTo(options);else window.scrollTo(options);}
   else target?.scrollIntoView({block:'center',behavior:'instant'});
  });
 }
 useEffect(()=>{
  const fromUrl=()=>new URLSearchParams(window.location.search).get('pane')==='preview'?'preview':'catalogue';
  const restore=()=>{const next=fromUrl();if(next!==currentPane.current)changePane(next,true)};
  const returnToCatalogue=()=>{if(window.location.hash==='#topic-catalogue')showPane('catalogue')};
  // A copied link or language switch retains the mobile reading view.
  currentPane.current=fromUrl();setPane(currentPane.current);
  window.addEventListener('popstate',restore);window.addEventListener('archive-search',restore);window.addEventListener('hashchange',returnToCatalogue);
  return()=>{window.removeEventListener('popstate',restore);window.removeEventListener('archive-search',restore);window.removeEventListener('hashchange',returnToCatalogue);cancelAnimationFrame(animation.current)};
 },[]);
 function showPane(next:'catalogue'|'preview',focus=true,selectionId?:string){
  if(selectionId&&selectionId!==previewSelection.current){
   previewSelection.current=selectionId;
   // A new record starts at its heading without moving the catalogue or page.
   const preview=roomRef.current?.querySelector<HTMLElement>('.room-preview');
   if(preview)preview.scrollTop=0;
  }
  const narrow=compact(),changed=next!==currentPane.current;
  changePane(next,focus);
  if(!narrow)return;
  const params=new URLSearchParams(window.location.search);
  if(next==='preview')params.set('pane','preview');else params.delete('pane');
  const url=window.location.pathname+(params.size?'?'+params.toString():'')+window.location.hash;
  if(changed&&focus)window.history.pushState(window.history.state,'',url);else window.history.replaceState(window.history.state,'',url);
  window.dispatchEvent(new Event('archive-search'));
 }
 return {roomRef,pane,showPane};
}
export function ReadingRoomPanes({pane,onChange}:{pane:'catalogue'|'preview';onChange:(pane:'catalogue'|'preview')=>void}){
 const {lang}=useLanguage(),zh=lang==='zh';
 return <nav className="room-pane-navigation" aria-label={zh?'阅览视图':'Reading views'}><button type="button" aria-pressed={pane==='catalogue'} onClick={()=>onChange('catalogue')}>{zh?'目录':'Catalogue'}</button><button type="button" aria-pressed={pane==='preview'} onClick={()=>onChange('preview')}>{zh?'所选介绍':'Selected entry'}</button></nav>;
}
