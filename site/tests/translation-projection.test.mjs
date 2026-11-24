import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=name=>JSON.parse(readFileSync(new URL('../lib/data/i18n/'+name+'.json',import.meta.url)));
test('client translation projection preserves every source key and both exact language values',()=>{
 const full=load('translations'),display=load('display');
 assert.deepEqual(Object.keys(display),Object.keys(full));
 for(const [key,value] of Object.entries(full))assert.deepEqual(display[key],{zh:value.zh,en:value.en},key);
 assert.ok(Object.values(full).some(v=>v.versions),'Complete provenance remains in the research dictionary');
});
test('client projection excludes source/review duplication and is reproducibly generated',()=>{
 const full=JSON.stringify(load('translations')),display=JSON.stringify(load('display'));
 assert.ok(Buffer.byteLength(display)<Buffer.byteLength(full)*.6);
 const i18n=readFileSync(new URL('../lib/i18n.ts',import.meta.url),'utf8');
 assert.ok(i18n.includes("'./data/i18n/display.json'"));assert.ok(!i18n.includes("'./data/i18n/translations.json'"));
});
