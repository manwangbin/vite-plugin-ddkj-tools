import { inject, InjectionKey, provide } from "vue";

export default class SseClient {

    static token: InjectionKey<SseClient> = Symbol(SseClient.name);

    static inject(): SseClient {
        return inject(SseClient.token) as SseClient;
    }

    eventSource?: EventSource;

    constructor() {
        provide(SseClient.token, this);
    }

    registerHandler(name: string, listener: (this: EventSource, event: MessageEvent) => any) {
        if (this.eventSource) {
            this.eventSource.addEventListener(name, listener);
        }
    }

    removeHandler(name: string, handler: any) {
        if (this.eventSource) {
            this.eventSource.removeEventListener(name, handler)
        }
    }

    connted() {
        return new Promise<{ state: number }>((reslove, reject) => {
            this.eventSource = new EventSource('http://127.0.0.1:8002/api/tool/account/sse?token=' + sessionStorage.getItem("ddkjDesignToken"));
            this.eventSource.addEventListener("open", function (e) {
                console.log('eventSource open successfully', e);
                reslove({ state: 0 });
            })
            /*
            * message：后端返回信息，格式可以和后端协商
            */
            this.eventSource.addEventListener("message", function (e) {
                console.log('eventSource msg', e.data);
            })
            /*
            * error：错误（可能是断开，可能是后端返回的信息）
            */
            this.eventSource.addEventListener("error", function (err) {
                console.error('eventSource error', err);
                reject({ state: -1 });
            })
        })

    }
}

