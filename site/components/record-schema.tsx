import {getArchive,siteOrigin,type Locale} from '@/lib/i18n';
import {recordGraph} from '@/lib/search-records.mjs';
export function RecordSchema({kind,id,locale}:{kind:'cases'|'events'|'documents'|'sources';id:string;locale:Locale}){
 const data=getArchive(locale),row=data[kind].find(r=>r.id===id);
 const graph=recordGraph(kind,row,data,locale,siteOrigin);
 return graph?<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replaceAll('<','\\u003c')}}/>:null;
}
