export const indexViews=['cases','people','sources'];
export const indexFilterKeys=['q','year','field','region','actor','order'];
export function indexView(search){const value=new URLSearchParams(search).get('view');return indexViews.includes(value)?value:'cases';}
export function indexFilters(search,view){const params=new URLSearchParams(search),result=new URLSearchParams();for(const key of indexFilterKeys){const value=params.get(view+'-'+key);if(value!==null)result.set(key,value);}return result;}
export function indexTabSearch(search,view){const params=new URLSearchParams(search);params.set('view',indexViews.includes(view)?view:'cases');return params.toString();}
export function legacyIndexRedirect(input){const url=new URL(input),match=url.pathname.match(/^\/(en|zh)\/(cases|sources)\/?$/);if(!match)return null;const [,locale,view]=match;url.pathname=`/${locale}/index`;for(const key of indexFilterKeys){if(url.searchParams.has(key)){url.searchParams.set(view+'-'+key,url.searchParams.get(key));url.searchParams.delete(key);}}url.searchParams.set('view',view);return url.toString();}
