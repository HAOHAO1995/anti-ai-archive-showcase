import {isLocale,localizedPath,unlocalizedPath,type Locale} from './locale';
export {isLocale,localizedPath,unlocalizedPath,type Locale} from './locale';
import translations from './data/i18n/translations.json';
import {siteDescriptions,siteName} from './site-identity.mjs';
import {archive as originalArchive,type Data} from './archive';


const dictionary=translations as Record<string,{en?:string;zh?:string}>;
export function translate(text:string|null|undefined,locale:Locale):string {if(!text)return '';return text==='电子游戏表演'?(locale==='zh'?text:'Video-game performance'):dictionary[text]?.[locale]??text;}
// Search indexes all language variants, even when the rendered record is translated.
const variants=new Map<string,string>();
for(const [source,e] of Object.entries(dictionary)){
 const all=[source,e.zh,e.en].filter(Boolean).join(' ');
 for(const text of [source,e.zh,e.en])if(text)variants.set(text,all);
}
export const searchVariants=(text:string)=>variants.get(text)??text;
export const documentTypeLabels:Record<string,[string,string]>={
 'artist-essay':['艺术家文章','Artist essay'],'artist-letter':['艺术家书信','Artist letter'],'artwork':['艺术作品','Artwork'],'artwork-description':['作品说明','Artwork description'],'audiovisual-work-page':['视听作品页','Audiovisual work page'],'award-rules':['奖项规则','Award rules'],'campaign-page':['倡议页面','Campaign page'],'collective-agreement-summary':['集体协议摘要','Collective agreement summary'],'community-discussion':['社群讨论','Community discussion'],'conference-report':['会议报告','Conference report'],'contract':['合同','Contract'],'editorial-policy':['编辑政策','Editorial policy'],'event-announcement':['活动公告','Event announcement'],'event-programme':['活动议程','Event programme'],'exhibition-documentation':['展览记录','Exhibition documentation'],'exhibition-programme':['展览安排','Exhibition programme'],'institutional-report':['机构报告','Institutional report'],'institutional-statement':['机构声明','Institutional statement'],'interview':['访谈','Interview'],'interview-transcript':['访谈文字记录','Interview transcript'],'investigation-report':['调查报告','Investigation report'],'judicial-opinion':['司法意见','Judicial opinion'],'manifesto-project-page':['宣言项目页','Manifesto project page'],'meeting-minutes':['会议记录','Meeting minutes'],'membership-policy':['会员政策','Membership policy'],'model-contract':['示范合同','Model contract'],'organizational-statement':['组织声明','Organisational statement'],'presentation':['演讲材料','Presentation'],'presentation-slides':['演讲幻灯片','Presentation slides'],'professional-guidelines':['职业指南','Professional guidelines'],'programme':['活动安排','Programme'],'project-report':['项目报告','Project report'],'protest-comic':['抗议漫画','Protest comic'],'public-comment':['公开评论','Public comment'],'release-announcement':['发布公告','Release announcement'],'research-database':['研究数据库','Research database'],'research-essay':['研究论述','Research essay'],'research-report':['研究报告','Research report'],'statement-republication':['声明转载','Statement republication'],'survey-announcement':['调查公告','Survey announcement'],'survey-report':['调查结果报告','Survey report'],'talk-transcript':['发言文字记录','Talk transcript'],'terms-of-service':['服务条款','Terms of service'],'toolkit':['工具包','Toolkit'],
 'administrative-decision':['行政决定','Administrative decision'],'artist-project-page':['艺术家项目页','Artist project page'],'artist-statement':['艺术家声明','Artist statement'],'campaign-update':['行动进展','Campaign update'],'campaign-circular':['行动通告','Campaign circular'],'collective-agreement':['集体协议','Collective agreement'],'company-announcement':['公司公告','Company announcement'],'complaint':['投诉或诉状','Complaint'],'contract-summary':['合同摘要','Contract summary'],'corporate-filing':['公司申报','Corporate filing'],'court-complaint':['法院诉状','Court complaint'],'court-docket':['法院案卷','Court docket'],'court-opinion':['法院意见','Court opinion'],'court-order':['法院命令','Court order'],'exhibition-document':['展览文献','Exhibition document'],'hearing-transcript':['听证逐字记录','Hearing transcript'],'institution-announcement':['机构公告','Institutional announcement'],'institutional-publication':['机构出版物','Institutional publication'],'interview-report':['采访报道','Interview report'],'joint-press-release':['联合新闻稿','Joint press release'],'joint-statement':['联合声明','Joint statement'],'judicial-institution-report':['司法机构说明','Judicial institution report'],'legal-brief':['法律书状','Legal brief'],'legislation':['立法文本','Legislation'],'legislative-submission':['立法意见书','Legislative submission'],'litigant-update':['诉讼当事方进展','Litigant update'],'manifesto':['宣言','Manifesto'],'member-survey':['会员调查','Member survey'],'news-report':['新闻报道','News report'],'open-letter':['公开信','Open letter'],'organization-report-release':['组织报告发布','Organisation report release'],'organization-statement':['组织声明','Organisation statement'],'platform-policy':['平台政策','Platform policy'],'position-paper-release':['立场书发布','Position paper release'],'press-commentary':['媒体评论','Press commentary'],'press-interview':['媒体采访','Press interview'],'press-report':['媒体报道','Press report'],'product-changelog':['产品更新记录','Product changelog'],'public-statement':['公开声明','Public statement'],'ratification-message':['批准通知','Ratification message'],'release-notes':['版本说明','Release notes'],'research-metadata':['研究元数据','Research metadata'],'software-release-notes':['软件版本说明','Software release notes'],'sound-work':['声音作品','Sound work'],'survey':['调查','Survey'],'union-announcement':['工会公告','Union announcement'],'union-ratification-announcement':['工会批准公告','Union ratification announcement'],'union-statement':['工会声明','Union statement']};
