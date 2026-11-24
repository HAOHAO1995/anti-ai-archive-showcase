import {siteOrigin} from '@/lib/i18n';
export default function robots(){return {rules:{userAgent:'*',allow:'/'},sitemap:`${siteOrigin}/sitemap.xml`};}
