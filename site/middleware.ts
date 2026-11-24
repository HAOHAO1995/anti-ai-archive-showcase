import {mergedTopicRedirect} from './lib/topic-redirect.mjs';
import {NextRequest,NextResponse} from 'next/server';
export function middleware(request:NextRequest){
 const merged=mergedTopicRedirect(request.url);if(merged)return NextResponse.redirect(merged,308);
 const path=request.nextUrl.pathname;
 const routeLocale=path.match(/^\/(en|zh)(?:\/|$)/)?.[1];
 if(routeLocale){const headers=new Headers(request.headers);headers.set('x-archive-locale',routeLocale);return NextResponse.next({request:{headers}});}
 if(path.startsWith('/_')||path.includes('.'))return NextResponse.next();
 const languages=(request.headers.get('accept-language')??'en').split(',').map((part,index)=>{const [tag,q]=part.trim().split(';q=');return {tag:tag.toLowerCase(),weight:q===undefined?1:Number(q),index};}).filter(v=>v.weight>0).sort((a,b)=>b.weight-a.weight||a.index-b.index);
 const chosen=languages.find(v=>v.tag==='zh'||v.tag.startsWith('zh-')||v.tag==='en'||v.tag.startsWith('en-'));
 const locale=chosen?.tag.startsWith('zh')?'zh':'en';
 const url=request.nextUrl.clone();url.pathname=`/${locale}${path==='/'?'':path}`;
 const response=NextResponse.redirect(url,307);response.headers.set('Vary','Accept-Language');return response;
}
export const config={matcher:['/((?!_next|images|favicon.ico|robots.txt|sitemap.xml).*)']};
