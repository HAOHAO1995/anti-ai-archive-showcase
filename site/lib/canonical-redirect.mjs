export function canonicalRedirect(raw){
 const url=new URL(raw);
 if(!['salondesrefuses.cn','www.salondesrefuses.cn'].includes(url.hostname)||(url.protocol==='https:'&&url.hostname==='salondesrefuses.cn'))return null;
 url.protocol='https:';url.hostname='salondesrefuses.cn';url.port='';
 return url.toString();
}
