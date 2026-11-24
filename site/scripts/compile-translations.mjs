import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {translationUnits} from './lib/translation-units.mjs';
const root=new URL('../',import.meta.url);
const data=JSON.parse(await readFile(new URL('lib/data/archive.json',root),'utf8'));
const catalog=new URL('lib/data/i18n/translations.json',root);
let entries=JSON.parse(await readFile(catalog,'utf8').catch(()=> '{}'));
// Historical numeric TSVs always use their immutable seed, never a regenerated work queue.
if(process.argv.includes('--import-seed')){
 const units=JSON.parse(await readFile(new URL('maintenance/translations/seed-units.json',root),'utf8'));
 entries={};
 for(const file of (await readdir(new URL('maintenance/translations/',root))).filter(f=>f.endsWith('.tsv')).sort()){
  const locale=file.startsWith('zh-')?'zh':'en';
  for(const line of (await readFile(new URL(`maintenance/translations/${file}`,root),'utf8')).split('\n').filter(Boolean)){
   const tab=line.indexOf('\t');if(tab<0)throw Error(`Invalid TSV: ${file}`);
   const index=Number(line.slice(0,tab));const u=units[index];if(!u)throw Error(`Missing unit ${index}`);
   entries[u.text]??={id:u.id,sourceLanguage:u.sourceLanguage,sourceText:u.text};
   if(entries[u.text][locale]&&entries[u.text][locale]!==line.slice(tab+1))throw Error(`Conflicting translation ${index}`);
   entries[u.text][locale]=line.slice(tab+1);
  }
 }
}
const active=translationUnits(data);
for(const u of active){
 entries[u.text]??={id:u.id,sourceLanguage:u.sourceLanguage,sourceText:u.text};
 const e=entries[u.text];e.sourceLanguage=u.sourceLanguage;
 const source=u.sourceLanguage.startsWith('zh')?'zh':u.sourceLanguage;
 if(source==='zh'||source==='en')e[source]??=u.text;
 e.versions??={};
 for(const locale of ['zh','en'])if(e[locale])e.versions[locale]??={kind:e[locale]===u.text?'source':'translation',reviewStatus:e[locale]===u.text?'original':'ai-assisted-unreviewed'};
 delete e.method;delete e.reviewStatus;
}
if(!process.argv.includes('--check')) {
await mkdir(new URL('lib/data/i18n/',root),{recursive:true});
await writeFile(catalog,JSON.stringify(entries));
}
const missing=active.flatMap(u=>['zh','en'].filter(l=>!entries[u.text]?.[l]?.trim()).map(locale=>({id:u.id,locale,refs:u.refs,sourceText:u.text,sourceLanguage:u.sourceLanguage})));
if(!process.argv.includes('--check')){await mkdir(new URL('maintenance/',root),{recursive:true});await writeFile(new URL('maintenance/translation-missing.json',root),JSON.stringify(missing,null,2));}
console.log(`${active.length} current text units; ${missing.length} missing language versions.`);
if(process.argv.includes('--check')&&missing.length)process.exitCode=1;
