/** A record-specific English historical description, taken from the existing English account.
 * Never substitute a shared category slogan for the record's bilingual title. */
export function readingSubtitle(description:string):string {
 const text=description.replace(/\s+/g,' ').trim();
 if(!text)return '';
 const sentences=[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(text)].map(s=>s.segment.trim());
 let first=sentences.shift()??text;
 while(sentences.length&&/\b(?:Dr|Mr|Mrs|Ms|Prof|St|Fig|No|Vol|Jr|Sr|[A-Z])\.$/.test(first))first+=' '+sentences.shift();
 return first;
}
