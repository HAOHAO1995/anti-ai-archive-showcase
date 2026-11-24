'use client';
import genealogy from '@/lib/data/genealogy-navigation.json';
import {chronologicalNumber} from '@/lib/genealogy-navigation.mjs';
import {useState} from 'react';
import visuals from '@/lib/data/genealogy-illustrations.json';
export type HistoryVisual={nodeId:string;kind:string;src?:string;width?:number;height?:number;caption:{zh:string;en:string};alt:{zh:string;en:string};credit:{zh:string;en:string};sourceUrl:string;sourceTitle:string;sourceTitleLocalized?:{zh:string;en:string};title:{zh:string;en:string};rights:{zh:string;en:string}};
const catalogue=visuals.records as HistoryVisual[];
const byNode=new Map(catalogue.map(v=>[v.nodeId,v]));
const sequenceByNode=new Map(genealogy.records.map(r=>[r.id,chronologicalNumber(genealogy.records,r.id)]));
export function HistoryIllustration({nodeId,locale,variant='detail'}:{nodeId:string;locale:'zh'|'en';variant?:'detail'|'thumbnail'}){
 const visual=byNode.get(nodeId);
 return visual?.src&&visual.kind!=='pending'?<Illustration key={nodeId} visual={visual} locale={locale} variant={variant}/>:variant==='thumbnail'?<span className="room-card-image is-empty"><span>{locale==='zh'?'史料图片待补':'Source image pending'}</span></span>:null;
}
function Illustration({visual,locale,variant}:{visual:HistoryVisual;locale:'zh'|'en';variant:'detail'|'thumbnail'}){
 const [failed,setFailed]=useState(false),zh=locale==='zh';
 if(variant==='thumbnail')return <span className={'room-card-image'+(failed?' is-empty':'')} data-card-node={visual.nodeId}>{failed?<span>{zh?'图片暂时无法加载':'Image unavailable'}</span>:<><img src={visual.src} alt={visual.alt[locale]} title={visual.credit[locale]} width={visual.width} height={visual.height} loading="lazy" decoding="async" draggable={false} onError={()=>setFailed(true)}/><span className="room-card-image-label">{visual.kind==='paper-page'?(zh?'原始文献':'ORIGINAL DOCUMENT'):(zh?'历史资料图':'SOURCE IMAGE')}</span></>}</span>;
 if(failed)return <p className="history-image-unavailable"><a href={visual.sourceUrl} target="_blank" rel="noreferrer">{zh?'图片暂时无法加载，查看原始资料 ↗':'Image unavailable; view the original source ↗'}</a></p>;
 return <figure className="history-illustration" data-visual-node={visual.nodeId} data-visual-kind={visual.kind}>
  <div className="history-visual-label"><span>{visual.kind==='paper-page'?(zh?'原始文献':'ORIGINAL DOCUMENT'):(zh?'历史资料配图':'SOURCE IMAGE')}</span><span>{sequenceByNode.get(visual.nodeId)?'#'+sequenceByNode.get(visual.nodeId):(zh?'专题作品':'THEMATIC WORK')}</span></div>
  <a className="history-image-open" href={visual.src} target="_blank" rel="noreferrer" aria-label={(zh?'查看完整配图：':'View full image: ')+visual.title[locale]}><img src={visual.src} alt={visual.alt[locale]} width={visual.width} height={visual.height} loading="lazy" decoding="async" onError={()=>setFailed(true)}/><span>{zh?'查看大图 ↗':'View full image ↗'}</span></a>
  <figcaption><p>{visual.caption[locale]}</p><p className="history-visual-credit">{visual.credit[locale]} · {visual.rights[locale]}</p><a href={visual.sourceUrl} target="_blank" rel="noreferrer">{zh?'资料出处':'Source'} · <span>{visual.sourceTitleLocalized?.[locale]??visual.sourceTitle}</span> ↗</a>{visual.sourceTitleLocalized&&<details className="original-source-metadata"><summary>{zh?'查看来源原题':'View original source title'}</summary><p>{visual.sourceTitle}</p></details>}</figcaption>
 </figure>;
}
