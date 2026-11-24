import {assetInfo} from './asset-info.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const article=JSON.parse(readFileSync(new URL('lib/data/commentaries/disco-ai-2023.json',root),'utf8'));
test('historical commentary keeps supplied original intact and separates publication, republication and archive edition',()=>{
 const raw=assetInfo(new URL('public/documents/disco-ai-2023-original-zh.txt',root));
 assert.equal(raw.sha256,article.authorSuppliedTextSha256);
 assert.equal(article.originalDate,'2023-03-14');assert.equal(article.originalTime,'09:30');assert.equal(article.reprintDate,'2023-03-22 09:34:45');assert.equal(article.archiveDate,'2026-09-25');
 assert.equal(article.translation.reviewStatus,'ai-assisted-unreviewed');assert.ok(article.sourceVerification.wechat.includes('Not independently accessed'));
});
test('both complete language editions preserve all original image placements, captions and image inventory hashes',()=>{
 for(const locale of ['zh','en']){
  assert.deepEqual(article.blocks[locale].filter(b=>b.type==='figure').map(b=>b.image),Array.from({length:32},(_,i)=>i+1));
  const body=article.blocks[locale].filter(b=>b.type!=='figure').map(b=>b[locale]).join(' ');
  assert.ok(body.length>(locale==='zh'?6000:16000));assert.ok(article.editorNote[locale]&&article.versionNote[locale]);
 }
 for(const im of article.images){
  const raw=assetInfo(new URL('public'+im.src,root));assert.equal(raw.sha256,im.sha256);
  assert.ok(!im.caption.zh||im.caption.en);assert.ok(im.width>0&&im.height>0);
 }
 const archive=JSON.parse(readFileSync(new URL('lib/data/archive.json',root),'utf8'));
 for(const r of article.related){const [,kind,id]=r.path.split('/');assert.ok(archive[kind].some(x=>x.id===id),r.path);}
});
test('both language editions place complete opening and closing videos below the matching original instructions',()=>{
 for(const locale of ['zh','en'])assert.deepEqual(article.blocks[locale].filter(b=>b.type==='video').map(b=>b.role),['opening','closing']);
 assert.deepEqual(article.videos.map(v=>v.durationSeconds),[264.10,211.30]);
 for(const video of article.videos){const bytes=assetInfo(new URL('public'+video.src,root));assert.ok(bytes.bytes<25*1024*1024);assert.equal(bytes.sha256,video.sha256);assert.ok(video.title.zh&&video.title.en);}
});
