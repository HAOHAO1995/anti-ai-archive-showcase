#!/usr/bin/env python3
"""Bounded external source checks. HTTP success is availability, not factual verification."""
import argparse,concurrent.futures,json,pathlib,subprocess,urllib.parse,datetime
root=pathlib.Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--limit',type=int,default=20);p.add_argument('--output',type=pathlib.Path,default=root/'reports/links.json');args=p.parse_args()
rows=json.loads((root/'data/sources.json').read_text());links={}
for row in rows:
 for key in ['original_url','archive_url']:
  url=row.get(key)
  if url:links.setdefault(url,[]).append(row['id'])
# Interleave hosts to avoid limiting a sample to the first case/provider.
by_host={}
for url,ids in links.items():by_host.setdefault(urllib.parse.urlsplit(url).hostname,[]).append((url,ids))
selected=[]
while by_host and len(selected)<args.limit:
 for host in list(by_host):
  if len(selected)>=args.limit:break
  selected.append(by_host[host].pop(0))
  if not by_host[host]:del by_host[host]
def probe(item):
 url,ids=item;parts=urllib.parse.urlsplit(url)
 if parts.scheme not in ['http','https'] or parts.username:return {'url':url,'ids':ids,'status':'invalid-url'}
 # curl validates TLS by default; do not treat TLS/network/403/429 as dead links.
 result=subprocess.run(['curl','-L','--proto','=http,https','--proto-redir','=http,https','--max-redirs','5','--max-time','12','--connect-timeout','5','-A','AntiAIArchive-LinkAudit/1.0','-sS','-o','/dev/null','-w','%{http_code}\t%{url_effective}',url],capture_output=True,text=True)
 code,_,final=result.stdout.partition('\t');status='available' if code.startswith('2') else 'broken-candidate' if code in ['404','410'] else 'access-restricted' if code in ['401','403','429'] else 'unresolved'
 return {'url':url,'ids':ids,'http_status':code,'final_url':final,'status':status,'network_error':result.stderr.strip()[:250] if result.returncode else None}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(probe,selected))
report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'unique_urls':len(links),'checked':len(results),'unchecked':len(links)-len(results),'scope':'Host-diverse bounded sample; no completeness or content-verification claim. 404/410 require manual review.','results':results}
args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'checked':len(results),'statuses':{s:sum(r['status']==s for r in results) for s in sorted({r['status'] for r in results})},'report':str(args.output)}))
