export const HISTORY_POSITION='archive:history-position';
export type HistoryPosition={id:string;source:'catalogue'|'rail';motion:'scrub'|'select'};
export function publishHistoryPosition(id:string,source:HistoryPosition['source'],motion:HistoryPosition['motion']='scrub'){
 window.dispatchEvent(new CustomEvent<HistoryPosition>(HISTORY_POSITION,{detail:{id,source,motion}}));
}
