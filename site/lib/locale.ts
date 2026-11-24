export type Locale='en'|'zh';
export const isLocale=(v:unknown):v is Locale=>v==='en'||v==='zh';
export function localizedPath(path:string,locale:Locale){if(!path.startsWith('/')||path.startsWith('//'))return path;const clean=path.replace(/^\/(en|zh)(?=\/|\?|#|$)/,'');return `/${locale}${clean==='/'?'':clean}`;}
export function unlocalizedPath(path:string){return path.replace(/^\/(en|zh)(?=\/|$)/,'')||'/';}
