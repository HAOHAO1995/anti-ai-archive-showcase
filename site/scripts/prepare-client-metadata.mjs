import fs from 'node:fs';
const topics=JSON.parse(fs.readFileSync(new URL('../lib/data/topics.json',import.meta.url)));
fs.writeFileSync(new URL('../lib/data/topic-navigation.json',import.meta.url),JSON.stringify(topics.map(({slug,shortTitle,caseIds})=>({slug,shortTitle,caseIds})))+'\n');

const genealogy=JSON.parse(fs.readFileSync(new URL('../lib/data/genealogy.json',import.meta.url)));
const keys=['id','year','date','title','shortTitle','kind','timelineRole','contextParentId'];
fs.writeFileSync(new URL('../lib/data/genealogy-navigation.json',import.meta.url),JSON.stringify({records:genealogy.records.map(record=>Object.fromEntries(keys.filter(key=>key in record).map(key=>[key,record[key]])))} )+'\n');
