#!/usr/bin/env python3
"""Export an explicitly approved website snapshot, never the live research tree."""
import argparse, csv, hashlib, json, pathlib
from public_data import flatten, csv_cell

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--snapshot',type=pathlib.Path,default=pathlib.Path('site/lib/data/archive.json'))
p.add_argument('--translations',type=pathlib.Path,default=pathlib.Path('site/lib/data/i18n/translations.json'))
p.add_argument('--genealogy',type=pathlib.Path,default=pathlib.Path('site/lib/data/genealogy.json'))
p.add_argument('--expected-sha256',default='9d0066e4b6da5dd5049b98af9f400bd0823e6744e1875910b49d06bd63f83612')
p.add_argument('--output',type=pathlib.Path,default=pathlib.Path('data'))
p.add_argument('--version',default='2026.11.19')
p.add_argument('--license',default='CC-BY-4.0',choices=['CC-BY-4.0','CC-BY-NC-4.0'])
args=p.parse_args()
approved=json.loads((pathlib.Path(__file__).resolve().parents[1]/'docs/input-snapshot.json').read_text())
for name,expected in approved['files'].items():
    if hashlib.sha256((args.genealogy.parent/name).read_bytes()).hexdigest()!=expected:
        raise SystemExit('Accepted source changed: '+name+'; review and version a new input snapshot before export.')
raw=args.snapshot.read_bytes();digest=hashlib.sha256(raw).hexdigest()
if digest!=args.expected_sha256:raise SystemExit('Snapshot changed: approve a new published snapshot before export.')
a=json.loads(raw);t=json.loads(args.translations.read_text());g=json.loads(args.genealogy.read_text())
BASE='https://salondesrefuses.cn'

def bilingual(s, proper_name=False):
    if s is None:return None
    if not s:return None
    e=t.get(s)
    if e:
        if not e.get('zh') or not e.get('en'):raise ValueError('Missing bilingual text: '+s[:80])
        return {'zh':e['zh'],'en':e['en'],'original':s,'original_language':e.get('sourceLanguage','und'),
                'translation_review':{l:e.get('versions',{}).get(l,{}).get('reviewStatus','not-recorded') for l in ['zh','en']}}
    if proper_name and not any('\u3400'<=c<='\u9fff' for c in s):
        return {'zh':s,'en':s,'original':s,'original_language':'und','translation_review':{'zh':'name-retained','en':'name-retained'}}
    raise ValueError('No published translation for: '+s[:80])

def urls(kind,id):return {l:f'{BASE}/{l}/{kind}/{id}' for l in ['zh','en']}
def pick(r,fields):return {k:r.get(k) for k in fields}
def texts(r,fields):return {k:bilingual(r.get(k)) for k in fields}
def basic(kind,r):return {'id':r['id'],'title':bilingual(r['title']),'website_urls':urls(kind,r['id'])}
out={}
out['cases']=[]
for r in a['cases']:
    d=basic('cases',r);d.update(pick(r,['start_date','end_date','status','actors','organizations','jurisdiction','tags','related_cases','primary_sources','secondary_sources','created_at','updated_at']))
    d.update(texts(r,['summary','research_significance']));d['public_annotation']=bilingual(r.get('notes'))
    d['event_ids']=[e['id'] for e in a['events'] if e['case_id']==r['id']]
    out['cases'].append(d)
out['events']=[]
for r in a['events']:
    if r['review_status'] not in ['source-checked','publish-ready']:raise ValueError('Unpublished event')
    d=basic('events',r);d.update(pick(r,['date','date_precision','case_id','status','actors','organizations','regions','fields','tags','primary_sources','secondary_sources','source_confidence','claims_status','review_status','related_events','related_cases','document_ids','event_type','scope_role','jurisdiction','created_at','ingested_at','updated_at']))
    d['location_detail_as_recorded']=r.get('location_detail')
    d.update(texts(r,['summary','what_changed','historical_significance']));d['public_annotation']=bilingual(r.get('notes'))
    d['evidence']=[{'source_id':e['source_id'],'claim':bilingual(e['claim']),'locator':bilingual(e['locator'])} for e in r['evidence']]
    out['events'].append(d)
out['documents']=[]
for r in a['documents']:
    d=basic('documents',r);d.update(pick(r,['date','date_precision','document_type','language','event_ids','case_ids','source_ids','rights_status','translation_status','created_at','updated_at']))
    d.update(texts(r,['description','material_description']));
    if d['date_precision']=='unknown':d['date_as_recorded']=d['date'];d['date']=None
    d['creator_credit']=bilingual(r.get('creator_credit'),True)
    d['original_title']=r['title'];d['full_text_included']=False
    out['documents'].append(d)
out['sources']=[]
for r in a['sources']:
    d=basic('sources',r);d.update(pick(r,['publication_date','access_date','original_url','archive_url','archive_status','source_type','confidence','language','verification_status']))
    d['original_title']=r['title'];d['publisher']=bilingual(r.get('publisher'),True);d['author']=bilingual(r.get('author'),True)
    d['locator']=bilingual(r.get('locator'));d['public_annotation']=bilingual(r.get('notes'));d['full_text_included']=False
    out['sources'].append(d)
