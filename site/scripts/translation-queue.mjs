import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {translationUnits} from './lib/translation-units.mjs';
const data=JSON.parse(await readFile(new URL('../lib/data/archive.json',import.meta.url),'utf8'));
const catalog=JSON.parse(await readFile(new URL('../lib/data/i18n/translations.json',import.meta.url),'utf8'));
const units=translationUnits(data).filter(u=>!catalog[u.text]?.zh||!catalog[u.text]?.en).map(u=>({id:u.id,sourceText:u.text,sourceLanguage:u.sourceLanguage,refs:u.refs,zh:catalog[u.text]?.zh??(u.sourceLanguage==='zh'?u.text:''),en:catalog[u.text]?.en??(u.sourceLanguage==='en'?u.text:''),reviewStatus:'ai-assisted-unreviewed'}));
await mkdir(new URL('../maintenance/',import.meta.url),{recursive:true});
await writeFile(new URL('../maintenance/translation-queue.json',import.meta.url),JSON.stringify(units,null,2));
console.log(`${units.length} entries need translation. Edit maintenance/translation-queue.json, then run translations:import.`);
