import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {appearanceBootstrap,appearanceKey} from '../lib/appearance.mjs';
function boot({saved=null,query='',legacy=null,blocked=false}={}){
 const documentElement={dataset:{},classList:{toggle(name,on){this[name]=on}}},writes=[];
 vm.runInNewContext(appearanceBootstrap,{document:{documentElement},location:{search:query},URLSearchParams,localStorage:{getItem(){if(blocked)throw Error('Storage unavailable');return saved},setItem(...args){writes.push(args)}},sessionStorage:{getItem:()=>legacy}});
 return {root:documentElement,writes};
}
test('first visit and unavailable or invalid preferences start in light mode before paint',()=>{
 for(const settings of [{},{blocked:true},{saved:'invalid'},{query:'?preview-theme=invalid'}]){const {root,writes}=boot(settings);assert.equal(root.dataset.theme,'light');assert.equal(root.classList.dark,false);assert.deepEqual(writes,[]);}
});
test('explicit dark preference survives while preview overrides remain intentional',()=>{
 assert.equal(boot({saved:'dark'}).root.dataset.theme,'dark');
 assert.equal(boot({saved:'light'}).root.dataset.theme,'light');
 assert.equal(boot({saved:'dark',query:'?preview-theme=light'}).root.dataset.theme,'light');
 const {root,writes}=boot({legacy:'dark'});assert.equal(root.dataset.theme,'dark');assert.deepEqual(writes,[[appearanceKey,'dark']]);
});
