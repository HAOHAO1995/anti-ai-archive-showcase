'use client';
import {getArchive,translate} from '@/lib/i18n';
import {useLanguage} from './site-shell';
export const useArchive=()=>getArchive(useLanguage().lang);
export const useTranslation=()=>{const {lang}=useLanguage();return (text:string|null|undefined)=>translate(text,lang);};