export const typeLabel=(type:string,locale:Locale)=>documentTypeLabels[type]?.[locale==='zh'?0:1]??type.replaceAll('-',' ');
const fields=new Set(['title','summary','what_changed','historical_significance','notes','research_significance','description','material_description','claim','locator','creator_credit','publisher','author','name','translation_zh']);
function convert(value:unknown,locale:Locale,key=''):unknown {
 if(typeof value==='string')return fields.has(key)?translate(value,locale):value;
 if(Array.isArray(value))return value.map(v=>convert(v,locale,key));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,convert(v,locale,k)]));
 return value;
}
const localized=new Map<Locale,Data>();
export function getArchive(locale:Locale):Data{
 if(!localized.has(locale)){
  const data=convert(originalArchive,locale) as Data;
  data.taxonomy.fields=Object.fromEntries(Object.entries(originalArchive.taxonomy.fields).map(([k,v])=>[k,translate(v,locale)]));
  data.taxonomy.fields['games-performance']=locale==='zh'?'电子游戏表演':'Video-game performance';
  data.taxonomy.claims_status=Object.fromEntries(Object.entries(originalArchive.taxonomy.claims_status).map(([k,v])=>[k,translate(v,locale)]));
  localized.set(locale,data);
 }
 return localized.get(locale)!;
}


export const siteOrigin=(process.env.NEXT_PUBLIC_SITE_ORIGIN??'https://salondesrefuses.cn').replace(/\/$/,'');
export function languageMetadata(path:string,locale:Locale,title:string,description?:string){
 const summary=description?.trim()||siteDescriptions[locale],url=`${siteOrigin}${localizedPath(path,locale)}`;
 return {title,description:summary,
  openGraph:{type:'website' as const,title,description:summary,url,siteName,locale:locale==='zh'?'zh_CN':'en_US',alternateLocale:[locale==='zh'?'en_US':'zh_CN'],images:[{url:siteOrigin+'/images/red-puzzle.jpg',alt:siteName}]},
  twitter:{card:'summary' as const,title,description:summary,images:[siteOrigin+'/images/red-puzzle.jpg']},
  alternates:{canonical:url,languages:{en:`${siteOrigin}${localizedPath(path,'en')}`,'zh-CN':`${siteOrigin}${localizedPath(path,'zh')}`,'x-default':`${siteOrigin}${localizedPath(path,'en')}`}}};
}
