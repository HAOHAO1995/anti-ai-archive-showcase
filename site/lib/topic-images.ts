import illustrations from './data/topic-illustrations.json';
export type TopicVisual={id:string;kind?:string;capturedAt?:string;recordIds:string[];src:string;width:number;height:number;caption:{zh:string;en:string};credit:{zh:string;en:string};sourceTitle:{zh:string;en:string};sourceUrl:string;sha256:string};
export const topicVisuals=illustrations.records as TopicVisual[];
export const topicVisualById=new Map(topicVisuals.map(v=>[v.id,v]));
const visualByRecord=new Map(topicVisuals.flatMap(v=>v.recordIds.map(id=>[id,v.id] as const)));
export function topicIllustrationId(recordId:string){return visualByRecord.get(recordId);}
