'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {viewportLayout} from '@/lib/viewport-layout.mjs';
type Segment={x:number;y:number;width:number;height:number};
export function ViewportFrame({children}:{children:ReactNode}){
 const frame=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let raf=0,previousMode='continuous';
  const root=document.documentElement;
  const posture=(navigator as Navigator&{devicePosture?:EventTarget}).devicePosture;
  function refresh(){
   const segments=(window as Window&{viewport?:{segments?:Segment[]}}).viewport?.segments;
   const layout=viewportLayout(segments,window.innerWidth,window.innerHeight);
   const scroll=previousMode==='single-segment'?(frame.current?.scrollTop??0):window.scrollY;
   root.dataset.fold=layout.mode;
   const values:Record<string,number>={};
   if(layout.mode==='book'&&layout.left&&layout.right){
    values['left-x']=layout.left.x;values['left-width']=layout.left.width;values['right-x']=layout.right.x;values['right-width']=layout.right.width;values['gap']=layout.gap??0;
   }else if(layout.mode==='single-segment'){for(const [key,value] of Object.entries(layout.region))values[key]=value;}
   for(const key of ['left-x','left-width','right-x','right-width','gap','x','y','width','height']){
    if(key in values)root.style.setProperty('--fold-'+key,values[key]+'px');else root.style.removeProperty('--fold-'+key);
   }
   if(previousMode!==layout.mode){if(layout.mode==='single-segment')frame.current?.scrollTo({top:scroll,behavior:'instant'});else if(previousMode==='single-segment')window.scrollTo({top:scroll,behavior:'instant'});previousMode=layout.mode;}
  }
  function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(refresh)}
  refresh();window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);posture?.addEventListener('change',schedule);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);posture?.removeEventListener('change',schedule);delete root.dataset.fold;for(const key of ['left-x','left-width','right-x','right-width','gap','x','y','width','height'])root.style.removeProperty('--fold-'+key)};
 },[]);
 return <div className="viewport-frame" ref={frame}>{children}</div>;
}
