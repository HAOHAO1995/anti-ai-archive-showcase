import {notFound,permanentRedirect} from 'next/navigation';
import {isLocale,localizedPath} from '@/lib/i18n';
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();permanentRedirect(localizedPath('/topics/ai-art-history',locale));}
