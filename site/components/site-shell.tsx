'use client';
import Image from 'next/image';
import {ViewportFrame} from './viewport-frame';
import {NavigationPreparation} from './navigation-preparation';
import {GlassLight} from './glass-light';
import {AppearanceToggle} from './appearance-toggle';
import {GenealogyRail} from './genealogy-rail';
import {usePathname} from 'next/navigation';
import {createContext,useContext,useEffect,type ComponentProps} from 'react';
import {ArrowUpRight,Star} from 'lucide-react';
import topics from '@/lib/data/topic-navigation.json';
import {projectName,projectCredit,siteDescriptions} from '@/lib/site-identity.mjs';
import {publicProjectUrl} from '@/lib/public-project';
import {localizedPath,unlocalizedPath,isLocale,type Locale} from '@/lib/locale';
const Language=createContext<{lang:Locale}>({lang:'en'});
export const useLanguage=()=>useContext(Language);
export function Text({zh,en}:{zh:string;en:string}){return <>{useLanguage().lang==='zh'?zh:en}</>;}
export function Link({href,children,...props}:ComponentProps<'a'>){const {lang}=useLanguage();return <a {...props} href={typeof href==='string'?localizedPath(href,lang):href}>{children}</a>; }
export function SiteShell({children,locale:initialLocale}:{children:React.ReactNode;locale:Locale}){
 const pathname=usePathname();const routeLocale=pathname.split('/')[1];const locale=isLocale(routeLocale)?routeLocale:initialLocale;const path=unlocalizedPath(pathname);
 useEffect(()=>{document.documentElement.lang=locale==='zh'?'zh-CN':'en';},[locale]);
 const links=[['/','编年','Chronology'],['/index','Index','Index'],['/documents','文献','Documents']];
 function rememberQuery(event:React.MouseEvent<HTMLAnchorElement>,target:Locale){if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();window.location.assign(localizedPath(pathname,target)+window.location.search+window.location.hash);}
 return <Language.Provider value={{lang:locale}}><ViewportFrame><NavigationPreparation/><GlassLight/><a href="#main" className="skip-link">{locale==='zh'?'跳至正文':'Skip to content'}</a><div className="site-wrap with-genealogy"><header className="topbar"><Link href="/" className="wordmark" aria-label={locale==='zh'?'Anti-AI Archive 首页':'Anti-AI Archive home'}><><Image className="puzzle-dark brand-puzzle" src="/images/red-puzzle.jpg" alt="" width={52} height={52} unoptimized/><Image className="puzzle-light brand-puzzle" src="/images/red-puzzle-transparent.png" alt="" width={52} height={52} unoptimized/></><span>ANTI-AI ARCHIVE</span></Link><div className="header-navigation"><nav className="primary-navigation" aria-label={locale==='zh'?'主导航':'Main navigation'}>{links.map(([href,zh,en])=><Link key={href} href={href} aria-current={(href==='/'?path==='/':href==='/index'?['/index','/cases','/sources'].some(p=>path.startsWith(p)):path.startsWith(href))?'page':undefined}>{locale==='zh'?zh:en}</Link>)}</nav><nav className="header-research" aria-label={locale==='zh'?'研究专题':'Research guides'}>{topics.map(topic=><Link key={topic.slug} href={`/topics/${topic.slug}`} aria-current={path===`/topics/${topic.slug}`?'page':undefined}>{topic.shortTitle[locale]}</Link>)}</nav><nav className="header-about" aria-label={locale==='zh'?'关于档案':'About the archive'}><Link href="/about" aria-current={path.startsWith('/about')?'page':undefined}>{locale==='zh'?'关于档案':'About'}</Link></nav></div><div className="header-preferences"><div className="language" role="group" aria-label={locale==='zh'?'语言':'Language'}><a className="preference-control" href={localizedPath(pathname,'zh')} lang="zh-CN" hrefLang="zh-CN" aria-current={locale==='zh'?'true':undefined} onClick={e=>rememberQuery(e,'zh')}>中文</a><a className="preference-control" href={localizedPath(pathname,'en')} lang="en" hrefLang="en" aria-current={locale==='en'?'true':undefined} onClick={e=>rememberQuery(e,'en')}>English</a></div><AppearanceToggle locale={locale}/></div></header>{children}<footer><div><strong>{projectName}</strong><p className="small muted">{projectCredit}</p><p>{siteDescriptions[locale]}</p></div><div className="footer-right"><a href={publicProjectUrl} className="github-star-link"><Star size={15} aria-hidden="true"/><Text zh="在 GitHub 收藏这个档案" en="Star this archive on GitHub"/></a><Link href="/research"><Text zh="下载数据与引用" en="Data & citation"/><ArrowUpRight size={15}/></Link><Link href="/about"><Text zh="研究方法与引用" en="Methodology & citation"/><ArrowUpRight size={15}/></Link></div></footer></div><GenealogyRail locale={locale}/></ViewportFrame></Language.Provider>;
}
