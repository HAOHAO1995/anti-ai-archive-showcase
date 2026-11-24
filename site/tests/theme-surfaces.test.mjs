import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
const load=name=>postcss.parse(fs.readFileSync(new URL('../app/'+name,import.meta.url),'utf8'));
const global=load('globals.css'),adaptive=load('adaptive.css'),theme=load('appearance.css');
function declarations(sheet,selector,property){const out=[];sheet.walkRules(rule=>{if(rule.selector===selector)rule.walkDecls(property,d=>out.push(d));});return out;}
function last(sheet,selector,property){return declarations(sheet,selector,property).at(-1)?.value;}
function specificity(selector){let score=0;selectorParser(s=>s.first.each(n=>{if(n.type==='id')score+=10000;else if(['class','attribute','pseudo'].includes(n.type))score+=100;else if(n.type==='tag')score++;})).processSync(selector);return score;}
test('mobile pane and native filter surfaces do not force a dark background over light text',()=>{
 const backgrounds=declarations(global,'.filter-select','background');assert.ok(backgrounds.length);
 for(const d of backgrounds){assert.equal(d.important,undefined);assert.equal(d.value,'var(--card)');}
 assert.equal(last(adaptive,'.room-pane-navigation','background'),'var(--background)');
 assert.equal(last(theme,'html[data-theme=light] .year-link','background'),'var(--card)');
 assert.equal(last(theme,'html[data-theme=light] .year-link','color'),'var(--foreground)');
 assert.equal(last(theme,'html[data-theme=light] .year-link[aria-pressed=true]','background'),'#e9e1d5');
});
test('research navigation overrides the old high-specificity dark text; popup menus do not depend on the viewport ancestor',()=>{
 const fixed='html[data-theme=light] .with-genealogy .topbar .header-research a',old='.with-genealogy .topbar .header-research a';
 assert.ok(specificity(fixed)>specificity(old));assert.equal(last(theme,fixed,'color'),'var(--muted-foreground)');
 for(const slot of ['select-content','select-item']){
  const selector='html[data-theme] [data-slot='+slot+']';assert.equal(last(theme,selector,'color'),'var(--foreground)');assert.ok(last(theme,selector,'background'));
 }
 assert.equal(last(theme,'html[data-theme=light] .viewport-frame .index-tabs button','background'),'var(--card)');
});
function luminance(hex){const rgb=hex.slice(1).match(/../g).map(s=>parseInt(s,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function contrast(a,b){const [x,y]=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (x+.05)/(y+.05);}
test('light and dark text tokens meet normal-text contrast on all shared control surfaces',()=>{
 for(const [sheet,selector] of [[global,':root,.dark'],[theme,'html[data-theme=light]']]){
  const value=k=>last(sheet,selector,k);
  for(const surface of ['--background','--card','--popover','--secondary'])for(const ink of ['--foreground','--muted-foreground'])assert.ok(contrast(value(ink),value(surface))>=4.5,selector+' '+ink+' on '+surface);
 }
 assert.ok(contrast('#26211c','#e9e1d5')>=4.5);
});

// The shared `.filters` rule previously put both controls in one 140px grid cell.
test('archive filters stay side by side and move below search as a whole on compact screens',()=>{
 const group='.viewport-frame .chronology-controls .filters';
 assert.ok(specificity(group)>specificity('.viewport-frame .filters'));
 assert.equal(last(theme,group,'display'),'grid');
 assert.equal(last(theme,group,'grid-template-columns'),'repeat(2,minmax(0,1fr))');
 assert.equal(last(theme,'.viewport-frame .chronology-controls','display'),'flex');
 assert.equal(last(theme,'.viewport-frame .chronology-controls','flex-wrap'),'wrap');
 assert.equal(last(theme,'.viewport-frame .chronology-controls .filters .filter-select','width'),'100%');
 const compact=declarations(theme,group,'flex-basis').at(-1);
 assert.equal(compact.value,'100%');assert.match(compact.parent.parent.params,/archive-app.*759px/);
 const source=fs.readFileSync(new URL('../components/archive-explorer.tsx',import.meta.url),'utf8');
 assert.ok(source.includes(`(kind==='events'||kind==='cases')?"chronology-controls"`));
});
