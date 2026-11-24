// Permanent public aliases. Preserve filters, record IDs, locale and fragments.
const introductions={'anti-ai-events':'anti-ai-movements','creative-labour-ai-rights':'creative-labour','ai-art':'ai-art-research'};
export function mergedTopicRedirect(input){
 const url=new URL(input),match=/^\/(en|zh)\/topics\/(anti-ai-events|creative-labour-ai-rights|ai-art)(\/.*)?$/.exec(url.pathname);
 if(!match)return null;
 const [,locale,old,suffix='']=match;const intro=introductions[old];
 const targetSuffix=suffix.replace(/^\/guides\/overview\/?$/,'/guides/'+intro);
 url.pathname=`/${locale}/topics/culture-governance${targetSuffix}`;
 if(url.searchParams.get('selected')==='guide')url.searchParams.set('selected','guide-'+intro);
 if(!suffix||suffix==='/'){
  if(!url.searchParams.has('section'))url.searchParams.set('section',old);
  if(url.hash==='#topic-guide')url.hash='#'+intro;
 }
 return url.toString();
}
