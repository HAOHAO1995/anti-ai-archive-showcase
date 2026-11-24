import {notFound} from 'next/navigation';
import {getArchive,isLocale,languageMetadata} from '@/lib/i18n';
import {recordDescription} from '@/lib/search-records.mjs';
import {RecordSchema} from '@/components/record-schema';
import {RecordDetail} from '@/components/record-detail';
type Props={params:Promise<{locale:string;id:string}>};
export async function generateMetadata({params}:Props){const {id,locale}=await params;if(!isLocale(locale))return {};const row=getArchive(locale).documents.find(r=>r.id===id);return languageMetadata(`/documents/${id}`,locale,row?.title??(locale==='zh'?'记录未找到':'Record not found'),recordDescription('documents',row,getArchive(locale),locale));}
export default async function Page({params}:Props){const {id,locale}=await params;if(!isLocale(locale)||!getArchive(locale).documents.some(r=>r.id===id))notFound();return <><RecordSchema kind="documents" id={id} locale={locale}/><RecordDetail kind="documents" id={id}/></>;}
