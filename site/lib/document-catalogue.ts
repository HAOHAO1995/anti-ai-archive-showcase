import authored from './data/authored-documents.json';
import {getArchive,searchVariants,typeLabel,type Locale} from './i18n';
export function documentCatalogue(lang:Locale){const archive=getArchive(lang),zh=lang==='zh',t=(cn:string,en:string)=>zh?cn:en;
 const other=getArchive(zh?'en':'zh');
 const otherDocuments=new Map(other.documents.map(d=>[d.id,d]));
 return [...authored.map(d=>({id:d.id,title:d.title[lang],alternative:d.title[zh?'en':'zh'],description:d.description[lang],subtitle:d.description[lang],date:d.dateLabel[lang],year:d.year,author:zh?d.author:'CHEN HAOHAO',kind:d.kind[lang],language:t('中文 / English','Chinese / English'),pinned:d.pinned,full:true,search:[d.title.zh,d.title.en,d.description.zh,d.description.en,d.searchTerms,d.author,d.id].join(' ')})),...archive.documents.map(d=>{
  const alternative=otherDocuments.get(d.id);
  return {id:d.id,title:d.title,alternative:alternative?.title??'',description:d.description,subtitle:d.material_description||d.description,date:d.date??t('日期待核','Date unknown'),year:d.date?.slice(0,4)??'',author:d.creator_credit,kind:typeLabel(d.document_type,lang),language:d.language.toUpperCase(),pinned:false,full:false,search:[d.title,d.description,d.creator_credit,d.document_type,d.id,alternative?.title,alternative?.description,alternative?.creator_credit].filter((value):value is string=>typeof value==='string').map(searchVariants).join(' ')};
 })];
}
