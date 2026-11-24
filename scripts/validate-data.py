#!/usr/bin/env python3
"""Validate public exports, references, calendar dates, translations and CSV parity."""
import csv,datetime,hashlib,json,pathlib,re,sys
from public_data import flatten,csv_cell
ROOT=pathlib.Path(__file__).resolve().parents[1]

def validate(root=ROOT):
    directory=root/'data';manifest=json.loads((directory/'manifest.json').read_text());errors=[];warnings=[]
    data={name[:-5]:json.loads((directory/name).read_text()) for name in manifest['files'] if name.endswith('.json')}
    def check(ok,message):
        if not ok:errors.append(message)
    ids={kind:{r.get('id',r.get('nodeId')) for r in rows} for kind,rows in data.items()}
    relations={'event_ids':'events','related_events':'events','case_ids':'cases','related_cases':'cases','source_ids':'sources','primary_sources':'sources','secondary_sources':'sources','actors':'entities','organizations':'entities','document_ids':'documents'}
    for kind,rows in data.items():
        check(len(ids[kind])==len(rows),f'{kind}: duplicate IDs')
        for r in rows:
            ident=r.get('id',r.get('nodeId'))
            required={'cases':['title','summary','start_date','status'],'events':['title','case_id','date','date_precision','claims_status','evidence'],'documents':['title','date','date_precision','source_ids','rights_status'],'sources':['title','original_url','verification_status'],'entities':['name','canonical_id'],'genealogy':['title','year','date_label','timeline_role','chronological_order','references'],'history-accounts':['nodeId','deck','sections','sources','factReview','translationReview'],'authored-documents':['title','description','author'],'guides':['title','body','record_type']}
            check(all(k in r for k in required[kind]),f'{kind}/{ident}: missing required field')
            if kind=='genealogy':
                check(r['timeline_role'] in ['milestone','context'],f'{ident}: unknown history role')
                check(int(r['chronological_order'])==r['year'],f'{ident}: year/order mismatch')
                check(bool(re.fullmatch(r'\d{3}',str(ident))),f'{ident}: invalid stable history ID')
            for field,target in relations.items():
                for ref in r.get(field,[]) or []:check(ref in ids[target],f'{kind}/{ident}/{field}: missing {ref}')
            if kind=='events':
                check(r['case_id'] in ids['cases'],f'{ident}: unknown case')
                check(bool(r['evidence']),f'{ident}: no evidence')
                cited=set(r['primary_sources']+r['secondary_sources'])
                for e in r['evidence']:
                    check(e['source_id'] in ids['sources'],f'{ident}: missing evidence source')
                    check(e['source_id'] in cited,f'{ident}: evidence source not cited')
                    check(bool(e['claim']) and bool(e['locator']),f'{ident}: incomplete evidence')
            if kind in ['events','documents']:
                date,precision=r['date'],r['date_precision']
                pattern={'day':r'\d{4}-\d{2}-\d{2}','month':r'\d{4}-\d{2}','year':r'\d{4}'}
                valid=(date is None and precision=='unknown') or isinstance(date,str) and bool(re.fullmatch(pattern.get(precision,'(?!)'),date))
                if valid and date:
                    try:datetime.date.fromisoformat(date+{'year':'-01-01','month':'-01','day':''}[precision])
                    except ValueError:valid=False
                check(valid,f'{ident}: invalid calendar date/precision {date}')
            if kind=='cases' and r.get('start_date') and r.get('end_date'):check(r['start_date']<=r['end_date'],f'{ident}: reversed case dates')
            if kind=='entities':check(r['canonical_id'] in ids['entities'],f'{ident}: unknown canonical entity')
            if kind=='history-accounts':
                check(ident in ids['genealogy'],f'{ident}: unknown history node')
                sources={s['id'] for s in r['sources']}
                for section in r['sections']:check(bool(section['sourceIds']) and set(section['sourceIds'])<=sources,f'{ident}: unsupported section')
            def walk(value,path=''):
                if isinstance(value,dict):
                    if 'zh' in value or 'en' in value:check('zh' in value and 'en' in value and bool(value['zh'])==bool(value['en']),f'{ident}{path}: bilingual gap')
                    for k,v in value.items():walk(v,path+'.'+k)
                elif isinstance(value,list):
                    for v in value:walk(v,path)
                elif isinstance(value,str):check(not re.search(r'/Users/|/Volumes/|file://|-----BEGIN .*PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{20}',value),f'{ident}: nonpublic path/credential')
            walk(r)
        with (directory/f'{kind}.csv').open(encoding='utf-8-sig',newline='') as f:csvrows=list(csv.DictReader(f))
        check(len(csvrows)==len(rows),f'{kind}: CSV row count')
        for row,c in zip(rows,csvrows):
            expected={k:csv_cell(v) for k,v in flatten(row).items()}
            check(all(c.get(k)==v for k,v in expected.items()) and all(k in expected or v=='' for k,v in c.items()),f'{kind}: CSV content mismatch')
    for name,meta in manifest['files'].items():
        check(hashlib.sha256((directory/name).read_bytes()).hexdigest()==meta['sha256'],f'{name}: checksum mismatch')
        check(meta['records']==len(data[name.rsplit('.',1)[0]]),f'{name}: manifest count mismatch')
    history=data['genealogy'];order=[r['chronological_order'] for r in sorted(history,key=lambda r:r['chronological_order'])]
    check(all(isinstance(v,(int,float)) for v in order),'history: nonnumeric chronology')
    check(set(ids['history-accounts'])==ids['genealogy'],'history: missing account')
    counts=manifest['counts']
    for k,n in [('history_timeline_nodes',sum(r['timeline_role']!='context' for r in history)),('history_context_records',sum(r['timeline_role']=='context' for r in history)),('history_records',len(history)),('history_guides',len(data['guides'])),('documents_total',len(data['documents'])+len(data['authored-documents']))]:check(counts[k]==n,f'count drift: {k}')
    # Similar dates/titles can represent distinct stages. Report candidates, never auto-merge.
    for kind in ['events','genealogy']:
        seen={}
        for r in data[kind]:
            title=re.sub(r'\W+','',r['title']['en'].casefold());key=(r.get('date',r.get('master_date_as_recorded')),title)
            if key in seen:warnings.append({'type':'possible-duplicate','collection':kind,'ids':[seen[key],r['id']]})
            seen[key]=r['id']
    return {'errors':errors,'duplicate_candidates':warnings,'counts':counts,'limits':'Structural validation is not independent verification of every source or translation.'}
if __name__=='__main__':
    report=validate();print(json.dumps(report,ensure_ascii=False,indent=2));sys.exit(bool(report['errors']))
