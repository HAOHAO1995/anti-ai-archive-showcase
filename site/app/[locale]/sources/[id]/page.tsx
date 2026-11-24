import {notFound} from 'next/navigation';
import {getArchive,isLocale,languageMetadata} from '@/lib/i18n';
import {recordDescription} from '@/lib/search-records.mjs';
import {RecordSchema} from '@/components/record-schema';
import {RecordDetail} from '@/components/record-detail';
type Props={params:Promise<{locale:string;id:string}>};
export async function generateMetadata({params}:Props){const {id,locale}=await params;if(!isLocale(locale))return {};const row=getArchive(locale).sources.find(r=>r.id===id);return languageMetadata(`/sources/${id}`,locale,row?.title??(locale==='zh'?'记录未找到':'Record not found'),recordDescription('sources',row,getArchive(locale),locale));}
export default async function Page({params}:Props){const {id,locale}=await params;if(!isLocale(locale)||!getArchive(locale).sources.some(r=>r.id===id))notFound();return <><RecordSchema kind="sources" id={id} locale={locale}/><RecordDetail kind="sources" id={id}/></>;}
