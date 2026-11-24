export const siteName = 'ANTI-AI ARCHIVE';
export const projectName = siteName;
export const projectCredit = 'LUOCAO / CHEN HAOHAO';
export const siteDescriptions = {
  zh: '一份全球研究档案，记录 2022 年以来的反 AI 运动、创意劳动、文化冲突与生成式 AI 治理。',
  en: 'A global research archive of anti-AI movements, creative labour, cultural conflict and generative-AI governance since 2022.',
};
export const publicProjectUrl = 'https://github.com/HAOHAO1995/anti-ai-archive-showcase';

export function identityGraph(origin, locale) {
  return {'@context':'https://schema.org','@graph':[
    {'@type':'ResearchProject','@id':origin+'/#project',name:projectName,url:origin,
      creditText:projectCredit,description:siteDescriptions[locale],sameAs:[publicProjectUrl],logo:origin+'/images/red-puzzle.jpg'},
    {'@type':'WebSite','@id':origin+'/#website',url:origin,name:siteName,
      description:siteDescriptions[locale],
      inLanguage:['en','zh-CN'],publisher:{'@id':origin+'/#project'}},
  ]};
}
