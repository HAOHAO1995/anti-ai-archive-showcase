import copy,csv,importlib.util,json,pathlib,sys,tempfile,unittest,shutil
ROOT=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from public_data import csv_cell
spec=importlib.util.spec_from_file_location('validator',ROOT/'scripts/validate-data.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class PublicDataTests(unittest.TestCase):
 def test_export_integrity(self):self.assertEqual(mod.validate()['errors'],[])
 def test_formula_escape(self):
  for text in ['=1+1',' \t@SUM(1)','+cmd','-2','\ttext',"'literal"]:self.assertTrue(csv_cell(text).startswith("'"))
  self.assertEqual(csv_cell('normal'),'normal');self.assertEqual(csv_cell(['a,b','汉字']), '["a,b","汉字"]')
 def test_corruption_detection(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=pathlib.Path(tmp);shutil.copytree(ROOT/'data',root/'data');p=root/'data/events.json';rows=json.loads(p.read_text());rows[0]['date']='2026-02-30';rows[0]['date_precision']='day';rows[0]['evidence'][0]['source_id']='missing-source';rows[0]['summary']['en']='';rows.append(copy.deepcopy(rows[0]));p.write_text(json.dumps(rows));errors=mod.validate(root)['errors']
   for phrase in ['duplicate IDs','invalid calendar','missing evidence source','bilingual gap','checksum mismatch','CSV row count']:self.assertTrue(any(phrase in e for e in errors),phrase)
 def test_history_roles_and_guides_separate(self):
  manifest=json.loads((ROOT/'data/manifest.json').read_text());counts=manifest['counts']
  self.assertEqual(counts['history_records'],counts['history_timeline_nodes']+counts['history_context_records'])
  self.assertEqual(counts['history_accounts'],counts['history_records'])
  self.assertEqual(counts['history_guides'],len(json.loads((ROOT/'data/guides.json').read_text())))
 def test_unknown_dates_not_invented(self):
  rows=json.loads((ROOT/'data/documents.json').read_text());unknown=[r for r in rows if r['date_precision']=='unknown'];self.assertTrue(unknown)
  self.assertTrue(all(r['date'] is None and 'date_as_recorded' in r for r in unknown))
if __name__=='__main__':unittest.main()
