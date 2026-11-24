 'use client';
import {useEffect} from 'react';
export function NavigationPreparation(){
 useEffect(()=>{
  const connection=(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}).connection;
  if(connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType??''))return;
  if(!HTMLScriptElement.supports?.('speculationrules'))return;
  const script=document.createElement('script');script.type='speculationrules';
  script.textContent=JSON.stringify({prefetch:[{where:{and:[{href_matches:'/en/*'},{selector_matches:'.header-navigation a,.room-read,.room-record-link,.room-cover-title a'}]},eagerness:'moderate'},{where:{and:[{href_matches:'/zh/*'},{selector_matches:'.header-navigation a,.room-read,.room-record-link,.room-cover-title a'}]},eagerness:'moderate'}]});
  document.head.appendChild(script);return()=>{if(script.parentNode)script.parentNode.removeChild(script);};
 },[]);
 return null;
}
