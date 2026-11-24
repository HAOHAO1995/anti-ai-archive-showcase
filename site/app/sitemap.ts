
import researchReferences from '@/lib/data/ai-research-references.json';
import genealogy from '@/lib/data/genealogy.json';
import authoredDocuments from '@/lib/data/authored-documents.json';
import topics from '@/lib/data/topics.json';
import {archive} from '@/lib/archive';
import {localizedPath,siteOrigin} from '@/lib/i18n';
export default function sitemap(){const paths=[...researchReferences.map(r=>`/topics/culture-governance/references/${r.id}`),...topics.filter(t=>t.slug!=='ai-art-history').flatMap(t=>['overview',...t.sections.map(s=>s.id),'references'].map(id=>`/topics/${t.slug}/guides/${id}`)),...['overview',...topics.find(t=>t.slug==='ai-art-history')!.sections.map(s=>s.id)].map(id=>`/art-history/guides/${id}`),...genealogy.records.map(r=>`/art-history/${r.id}`),...authoredDocuments.map(d=>'/documents/'+d.id),...topics.map(t=>`/topics/${t.slug}`),'/','/research','/documents','/index','/about',...(['events','cases','documents','sources'] as const).flatMap(k=>archive[k].map(r=>`/${k}/${r.id}`))];return paths.flatMap(path=>(['en','zh'] as const).map(locale=>({url:siteOrigin+localizedPath(path,locale),alternates:{languages:{en:siteOrigin+localizedPath(path,'en'),'zh-CN':siteOrigin+localizedPath(path,'zh')}}})));}
