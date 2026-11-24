import {UnifiedIndex} from '@/components/unified-index';
import {isLocale,languageMetadata} from '@/lib/i18n';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return isLocale(locale)?languageMetadata('/index',locale,'Index',locale==='zh'?'检索案例、人物与地区、原始来源，沿证据与关联记录阅读档案。':'Search cases, people and places, and original sources; follow the evidence and related archive records.'):{};}
export default function Page(){return <UnifiedIndex/>;}
