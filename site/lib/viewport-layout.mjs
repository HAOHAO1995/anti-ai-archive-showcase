// Geometry is supplied by the browser, never inferred from a device name.
/** @typedef {{x:number,y:number,width:number,height:number}} Region */
/** @returns {{mode:'continuous'}|{mode:'book',left:Region,right:Region,gap:number}|{mode:'single-segment',region:Region}} */
export function viewportLayout(segments, width, height) {
 const fallback=/** @type {const} */({mode:'continuous'});
 if(!Array.isArray(segments)||segments.length<2||!Number.isFinite(width)||!Number.isFinite(height))return fallback;
 const rects=segments.map(s=>({x:s.x??s.left,y:s.y??s.top,width:s.width,height:s.height}));
 if(rects.some(r=>Object.values(r).some(v=>!Number.isFinite(v))||r.width<=0||r.height<=0||r.x<0||r.y<0||r.x+r.width>width+1||r.y+r.height>height+1))return fallback;
 for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
  const a=rects[i],b=rects[j];if(a.x<b.x+b.width&&b.x<a.x+a.width&&a.y<b.y+b.height&&b.y<a.y+a.height)return fallback;
 }
 const [left,right]=[...rects].sort((a,b)=>a.x-b.x);
 // Only use side-by-side panes when each segment has room for readable text.
 if(rects.length===2&&left.y===0&&right.y===0&&left.height>=height-1&&Math.abs(left.y-right.y)<1&&Math.abs(left.height-right.height)<1&&right.x>=left.x+left.width&&Math.min(left.width,right.width)>=320){
  return {mode:'book',left,right,gap:right.x-left.x-left.width};
 }
 // Tabletop / asymmetric / multiple folds: keep the whole scrollable site in
 // the largest safe region. Prefer the lower region when areas are equal.
 const region=[...rects].sort((a,b)=>b.width*b.height-a.width*a.height||b.y-a.y||a.x-b.x)[0];
 return {mode:'single-segment',region};
}
