const labels={events:['事件记录','Event record'],cases:['案例档案','Case file'],documents:['文献编目','Document record'],sources:['来源编目','Source record']};
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
// Editorial catalogue summaries, grounded in the events visible on each case page.
// These describe the evidence collected, not independent findings about the dispute.
const caseDescriptions={
  'case-0001':['ArtStation / NoAI：记录可选标签、AI 内容筛选、默认 NoAI 与防爬措施的变化；抗议起点仍待补证。','ArtStation / NoAI: records the optional tag, AI-content filters, default NoAI policy and anti-scraping measures; evidence on the protest’s origins remains incomplete.'],
  'case-0018':['Glaze：记录 2023 年首次发布及相关文献，为研究艺术家防御工具提供入口；完整案史仍在补收。','Glaze: records the first release in 2023 and related documents as an entry point to artist defence tools; the full case history remains under research.'],
  'case-0034':['Nightshade：记录 2023 年论文提交及有关 2024 年工具开放下载的报道；完整案史仍在补收。','Nightshade: records the 2023 paper submission and reporting on the tool’s availability in 2024; the full case history remains under research.'],
  'case-0024':['SAG-AFTRA：从 2023 年影视罢工到 2026 年协议，追踪数字替身、合成表演者与集体谈判文件，区分临时协议和会员批准。','SAG-AFTRA: traces the 2023 screen strike through the 2026 agreement, with records on digital replicas, synthetic performers and bargaining, distinguishing tentative agreements from member ratification.'],
  'case-0028':['Udio：记录唱片公司 2024 年诉讼，以及 UMG、Warner Music 于 2025 年公布的和解与许可合作。','Udio: records the labels’ 2024 lawsuit and the settlement and licensing partnerships announced by UMG and Warner Music in 2025.'],
  'case-0027':['Suno：收录唱片公司诉讼、和解许可、v6 发布及训练同意澄清，保留权利人指控与已确认事项的区别。','Suno: collects records on labels’ lawsuits, settlement and licensing, the v6 release and training-consent clarifications, distinguishing rights holders’ allegations from established facts.'],
  'case-0019':['Seedance：记录 2026 年影视权利人指控、据报道发出的停止侵权函、平台回应及 MPA 与字节跳动公布的谅解备忘录。','Seedance: records film-industry allegations in 2026, reported cease-and-desist letters, the platform response and the memorandum announced by the MPA and ByteDance.'],
  'case-0011':['佳士得 Augmented Intelligence：并置 2025 年展售公告与要求取消 AI 拍卖的艺术家公开信，提供艺术市场争议的原始资料入口。','Christie’s Augmented Intelligence: brings together the 2025 sale announcement and artists’ letter calling for cancellation, with source links for research on the art-market dispute.'],
};

// Use complete, attributed source-derived prose: truncating an allegation can
// remove its qualification. Search engines may choose a shorter display snippet.
export function recordDescription(kind,row,data,locale){
  if(!row)return '';
  const zh=locale==='zh';
  if(kind==='cases'){
    if(caseDescriptions[row.id])return caseDescriptions[row.id][zh?0:1];
    const dated=(data.events??[]).filter(event=>event.case_id===row.id&&/^\d{4}-\d{2}-\d{2}$/.test(event.date)).sort((a,b)=>a.date.localeCompare(b.date));
    // Old collection-status summaries contain counts that become stale after a sync.
    const placeholder=/^本案已收录\d+个带日期节点|^已收录节点及文献见时间线|^This case contains .*dated events;|^Collected events and documents are linked in the timeline/.test(row.summary??'');
    if(placeholder&&dated.length){
      const range=dated[0].date===dated.at(-1).date?dated[0].date:`${dated[0].date}–${dated.at(-1).date}`;
      return zh?`${row.title}：现有档案含 ${dated.length} 个带日期事件（${range}），附事件时间线与来源；完整案史仍在补收。`:`${row.title}: ${dated.length} dated ${dated.length===1?'event':'events'} in the current archive (${range}), with a chronology and sources; the full case history remains under research.`;
    }
  }
  if(kind==='sources')return clean(`${row.title} — ${row.publisher}${row.publication_date?' · '+row.publication_date:''}. ${zh?'原文链接、核读定位与来源说明。':'Original link, reading location and source notes.'}`);
  const summary=kind==='documents'?row.description:row.summary;
  const first=summary?new Intl.Segmenter(locale,{granularity:'sentence'}).segment(clean(summary))[Symbol.iterator]().next().value?.segment:'';
  const text=clean(first);
  return clean(`${row.title}${zh?'。':'. '}${text||labels[kind][zh?0:1]}`);
}

export function recordGraph(kind,row,data,locale,origin){
  if(!row)return null;
  const zh=locale==='zh',url=`${origin}/${locale}/${kind}/${row.id}`;
  const sourceIds=kind==='events'||kind==='cases'?[...(row.primary_sources??[]),...(row.secondary_sources??[])]:kind==='documents'?(row.source_ids??[]):[row.id];
  const citations=[...new Set(sourceIds.map(id=>data.sources.find(s=>s.id===id)?.original_url).filter(Boolean))];
  const page={'@type':kind==='cases'?'CollectionPage':'WebPage','@id':url+'#page',url,name:row.title,
    description:recordDescription(kind,row,data,locale),inLanguage:zh?'zh-CN':'en',identifier:row.id,
    isPartOf:{'@id':origin+'/#website'},publisher:{'@id':origin+'/#project'},citation:citations,
    ...(row.updated_at&&/^\d{4}-\d{2}-\d{2}$/.test(row.updated_at)?{dateModified:row.updated_at}:{}),
  };
  // These are catalogue pages, not scholarly articles or the historical event itself.
  const trail=[{name:'ANTI-AI ARCHIVE',item:`${origin}/${locale}`}];
  if(kind!=='events')trail.push({name:labels[kind][zh?0:1],item:`${origin}/${locale}/${kind}`});
  trail.push({name:row.title,item:url});
  return {'@context':'https://schema.org','@graph':[page,{'@type':'BreadcrumbList',itemListElement:trail.map((v,i)=>({'@type':'ListItem',position:i+1,...v}))}]};
}
