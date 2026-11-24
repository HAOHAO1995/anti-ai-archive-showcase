#!/usr/bin/env python3
"""Resolve an event's evidence chain using only downloaded JSON files."""
import argparse,json,pathlib
p=argparse.ArgumentParser();p.add_argument('event_id',nargs='?',default='evt-0001');p.add_argument('--data',type=pathlib.Path,default=pathlib.Path(__file__).resolve().parents[1]/'data');args=p.parse_args()
events=json.loads((args.data/'events.json').read_text());sources={r['id']:r for r in json.loads((args.data/'sources.json').read_text())}
event=next((r for r in events if r['id']==args.event_id),None)
if event is None:raise SystemExit('Unknown event ID; see events.json')
print(event['id'],event['date'],event['date_precision'],event['title']['en'])
print('Claim status:',event['claims_status'],'; review:',event['review_status'])
for evidence in event['evidence']:
 source=sources[evidence['source_id']]
 print('\nClaim:',evidence['claim']['en'])
 print('Locator:',evidence['locator']['en'])
 print('Source:',source['id'],source['original_title'])
 print('URL:',source['original_url'])
