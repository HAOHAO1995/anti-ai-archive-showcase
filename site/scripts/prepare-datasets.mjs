import {cp,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source=new URL('../../data/',import.meta.url),target=new URL('../public/datasets/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',source),'utf8'));
await mkdir(target,{recursive:true});
for(const [name,meta] of Object.entries(manifest.files)){
 if(!/^[a-z-]+\.(json|csv)$/.test(name))throw Error('Unsafe dataset filename');
 const bytes=await readFile(new URL(name,source));
 if(createHash('sha256').update(bytes).digest('hex')!==meta.sha256)throw Error(`Dataset checksum mismatch: ${name}`);
 await cp(new URL(name,source),new URL(name,target));
}
await cp(new URL('manifest.json',source),new URL('manifest.json',target));
console.log(`Prepared ${Object.keys(manifest.files).length} verified downloadable dataset files.`);
