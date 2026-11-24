#!/usr/bin/env python3
"""Check repository-relative Markdown targets and citation essentials."""
import pathlib,re,sys,urllib.parse,json
root=pathlib.Path(__file__).resolve().parents[1];errors=[]
files=[*root.glob('*.md'),*root.glob('docs/**/*.md'),*root.glob('updates/**/*.md'),*root.glob('data/**/*.md'),*root.glob('assets/**/*.md'),*root.glob('.github/**/*.md')]
for p in files:
 for link in re.findall(r'\]\(([^\s)]+)',p.read_text()):
  if urllib.parse.urlsplit(link).scheme or link.startswith('#'):continue
  target=urllib.parse.unquote(link.split('#')[0])
  if not (p.parent/target).exists():errors.append(f'{p.relative_to(root)}: missing {target}')
cff=(root/'CITATION.cff').read_text()
for key in ['cff-version:','authors:','version:','license:','repository-code:','repository-artifact:']:
 if key not in cff:errors.append('CITATION.cff: missing '+key)
for f in ['LICENSE','DATA_LICENSE.md','METHODOLOGY.md','CONTRIBUTING.md','CHANGELOG.md','ROADMAP.md']:
 if not (root/f).exists():errors.append('Missing '+f)
print(json.dumps({'markdown_files_checked':len(files),'errors':errors},indent=2));sys.exit(bool(errors))
