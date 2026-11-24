'use client';
import {useState} from 'react';
import {topicVisualById} from '@/lib/topic-images';
export function TopicIllustration({id,locale,variant='detail'}:{id:string;locale:'zh'|'en';variant?:'detail'|'thumbnail'}){
 const [failed,setFailed]=useState<string|null>(null),v=topicVisualById.get(id),zh=locale==='zh';
 if(variant==='thumbnail'){
  const available=v&&failed!==id;
  return <span className={'room-card-image'+(!available?' is-empty':'')} data-card-image={id||undefined}>
   {available?<><img src={v.src} width={v.width} height={v.height} alt={v.caption[locale]} title={v.credit[locale]} loading="lazy" decoding="async" draggable={false} onError={()=>setFailed(id)}/><span className="room-card-image-label">{v.kind==='source-page-capture'?(zh?'来源网页摘录':'SOURCE PAGE EXCERPT')+' · '+v.capturedAt:v.kind==='publisher-graphic'?(zh?'来源网站展示图':'PUBLISHER GRAPHIC'):v.kind==='document-page'?(zh?'原始文件页':'SOURCE DOCUMENT PAGE'):(zh?'资料图':'SOURCE IMAGE')}</span></>:<span>{v?(zh?'图片暂时无法加载':'Image unavailable'):(zh?'史料图片待补':'Source image pending')}</span>}
  </span>;
 }
 if(!v)return null;
 if(failed===id)return <p className="history-image-unavailable"><a href={v.sourceUrl}>{zh?'查看原始图像来源':'View original image source'} ↗</a></p>;
 return <figure className="history-illustration topic-illustration" data-topic-visual={id} key={id}>
  <div className="history-visual-label"><span>{v.kind==='source-page-capture'?(zh?'来源网页摘录':'SOURCE PAGE EXCERPT')+' · '+v.capturedAt:v.kind==='publisher-graphic'?(zh?'来源网站展示图':'PUBLISHER GRAPHIC'):v.kind==='document-page'?(zh?'原始文件页':'SOURCE DOCUMENT PAGE'):(zh?'相关原始资料图':'RELATED SOURCE IMAGE')}</span></div>
  <a className="history-image-open" href={v.src} target="_blank" rel="noreferrer" aria-label={(zh?'查看完整配图：':'View full image: ')+v.caption[locale]}><img src={v.src} width={v.width} height={v.height} alt={v.caption[locale]} loading="lazy" decoding="async" onError={()=>setFailed(id)}/><span>{zh?'查看大图':'View full image'} ↗</span></a>
  <figcaption><p>{v.caption[locale]}</p><p className="history-visual-credit">{v.credit[locale]}</p><a href={v.sourceUrl} target="_blank" rel="noreferrer">{zh?'资料出处':'Source'} · {v.sourceTitle[locale]} ↗</a></figcaption>
 </figure>;
}
