/** Navigation uses node order, preserving multiple events within the same year. */
export function clampIndex(index,count){return Math.max(0,Math.min(count-1,Math.round(index)));}
export function indexFromPosition(y,top,height,count){return clampIndex(((y-top)/Math.max(1,height))*(count-1),count);}
export function indexAfterKey(key,index,count){
 const offsets={ArrowUp:-1,ArrowDown:1,ArrowLeft:-1,ArrowRight:1,PageUp:-10,PageDown:10};
 if(key==='Home')return 0;
 if(key==='End')return count-1;
 return Object.hasOwn(offsets,key)?clampIndex(index+offsets[key],count):null;
}

/** Public sequence numbers follow chronology; source IDs and URLs stay stable. */
/** @template {{id:string,timelineRole?:string}} T @param {T[]} records @returns {T[]} */
export function timelineRecords(records){return records.filter(record=>record.timelineRole!=='context');}

export function chronologicalNumber(records,id){
 const index=timelineRecords(records).findIndex(record=>record.id===id);
 return index<0?'':String(index+1).padStart(3,'0');
}
