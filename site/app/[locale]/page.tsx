import {ArchiveExplorer} from '@/components/archive-explorer';
import {isLocale,languageMetadata} from '@/lib/i18n';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))return {};const metadata=languageMetadata('/',locale,locale==='zh'?'ANTI-AI ARCHIVE｜反 AI 运动、艺术与创意劳动史':'ANTI-AI ARCHIVE — Anti-AI Movements & Creative Labour');return {...metadata,title:{absolute:metadata.title}};}
export default function Page(){return <ArchiveExplorer />;}
