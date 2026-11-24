'use client';
import topics from '@/lib/data/topic-navigation.json';
import {Link,useLanguage,Text} from './site-shell';
export function TopicLinks({compact=false,caseIds}:{compact?:boolean;caseIds?:string[]}){
 const {lang}=useLanguage();
 const related=caseIds?topics.filter(topic=>topic.caseIds.some(id=>caseIds.includes(id))):topics;
 if(!related.length)return null;
 return <nav className={'topic-links'+(compact?' is-compact':'')} aria-label={lang==='zh'?'研究专题':'Research guides'}>
  <span className="eyebrow"><Text zh="从研究问题进入" en="EXPLORE A RESEARCH QUESTION"/></span>
  <div>{related.map(t=><Link key={t.slug} href={`/topics/${t.slug}`}><span>{t.shortTitle[lang]}</span><span aria-hidden="true">↗</span></Link>)}</div>
 </nav>;
}
