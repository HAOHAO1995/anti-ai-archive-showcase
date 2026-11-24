/** Select by stable node ID and actual card geometry, never by year. */
export function nearestHistoryCard(rows,anchor,top,bottom,preferred){
 let best=null,distance=Infinity;
 for(const row of rows){
  if(row.bottom<=top||row.top>=bottom||row.height===0)continue;
  // Introductory guide cards have no historical position. Do not jump ahead
  // to the first historical card while a guide occupies the reading line.
  if(row.top>anchor&&best===null)continue;
  const d=anchor>=row.top&&anchor<=row.bottom?0:Math.abs(row.top-anchor);
  if(d<distance||(d===distance&&row.id===preferred)){best=row;distance=d;}
 }
 return best?.id??null;
}
export function historyHashId(hash){return /^#(?:node|genealogy)-(\d{3})$/.exec(hash)?.[1]??null;}
