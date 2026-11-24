import {notFound,permanentRedirect} from 'next/navigation';
import {isLocale} from '@/lib/i18n';
import {legacyIndexRedirect} from '@/lib/index-navigation.mjs';
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){const {locale}=await params;if(!isLocale(locale))notFound();const q=await searchParams,url=new URL('/'+locale+'/cases','https://salondesrefuses.cn');for(const [key,value] of Object.entries(q))for(const v of Array.isArray(value)?value:value===undefined?[]:[value])url.searchParams.append(key,v);const target=new URL(legacyIndexRedirect(url.toString())!);permanentRedirect(target.pathname+target.search);}
