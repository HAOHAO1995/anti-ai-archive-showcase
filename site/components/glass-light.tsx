'use client';
import {useEffect} from 'react';

// Only the hovered surface updates. No per-card handlers or animation loop.
const surfaces='.room-cover,.room-record,.event-row,.catalog-row,.record-header,.topic-case,.topic-index>a,.linked-cases>a,.region-grid>a,.people-grid>a';
export function GlassLight(){
 useEffect(()=>{
  const pointer=matchMedia('(hover: hover) and (pointer: fine)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)');
  let active:HTMLElement|null=null,raf=0,x=0,y=0;
  function reset(){cancelAnimationFrame(raf);raf=0;active?.style.removeProperty('--glass-x');active?.style.removeProperty('--glass-y');active=null;}
  function paint(){raf=0;if(!active?.isConnected){reset();return;}const r=active.getBoundingClientRect();if(r.width&&r.height){active.style.setProperty('--glass-x',`${Math.max(0,Math.min(100,(x-r.left)/r.width*100))}%`);active.style.setProperty('--glass-y',`${Math.max(0,Math.min(100,(y-r.top)/r.height*100))}%`);}}
  function move(e:PointerEvent){
   if(e.pointerType!=='mouse'||!pointer.matches||reduced.matches){reset();return;}
   const target=e.target instanceof Element?e.target.closest<HTMLElement>(surfaces):null;
   if(target!==active){reset();active=target;}
   if(!active)return;x=e.clientX;y=e.clientY;if(!raf)raf=requestAnimationFrame(paint);
  }
  function leave(e:PointerEvent){if(!e.relatedTarget)reset();}
  document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerout',leave,{passive:true});
  window.addEventListener('blur',reset);document.addEventListener('scroll',reset,{passive:true,capture:true});
  pointer.addEventListener('change',reset);reduced.addEventListener('change',reset);
  return()=>{reset();document.removeEventListener('pointermove',move);document.removeEventListener('pointerout',leave);window.removeEventListener('blur',reset);document.removeEventListener('scroll',reset,true);pointer.removeEventListener('change',reset);reduced.removeEventListener('change',reset);};
 },[]);
 return null;
}
