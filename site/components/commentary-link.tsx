'use client';
import {Link,Text,useLanguage} from './site-shell';
import authoredDocuments from '@/lib/data/authored-documents.json';
export function AuthoredDocumentLink({document}:{document:typeof authoredDocuments[number]}){
 const {lang}=useLanguage();
 return <section className={'commentary-entry'+(document.pinned?' pinned-document':'')} data-document-id={document.id}>
 <span className="eyebrow">{document.pinned&&<span className="pinned-document-label"><Text zh="置顶" en="PINNED"/> · </span>}{document.kind[lang]} · {document.author} · {document.dateLabel[lang]}</span>
 <Link href={'/documents/'+document.id}>{document.title[lang]} ↗</Link><p>{document.description[lang]}</p></section>;
}
export function CommentaryLink(){return <AuthoredDocumentLink document={authoredDocuments.find(d=>d.id==='disco-ai-2023')!}/>}
