import { ViteHotContext } from "vite/types/hot.js";
import WsStreamHolder from "./wsStreamHolder";

const sseHandler:Map<string, Array<(event:any) => void>> = new Map();

export class ViteClient {

    requestQueue: Map<string, { connTimer: NodeJS.Timeout, reslove: (value: any) => void }> = new Map();

    streamResponse: Map<string, WsStreamHolder> = new Map();

    viteHotContext?: ViteHotContext

    get<T = any>(config: any) {
        const queryConfig = { method: "GET", ...config };
        return this.sendApiRequest<T>(queryConfig);
    }

    post<T = any>(config: any) {
        const postConfig = { method: "POST", ...config };
        return this.sendApiRequest<T>(postConfig);
    }

    put<T = any>(config: any) {
        const putConfig = { method: "PUT", ...config };
        return this.sendApiRequest<T>(putConfig);
    }

    delete<T = any>(config: any) {
        const deleteConfig = { method: "PUT", ...config };
        return this.sendApiRequest<T>(deleteConfig);
    }

    sendApiRequest<T = any>(config: any) {
        return new Promise((reslove: (value: T) => void, reject) => {
            if (this.viteHotContext) {
                const id = JSON.stringify({ url: config.url, params: config.params, data: config.data });
                const headerAuthor = config.headers && config.headers['Authorization'];
                const localToken = sessionStorage.getItem("ddkjDesignToken");
                if (!headerAuthor && localToken) {
                    config.headers = {
                        ...config.headers,
                        'Authorization': `Bearer ${localToken}`
                    }
                }

                const stream = config.responseType === "stream";
                if (stream) {
                    if (this.streamResponse.has(id)) {
                        reject({ code: -1, msg: 'repeat request' });

                    } else {
                        this.viteHotContext.send("ddkj:apiRequest", { id: id, ...config });
                        const streamHalder: WsStreamHolder = new WsStreamHolder(id);
                        this.streamResponse.set(id, streamHalder);
                        reslove(streamHalder as T)

                    }

                } else {
                    if (this.requestQueue.has(id)) {
                        reject({ code: -1, msg: 'repeat request' });

                    } else {
                        this.viteHotContext.send("ddkj:apiRequest", { id: id, ...config });
                        const connTimer = setTimeout(() => reject({ code: 400, msg: 'connect timeout' }), 60000);
                        this.requestQueue.set(id, { connTimer, reslove });

                    }

                }

            } else {
                reject({ code: -1, msg: 'vitehost context is null' });

            }
        });
    }

    register(viteHotContext: ViteHotContext) {
        this.viteHotContext = viteHotContext;
        this.viteHotContext.on("ddkj:apiResponse", (response: any) => {
            const requestId = response.id;
            const requestCallback = this.requestQueue.get(requestId);
            if (!requestCallback) {
                return;
            }

            this.requestQueue.delete(requestId);
            if (requestCallback.connTimer) {
                clearTimeout(requestCallback.connTimer);
            }

            if (requestCallback.reslove) {
                requestCallback.reslove(response);
            }
        });

        this.viteHotContext.on("ddkj:streamData", (response: any) => {
            console.log("ddkj:streamData", response);
            const holder = this.streamResponse.get(response.id);
            if (holder) {
                holder.sendData(response);
            }

            if (response.name) {
                const handlers = sseHandler.get(response.name);
                if (handlers) {
                    for (let i = 0; i < handlers.length; i++) {
                        console.log("invoker regist handler", handlers[i]);
                        handlers[i](response);
                    }
                }
            }
        });

        this.viteHotContext.on("ddkj:streamError", (response: any) => {
            const holder = this.streamResponse.get(response.id);
            if (holder) {
                holder.error(response);
                this.streamResponse.delete(response.id);
            }
        });

        this.viteHotContext.on("ddkj:streamEnd", (response: { id: string }) => {
            const holder = this.streamResponse.get(response.id);
            if (holder) {
                holder.end();
                this.streamResponse.delete(response.id);
            }
        });
    }
}

function registSseHandler(name:string, handler: (event:any) => void) {
    let handlers = sseHandler.get(name);
    if (!handlers) {
        handlers = new Array<(event:any) => void>();
        sseHandler.set(name, handlers);
    }

    const index = handlers.findIndex(item => item === handler);
    if (index === -1) {
        handlers.push(handler);
    }
}

function removeRegistHandler(name:string, handler: (event:any) => void) {
    let handlers = sseHandler.get(name);
    if (handlers) {
        const index = handlers.findIndex(item => item === handler);
        if (index > -1) {
            handlers = handlers.splice(index, 1);
            sseHandler.set(name, handlers);
        }
    }
}

const viteClient = new ViteClient();
export { viteClient, registSseHandler, removeRegistHandler };

export default function (hot?: ViteHotContext) {
    if (hot) {
        viteClient.register(hot);
    }
}

