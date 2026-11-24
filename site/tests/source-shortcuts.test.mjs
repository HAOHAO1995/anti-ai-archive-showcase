import test from 'node:test';
import * as navigation from '../lib/genealogy-navigation.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import {renderToStaticMarkup} from 'react-dom/server';
const root=new URL('../',import.meta.url),require=createRequire(import.meta.url);
const data=name=>JSON.parse(readFileSync(new URL('lib/data/'+name+'.json',root)));
const nodes=data('genealogy'),official=data('history-source-links');
const mocks={
 '@/lib/genealogy-navigation.mjs':navigation,
 '@/components/history-illustration':{HistoryIllustration:()=>null},
 '@/components/history-essay':{HistoryEssay:()=>null},
 '@/components/genealogy-provenance':{GenealogyProvenance:()=>null},
 '@/lib/data/genealogy':nodes,
 '@/lib/data/genealogy.json':nodes,
 '@/lib/data/genealogy-essays.json':data('genealogy-essays'),
 '@/lib/data/history-source-links.json':official,
 '@/lib/i18n':{isLocale:v=>['zh','en'].includes(v),localizedPath:(p,l)=>'/'+l+p,siteOrigin:'https://salondesrefuses.cn'},
 'next/navigation':{notFound:()=>{throw Error('Not found')}}
};
const module={exports:{}};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('app/[locale]/art-history/[id]/page.tsx',root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:n=>mocks[n]??require(n)});
test('every history detail has an original source shortcut before the long account in both languages',async()=>{
 for(const n of nodes.records)for(const locale of ['zh','en']){
  const html=renderToStaticMarkup(await module.exports.default({params:Promise.resolve({locale,id:n.id})}));
  const number=navigation.chronologicalNumber(nodes.records,n.id);
  assert.ok(html.includes(number?'/ '+number+' ·':locale==='zh'?'专题作品':'THEMATIC WORK'),n.id+' chronological or contextual heading');
  if(!number){assert.ok(!html.includes('Previous node'));assert.ok(html.includes('/art-history/guides/generative-lineage#'));}
  const nav=html.match(/<nav class="record-source-links"[\s\S]*?<\/nav>/)?.[0];assert.ok(nav,n.id);
  assert.ok(nav.includes('href="'+n.sourceUrl.replaceAll('&','&amp;')+'"'),n.id);
  assert.ok(nav.includes('href="#history-sources"'));assert.ok(html.includes('id="history-sources"'));
  assert.ok(html.indexOf(nav)<html.indexOf('class="record-body"'));
  for(const link of official[n.id]??[])assert.ok(nav.includes(link.url.replaceAll('&','&amp;')),n.id);
  if(n.id==='243'){assert.ok(nav.includes('https://www.moma.org/calendar/exhibitions/3863'));assert.ok(nav.includes('installation_images/37586'));assert.ok(nav.includes('PDF'));}
 }
});
