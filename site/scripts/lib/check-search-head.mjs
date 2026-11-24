import assert from 'node:assert/strict';

export function checkSearchHead(html,route,origin='https://salondesrefuses.cn'){
 const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
 assert.notEqual(head,undefined,`${route}: missing HTML head`);
 assert.match(head,/<title>[^<]+<\/title>/,`${route}: title must be in initial head`);
 assert.match(head,/<meta\b[^>]*name="description"[^>]*content="[^"]+"/,`${route}: description must be in initial head`);
 assert.ok(head.includes(`rel="canonical" href="${origin}${route}"`),`${route}: canonical must be in initial head`);
 for(const [language,locale] of [['en','en'],['zh-CN','zh'],['x-default','en']]){
  const alternate=route.replace(/^\/(en|zh)(?=\/|$)/,'/'+locale);
  const links=head.match(/<link\b[^>]*>/gi)??[];
  assert.ok(links.some(link=>/\brel="alternate"/i.test(link)&&link.match(/\bhreflang="([^"]+)"/i)?.[1]===language&&link.match(/\bhref="([^"]+)"/i)?.[1]===origin+alternate),`${route}: ${language} must be in initial head`);
 }
 assert.match(head,/<meta\b[^>]*property="og:description"[^>]*content="[^"]+"/,`${route}: social summary must be in initial head`);
}
