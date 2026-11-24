// The public source distribution intentionally excludes third-party media.
// Compare record metadata to the frozen inventory; verify bytes only if present.
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const inventory=JSON.parse(readFileSync(new URL('../../docs/public-assets.json',import.meta.url))).assets;
export function assetInfo(url){
 if(existsSync(url)){const b=readFileSync(url);return {sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,bundled:true};}
 const path=decodeURIComponent(url.pathname).split('/site/public')[1];
 const record=inventory.find(r=>r.path===path);
 if(!record)throw Error(`Asset not bundled or registered: ${path}`);
 return {...record,bundled:false};
}
