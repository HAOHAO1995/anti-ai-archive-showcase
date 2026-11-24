import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
const module={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../lib/reading-subtitle.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:module.exports,module});
const {readingSubtitle}=module.exports;
const nodes=JSON.parse(fs.readFileSync(new URL('../lib/data/genealogy.json',import.meta.url)));
test('all historical subtitles retain distinct complete sentences from their own English accounts',()=>{
 const subtitles=nodes.records.map(r=>readingSubtitle(r.summary.en));
 assert.equal(new Set(subtitles).size,nodes.records.length);
 nodes.records.forEach((r,i)=>{assert.ok(r.summary.en.startsWith(subtitles[i]),r.id);assert.ok(subtitles[i].length>40,r.id);assert.ok(!/[\u3400-\u9fff]/u.test(subtitles[i]),r.id)});
});
test('sentence boundaries preserve names and abbreviations without truncating mid-sentence',()=>{
 assert.equal(readingSubtitle('Dr. Turing studies machines. Another sentence.'),'Dr. Turing studies machines.');
 assert.equal(readingSubtitle('  A historical account without terminal punctuation  '),'A historical account without terminal punctuation');
});
