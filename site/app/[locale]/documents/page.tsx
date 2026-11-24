import {DocumentReadingRoom} from '@/components/document-reading-room';
import {notFound} from 'next/navigation';
import {documentCatalogue} from '@/lib/document-catalogue';
import {isLocale,languageMetadata,getArchive} from '@/lib/i18n';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return isLocale(locale)?languageMetadata('/documents',locale,locale==='zh'?'文献与作品':'Documents & works'):{};}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <DocumentReadingRoom records={documentCatalogue(locale)} updated={getArchive(locale).updated}/>;}
