import test from 'node:test';
import assert from 'node:assert/strict';
import {indexView,indexFilters,indexTabSearch,legacyIndexRedirect} from '../lib/index-navigation.mjs';
test('switching index collections preserves independent searches and filters',()=>{
 const query='view=cases&cases-q=ArtStation&cases-year=2022&sources-q=training&sources-year=2026&people-q=Chen';
 for(const view of ['cases','sources','people']){
  const next=indexTabSearch(query,view);assert.equal(indexView(next),view);assert.equal(indexFilters(next,'cases').get('q'),'ArtStation');assert.equal(indexFilters(next,'sources').get('year'),'2026');assert.equal(indexFilters(next,'people').get('q'),'Chen');
 }
 assert.equal(indexView('?view=unknown'),'cases');assert.equal(indexView(''),'cases');
});
test('legacy indexes preserve locale and encoded filters without redirecting detail records',()=>{
 for(const lang of ['zh','en'])for(const view of ['cases','sources']){
  const target=new URL(legacyIndexRedirect(`https://salondesrefuses.cn/${lang}/${view}/?q=AI%20%26%20Labour&region=Europe&year=2023`));
  assert.equal(target.pathname,`/${lang}/index`);assert.equal(target.searchParams.get('view'),view);assert.equal(target.searchParams.get(view+'-q'),'AI & Labour');assert.equal(target.searchParams.get(view+'-region'),'Europe');assert.equal(target.searchParams.get('q'),null);
 }
 for(const path of ['/en/cases/case-0001','/zh/sources/src-0001','/en/index','/en/documents'])assert.equal(legacyIndexRedirect('https://salondesrefuses.cn'+path),null);
});
