import {readFile,writeFile} from 'node:fs/promises';
import {textId,translationUnits} from './lib/translation-units.mjs';
const input=process.argv[2];if(!input)throw Error('Usage: npm run translations:import -- path/to/translations.json');
const file=new URL('../lib/data/i18n/translations.json',import.meta.url);
const catalog=JSON.parse(await readFile(file,'utf8'));
const data=JSON.parse(await readFile(new URL('../lib/data/archive.json',import.meta.url),'utf8'));
const active=new Map(translationUnits(data).map(u=>[u.id,u]));
const updates=JSON.parse(await readFile(input,'utf8'));if(!Array.isArray(updates))throw Error('Expected an array of {id, sourceText, zh, en, reviewStatus}');
for(const update of updates){
 const u=active.get(update.id);
 if(!u||u.text!==update.sourceText||textId(update.sourceText)!==update.id)throw Error(`Outdated source text or unknown id: ${update.id}`);
 const e=catalog[u.text]??={id:u.id,sourceText:u.text,sourceLanguage:u.sourceLanguage,versions:{}};
 e.versions??={};
 for(const locale of ['zh','en'])if(update[locale]!==undefined){
  if(typeof update[locale]!=='string'||!update[locale].trim())throw Error(`Empty translation: ${u.id}.${locale}`);
  e[locale]=update[locale];e.versions[locale]={kind:update[locale]===u.text?'source':'translation',reviewStatus:update.reviewStatus==='human-reviewed'?'human-reviewed':'ai-assisted-unreviewed'};
 }
}
await writeFile(file,JSON.stringify(catalog));console.log(`Imported ${updates.length} entries against current source text.`);
