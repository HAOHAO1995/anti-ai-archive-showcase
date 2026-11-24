import type { Metadata } from 'next';
import {headers} from 'next/headers';
import './globals.css';
import './adaptive.css';
import './liquid-glass.css';
import './history-illustrations.css';
import './appearance.css';
import './performance.css';
import './appearance-violet.css';
import {appearanceInteraction} from '@/lib/appearance-interaction.mjs';
import {appearanceBootstrap} from '@/lib/appearance.mjs';
import {identityGraph,siteDescriptions,projectName,projectCredit} from '@/lib/site-identity.mjs';
import {isLocale,siteOrigin} from '@/lib/i18n';
import { SiteShell } from '@/components/site-shell';
export const viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export const metadata: Metadata = {
 title:{default:projectName,template:'%s · ANTI-AI ARCHIVE'},
 description:siteDescriptions.en,
 creator:projectCredit,
 publisher:projectName,
 icons:{icon:'/images/red-puzzle.jpg'},
 metadataBase:new URL(siteOrigin),
 verification:{other:{'msvalidate.01':'77665695EEE0483B068DA56048D55B51'}},
};
export default async function RootLayout({children}:{children:React.ReactNode}) {const routeLocale=(await headers()).get('x-archive-locale');const locale=isLocale(routeLocale)?routeLocale:'en';return <html lang={locale==='zh'?'zh-CN':'en'} data-theme="light" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:appearanceBootstrap+appearanceInteraction}}/></head><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(identityGraph(siteOrigin,locale)).replaceAll('<','\\u003c')}}/><SiteShell locale={locale}>{children}</SiteShell></body></html>}
