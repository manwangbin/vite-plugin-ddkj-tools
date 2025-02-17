export interface SseHandler {

    process(id:string, name: string, data:any):void;
}