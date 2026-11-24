'use client';
import {useEffect,useState,useRef} from 'react';
import {Sun,Moon} from 'lucide-react';
import {appearanceKey,validAppearance} from '@/lib/appearance.mjs';

export function AppearanceToggle({locale}:{locale:'zh'|'en'}){
 const [theme,setTheme]=useState<'light'|'dark'>('light');
 const zh=locale==='zh';
 const buttonRef=useRef<HTMLButtonElement>(null);
 function apply(next:'light'|'dark'){
  document.documentElement.dataset.theme=next;
  document.documentElement.classList.toggle('dark',next==='dark');
  setTheme(next);
 }
 useEffect(()=>{
  apply(document.documentElement.dataset.theme==='dark'?'dark':'light');
  const sync=(event:StorageEvent)=>{if(event.key===appearanceKey||event.key===null)apply(event.newValue==='dark'?'dark':'light')};
  const nativeSync=()=>setTheme(document.documentElement.dataset.theme==='dark'?'dark':'light');
  buttonRef.current?.setAttribute('data-appearance-hydrated','');
  window.addEventListener('archive-appearance-change',nativeSync);
  window.addEventListener('storage',sync);
  return()=>{window.removeEventListener('storage',sync);window.removeEventListener('archive-appearance-change',nativeSync);buttonRef.current?.removeAttribute('data-appearance-hydrated');};
 },[]);
 function toggle(){
  const next=theme==='light'?'dark':'light';apply(next);
  try{localStorage.setItem(appearanceKey,next);sessionStorage.removeItem('archive-preview-theme')}catch{}
  // Old comparison links must not override a subsequent explicit choice.
  const url=new URL(window.location.href);
  if(validAppearance(url.searchParams.get('preview-theme'))){
   url.searchParams.delete('preview-theme');
   window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);
   window.dispatchEvent(new Event('archive-search'));
  }
 }
 const label=theme==='dark'?(zh?'切换为浅色模式':'Switch to light mode'):(zh?'切换为深色模式':'Switch to dark mode');
 return <button ref={buttonRef} type="button" className="preference-control appearance-toggle" onClick={toggle} aria-label={label} title={label}>
  {theme==='dark'?<Sun size={17} aria-hidden="true"/>:<Moon size={17} aria-hidden="true"/>}
  <span>{theme==='dark'?(zh?'浅色':'Light'):(zh?'深色':'Dark')}</span>
 </button>;
}
