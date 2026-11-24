import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),origin=process.env.ARCHIVE_TEST_ORIGIN??'http://127.0.0.1:4173';
const server=process.env.ARCHIVE_TEST_ORIGIN?null:spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4173'],{cwd:root,stdio:'ignore',detached:process.platform!=='win32'});
let browser;const results=[];let serverError='';
server?.once('error',error=>{serverError=error.message;});
server?.once('exit',code=>{serverError=`Preview exited (${code}); stop other dev sessions or set ARCHIVE_TEST_ORIGIN.`;});
try{
 let ready=false;
 for(let n=0;n<120;n++){
  if(serverError)throw Error(serverError);
  try{const r=await fetch(origin+'/favicon.svg',{signal:AbortSignal.timeout(1000)});if(r.ok){ready=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,1000));
 }
 assert.ok(ready,'Local preview did not start');
 browser=await chromium.launch();
 for(const width of [390,1440])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.addInitScript(value=>localStorage.setItem('archive-appearance',value),theme);
  const page=await context.newPage();
  for(const path of ['/en/research','/zh/research','/en','/en/topics/ai-art-history','/en/art-history/001']){
   const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
   const response=await page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:90000});
   await page.locator('main#main').waitFor();
   await page.waitForTimeout(350);
   // Set the existing explicit theme attribute for this audit; persistence is tested separately.
   await page.evaluate(value=>{document.documentElement.dataset.theme=value;document.documentElement.classList.toggle('dark',value==='dark');},theme);
   const structure=await page.evaluate(()=>({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+2,main:!!document.querySelector('main#main'),h1:document.querySelectorAll('h1').length,canonical:document.querySelector('link[rel=canonical]')?.href,alternates:[...document.querySelectorAll('link[rel=alternate][hreflang]')].map(e=>e.hreflang)}));
   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   const violations=audit.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}));
   // Keyboard users can reach and activate the skip link without pointer input.
   await page.locator('.skip-link').focus();await page.keyboard.press('Enter');
   const skipWorks=await page.evaluate(()=>location.hash==='#main');
   results.push({path,width,theme,status:response.status(),...structure,skipWorks,errors,violations});
   console.log(`${width}px ${theme} ${path}: ${response.status()}, ${violations.length} accessibility findings`);
   page.off('pageerror',onError);
  }
  await context.close();
 }
 const api=await browser.newContext();const manifest=JSON.parse(await readFile(new URL('../../data/manifest.json',import.meta.url)));
 for(const [name,meta] of Object.entries(manifest.files)){
  const response=await api.request.get(origin+'/datasets/'+name);assert.equal(response.status(),200,name);
  assert.equal(createHash('sha256').update(await response.body()).digest('hex'),meta.sha256,name);
 }
 await api.close();await mkdir(new URL('../reports/',root),{recursive:true});
 await writeFile(new URL('../reports/browser.json',root),JSON.stringify({scope:'Chromium sampled routes; 390/1440px, light/dark, WCAG A/AA automated checks. Not complete WCAG certification.',results},null,2)+'\n');
 for(const r of results){assert.equal(r.status,200,r.path);assert.equal(r.overflow,false,r.path);assert.equal(r.main,true,r.path);assert.equal(r.h1,1,r.path);assert.equal(r.skipWorks,true,r.path);assert.ok(r.canonical,r.path);assert.ok(r.alternates.includes('en')&&r.alternates.includes('zh-CN'),r.path);assert.deepEqual(r.errors,[],r.path);assert.deepEqual(r.violations,[],`${r.path} ${r.width} ${r.theme}`);}
 console.log(`PASS: ${results.length} browser route/viewport/theme checks and ${Object.keys(manifest.files).length} checksum-verified downloads.`);
}finally{
 await browser?.close();
 if(server){try{if(process.platform==='win32')server.kill();else process.kill(-server.pid,'SIGTERM');}catch{}}
}
