import {mergedTopicRedirect} from './lib/topic-redirect.mjs';
import {legacyIndexRedirect} from './lib/index-navigation.mjs';
import handler from 'vinext/server/fetch-handler';
import {canonicalRedirect} from './lib/canonical-redirect.mjs';
interface Env { ASSETS: Fetcher; ARCHIVE_LOCAL_PREVIEW?:string }

export default {
 async fetch(request:Request,env:Env,ctx:ExecutionContext):Promise<Response>{
  const url=new URL(request.url),pathname=url.pathname;
  if (/^\/(images|media|documents|fonts)\//.test(pathname) && ['GET','HEAD'].includes(request.method)) {
   return Response.redirect(new URL(pathname, 'https://salondesrefuses.cn').href, 307);
  }
  // Converge confirmed public aliases before asset delivery; preserve query and path.
  // Wrangler simulates a production Host for local HTTP generation. Only the
  // local build commands set this binding; it is absent from deployed config.
  const canonical=env.ARCHIVE_LOCAL_PREVIEW==='1'?null:canonicalRedirect(request.url);
  if(canonical){
   return new Response(null,{status:308,headers:{Location:canonical}});
  }
  const merged=mergedTopicRedirect(request.url);if(merged&&(request.method==='GET'||request.method==='HEAD'))return new Response(null,{status:308,headers:{Location:merged}});
  const indexRedirect=legacyIndexRedirect(request.url);if(indexRedirect&&(request.method==='GET'||request.method==='HEAD'))return new Response(null,{status:308,headers:{Location:indexRedirect}});
  if((request.method==='GET'||request.method==='HEAD')&&/^\/(en|zh)\/topics\/?$/.test(pathname)){url.pathname=pathname.replace(/\/$/,'')+'/ai-art-history';return new Response(null,{status:308,headers:{Location:url.toString()}});}
  if((request.method==='GET'||request.method==='HEAD')&&request.headers.get('rsc')!=='1'){
   if(/^\/(en|zh)(?:\/[a-z0-9-]+)*\/?$/.test(pathname)){
    // Explicit filenames prevent the host from treating /zh/index as /zh/.
    const assetUrl=new URL(url);assetUrl.pathname=pathname.replace(/\/$/,'')+'.html';assetUrl.search='';
    const response=await env.ASSETS.fetch(new Request(assetUrl,request));
    if((response.status>=200&&response.status<300)||response.status===304){
     const headers=new Headers(response.headers);
     headers.set('Cache-Control','public, max-age=0, must-revalidate');
     headers.set('X-Archive-Delivery','prerendered');
     return new Response(response.body,{status:response.status,headers});
    }
   }else if(!pathname.startsWith('/_')&&!pathname.includes('.')){
    const preferences=(request.headers.get('accept-language')??'en').split(',').map((part,index)=>{const [tag,q]=part.trim().split(';q=');return {tag:tag.toLowerCase(),weight:q===undefined?1:Number(q),index};}).filter(p=>p.weight>0).sort((a,b)=>b.weight-a.weight||a.index-b.index);
    const chosen=preferences.find(p=>p.tag==='zh'||p.tag.startsWith('zh-')||p.tag==='en'||p.tag.startsWith('en-'));
    const locale=chosen?.tag.startsWith('zh')?'zh':'en';url.pathname=`/${locale}${pathname==='/'?'':pathname}`;
    return new Response(null,{status:307,headers:{Location:url.toString(),Vary:'Accept-Language'}});
   }
  }
  // Public pages bypass React rendering. The fallback handles local generation,
  // framework requests and missing routes.
  return handler.fetch(request,env,ctx);
 }
};
