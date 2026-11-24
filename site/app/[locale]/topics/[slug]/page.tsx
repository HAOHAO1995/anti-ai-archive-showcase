import {cultureSections} from '@/lib/culture-sections.mjs';
import {chronologicalNumber,timelineRecords} from '@/lib/genealogy-navigation.mjs';
import {topicIllustrationId} from '@/lib/topic-images';
import {notFound} from 'next/navigation';
import {getArchive,isLocale,languageMetadata,localizedPath,siteOrigin,searchVariants} from '@/lib/i18n';
import {regionName} from '@/lib/archive';
import topics from '@/lib/data/topics.json';
import genealogy from '@/lib/data/genealogy.json';
import researchReferences from '@/lib/data/ai-research-references.json';
import {TopicReadingRoom,type TopicReadingEntry} from '@/components/topic-reading-room';
type Params={params:Promise<{locale:string;slug:string}>};
export async function generateMetadata({params}:Params){const {locale,slug}=await params;const topic=topics.find(t=>t.slug===slug);return isLocale(locale)&&topic?languageMetadata(`/topics/${slug}`,locale,topic.title[locale],topic.description[locale]):{};}
export default async function Page({params}:Params){
 const {locale,slug}=await params;if(!isLocale(locale))notFound();const topic=topics.find(t=>t.slug===slug);if(!topic)notFound();
 const zh=locale==='zh',data=getArchive(locale),history=slug==='ai-art-history';
 const path=localizedPath(`/topics/${slug}`,locale),url=siteOrigin+path;
 const otherLocale=zh?'en':'zh',other=getArchive(otherLocale);
 const searchText=(...values:(string|null|undefined)[])=>values.filter((v):v is string=>typeof v==='string').map(searchVariants).join(' ');
 const entries:TopicReadingEntry[]=[{id:'guide',title:('overview' in topic?topic.overview?.title[locale]:null)??topic.title[locale],alternative:('overview' in topic?topic.overview?.title[otherLocale]:null)??topic.title[otherLocale],description:('overview' in topic?topic.overview?.body[locale]:null)??topic.intro[locale],year:'',date:'',credit:'ANTI-AI ARCHIVE',kind:'guide',href:history?'/art-history/guides/overview':`/topics/${slug}/guides/overview`,search:searchText(topic.title.zh,topic.title.en,topic.intro.zh,topic.intro.en)},...topic.sections.map(s=>({id:'guide-'+s.id,title:s.title[locale],alternative:s.title[otherLocale],description:s.body[locale],year:'',date:'',credit:'ANTI-AI ARCHIVE',kind:'guide' as const,href:history?'/art-history/guides/'+s.id:`/topics/${slug}/guides/${s.id}`,search:searchText(s.title.zh,s.title.en,s.body.zh,s.body.en)}))];
 if(slug==='culture-governance')for(const ref of researchReferences){
  const date=ref.publicationDate??ref.publicationYear??'';
  entries.push({id:ref.id,title:ref.title[locale],alternative:ref.title[otherLocale],description:ref.annotation[locale],year:date.slice(0,4),date,credit:[ref.author,ref.publisher].filter(Boolean).join(' · '),kind:'reference',href:`/topics/culture-governance/references/${ref.id}`,originalUrl:ref.url,originalLanguage:ref.language,illustrationId:topicIllustrationId(ref.documentId)??topicIllustrationId(ref.id),search:searchText(ref.title.zh,ref.title.en,ref.originalTitle,ref.category.zh,ref.category.en,ref.annotation.zh,ref.annotation.en,ref.author,ref.publisher,ref.id,ref.documentId,ref.url)});
 }
 if(history){for(const r of timelineRecords(genealogy.records))entries.push({id:'node-'+r.id,sequence:chronologicalNumber(genealogy.records,r.id),title:r.title[locale],alternative:r.title[otherLocale],description:r.summary[locale],year:String(r.year),date:r.date[locale],credit:r.actors,kind:'node',href:'/art-history/'+r.id,originalUrl:r.sourceUrl,originalLanguage:r.sourceLanguage,search:searchText(r.title.zh,r.title.en,r.summary.zh,r.summary.en,r.originalTitle,r.actors,'NODE-'+chronologicalNumber(genealogy.records,r.id))})}
 else{for(const id of topic.caseIds){
  const c=data.cases.find(c=>c.id===id)!,alt=other.cases.find(c=>c.id===id)!;
  entries.push({id:c.id,title:c.title,alternative:alt.title,description:c.summary,year:c.start_date?.slice(0,4)??'',date:c.start_date??'',credit:'',kind:'case',href:'/cases/'+c.id,illustrationId:topicIllustrationId(c.id),search:searchText(c.title,alt.title,c.summary,alt.summary,c.id)});
  for(const e of data.events.filter(e=>e.case_id===id).sort((a,b)=>(a.date??'').localeCompare(b.date??'')).filter((e,index)=>index<2||('eventIds' in topic&&topic.eventIds?.includes(e.id)))){
   const a=other.events.find(item=>item.id===e.id)!;
   entries.push({id:e.id,title:e.title,alternative:a.title,description:e.summary,year:e.date?.slice(0,4)??'',date:e.date??'',credit:e.regions.map(r=>regionName(r,locale)).join(' / '),kind:'event',href:'/events/'+e.id,illustrationId:topicIllustrationId(e.id),search:searchText(e.title,a.title,e.summary,a.summary,e.id,c.title,alt.title)});
  }
 }}
 if(!history)entries.push({id:'guide-references',title:zh?'延伸阅读、来源与引用':'Further reading, sources & citation',alternative:zh?'Further reading, sources & citation':'延伸阅读、来源与引用',description:slug==='culture-governance'?(zh?'八个艺术史与研究参考来源：概念、编年方法、艺术家口述和南美地域史，附用途与核读说明。':'Eight art-history and research references covering concepts, chronology, artist testimony and South America, with annotations and reading scope.'):(zh?'沿案例与原始资料继续阅读，了解如何引用本专题及其历史证据。':'Follow the cases and original sources, and learn how to cite this topic and its historical evidence.'),year:'',date:'',credit:'ANTI-AI ARCHIVE',kind:'guide',href:`/topics/${slug}/guides/references`,search:'引用 来源 citation sources references '+(slug==='culture-governance'?'Le Random Casey Reas DAM Giloth Pocock-Williams Digital Art Oracle Mosaic Studio ANF South America 南美 生成艺术':'')});

 for(const entry of entries){if(entry.kind==='guide'){
  entry.illustrationId=topicIllustrationId(`${slug}:${entry.id}`);
  if(history){const guide=topic.sections.find(s=>'guide-'+s.id===entry.id);const groups=(guide&&'contextGroups' in guide?guide.contextGroups:[]) as {nodeIds:string[]}[];for(const id of groups.flatMap(g=>g.nodeIds)){const work=genealogy.records.find(n=>n.id===id);if(work)entry.search+=' '+searchText(work.title.zh,work.title.en,work.originalTitle,work.actors);}}
 }}
 const paragraphs=topic.sections.map(s=>s.body[locale]);
 const schema={'@context':'https://schema.org','@graph':[
  {'@type':'CollectionPage','@id':url+'#page',url,name:topic.title[locale],description:topic.description[locale],inLanguage:zh?'zh-CN':'en',abstract:topic.intro[locale],text:paragraphs.join('\n\n'),...(slug==='culture-governance'?{citation:researchReferences.map(ref=>ref.url)}:{}),isPartOf:{'@id':siteOrigin+'/#website'},publisher:{'@id':siteOrigin+'/#project'}},
  {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'ANTI-AI ARCHIVE',item:siteOrigin+localizedPath('/',locale)},{'@type':'ListItem',position:2,name:zh?'研究专题':'Research guides',item:siteOrigin+localizedPath('/topics',locale)},{'@type':'ListItem',position:3,name:topic.shortTitle[locale],item:url}]}
 ]};
 return <main id="main" className="topic-page">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replaceAll('<','\\u003c')}}/>
  <TopicReadingRoom sections={slug==='culture-governance'?cultureSections(entries,data.events,locale):undefined} title={topic.shortTitle[locale]} description={topic.description[locale]} entries={entries} historyTimeline={history} guideHref={history?'/art-history/guides/overview':`/topics/${slug}/guides/overview`} updated={(topic as {updatedAt?:string}).updatedAt}/>

 </main>;
}
