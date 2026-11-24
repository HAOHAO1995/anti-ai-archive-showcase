
'use client';
import genealogy from '@/lib/data/genealogy.json';
import {GenealogyProvenance} from './genealogy-provenance';
import {localizedPath,type Locale} from '@/lib/locale';
import {ArrowUpRight} from 'lucide-react';
const sourceKinds:Record<string,{zh:string;en:string}>={paper:{zh:'论文 / 原文',en:'Paper / original text'},official:{zh:'官方页面',en:'Official page'},catalogue:{zh:'机构馆藏 / 书目',en:'Institutional catalogue'},record:{zh:'官方档案',en:'Official record'}};
export default function GenealogyDetailContent({id,locale}:{id:string;locale:Locale}){const record=genealogy.records.find(r=>r.id===id),zh=locale==='zh';if(!record)return null;return <>
    <p className="genealogy-original" lang={record.originalLanguage}>{record.originalTitle}</p><p className="genealogy-actors">{record.actors}</p>
    <h4 className="genealogy-section-label">{zh?'历史背景与研究说明':'Historical context & research account'}</h4><p className="genealogy-summary">{record.summary[locale]}</p>
    {record.dateNote[locale]&&<p className="genealogy-date-note">{record.dateNote[locale]}</p>}
    <a className="genealogy-source" href={localizedPath('/art-history/'+record.id,locale)}><span>{zh?'阅读节点详情':'Read node details'}</span><ArrowUpRight size={14}/></a>
    <a className="genealogy-source" href={record.sourceUrl} target="_blank" rel="noreferrer"><span>{sourceKinds[record.sourceKind][locale]}<small>{new URL(record.sourceUrl).hostname.replace(/^www\./,'')}</small></span><ArrowUpRight size={14}/></a>
    {record.sourceNote[locale]&&<p className="genealogy-date-note">{record.sourceNote[locale]}</p>}
    <GenealogyProvenance record={record} locale={locale}/>

</>;}