out['entities']=[{'id':r['id'],'name':bilingual(r['name'],True),'identifier_namespace':r['id'].split('-')[0],
                 'canonical_id':{'org-beijing-court':'org-beijing-internet-court'}.get(r['id'],r['id']),
                 'website_urls':{l:f'{BASE}/{l}?actor={r["id"]}' for l in ['zh','en']}} for r in a['people']]
out['genealogy']=[]
for r in g['records']:
    d={'id':r['id'],'year':r['year'],'date_label':r['date'],'date_note':r['dateNote'],'title':r['title'],
       'original_title':r['originalTitle'],'original_language':r['originalLanguage'],'actors_text':r['actors'],
       'node_type':r['kind'],'historical_significance':r['summary'],'source_url':r['sourceUrl'],
       'original_source_url':r['originalSourceUrl'],'source_kind':r['sourceKind'],'source_language':r['sourceLanguage'],
       'source_verification':r['sourceVerification'],'source_availability':r['sourceAvailability'],
       'source_note':r['sourceNote'],'translation_origin':r['translationOrigin'],'translation_review':r['translationReview'],
       'release_type':r['releaseType'],'relationship_type':None,'archive_relevance':None,
       'website_urls':urls('art-history',r['id']),
       'timeline_role':r.get('timelineRole','milestone'),'chronological_order':r['order'],
       'master_date_as_recorded':r.get('masterDate'),
       'date_precision':'display-label; see date_label and date_note',
       'references':[{'title':v['title'],'original_title':v['originalTitle'],'date_as_recorded':v['originalDate'],'url':v['url']} for v in r['sourceRefs']]}
    if 'officialLanguageUrls' in r:d['official_language_urls']=r['officialLanguageUrls']
    out['genealogy'].append(d)
out['history-accounts']=json.loads((args.genealogy.parent/'genealogy-essays.json').read_text())['records']
out['authored-documents']=json.loads((args.genealogy.parent/'authored-documents.json').read_text())
topic=next(x for x in json.loads((args.genealogy.parent/'topics.json').read_text()) if x['slug']=='ai-art-history')
out['guides']=[{'id':x['id'],'record_type':'guide','title':x['title'],'body':x['body'],'website_urls':urls('art-history/guides',x['id'])} for x in [{'id':'overview','title':topic['title'],'body':topic['intro']},*topic['sections']]]
args.output.mkdir(parents=True,exist_ok=True)
files={}
for name,rows in out.items():
    rows.sort(key=lambda x:x.get('id',x.get('nodeId','')));b=(json.dumps(rows,ensure_ascii=False,indent=2)+'\n').encode()
    (args.output/f'{name}.json').write_bytes(b)
    files[f'{name}.json']={'records':len(rows),'sha256':hashlib.sha256(b).hexdigest()}
    flattened=[flatten(row) for row in rows];fields=sorted({k for row in flattened for k in row})
    with (args.output/f'{name}.csv').open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader()
        writer.writerows({k:csv_cell(v) for k,v in row.items()} for row in flattened)
    files[f'{name}.csv']={'records':len(rows),'sha256':hashlib.sha256((args.output/f'{name}.csv').read_bytes()).hexdigest()}
manifest={'schema_version':'1.0.0','code_license':'MIT','license_scope':'Original archive metadata and authored research only; third-party titles, excerpts and source materials retain their own rights.','version':args.version,'publication_status':'development-branch; published-source-snapshot',
          'snapshot_updated':a['updated'],'license':args.license,'source_snapshot_sha256':digest,
          'genealogy_snapshot_sha256':hashlib.sha256(args.genealogy.read_bytes()).hexdigest(),
          'translation_snapshot_sha256':hashlib.sha256(args.translations.read_bytes()).hexdigest(),
          'approved_input_hashes':approved['files'],'vocabularies':{**{k:sorted({code for row in out['events'] for code in row.get(k,[])}) for k in ['fields','regions','jurisdiction','tags']},**{k:sorted({row[k] for row in out['events']}) for k in ['event_type','scope_role','claims_status','review_status']}},
          'scope':'Published catalogue metadata and archive-authored bilingual accounts; no third-party full texts or private drafts.',
          'files':files,
          'counts':{'cases':len(out['cases']),'events':len(out['events']),'catalogue_documents':len(out['documents']),'authored_documents':len(out['authored-documents']),'documents_total':len(out['documents'])+len(out['authored-documents']),'sources':len(out['sources']),'stored_entities':len(out['entities']),'distinct_entities':len({x['canonical_id'] for x in out['entities']}),'event_linked_entity_ids':len({v for e in out['events'] for k in ['actors','organizations'] for v in e.get(k,[])}),'event_linked_entities':len({{'org-beijing-court':'org-beijing-internet-court'}.get(v,v) for e in out['events'] for k in ['actors','organizations'] for v in e.get(k,[])}),'history_timeline_nodes':sum(r['timeline_role']!='context' for r in out['genealogy']),'history_context_records':sum(r['timeline_role']=='context' for r in out['genealogy']),'history_records':len(out['genealogy']),'history_accounts':len(out['history-accounts']),'history_guides':len(out['guides'])}}

(args.output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(args.genealogy.parent/'public-release.json').write_text(json.dumps({'version':args.version,'counts':manifest['counts']},indent=2)+'\n')
print(json.dumps({k:len(v) for k,v in out.items()}))
