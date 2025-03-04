import { connect } from "http2";
import { setTimeout } from "timers";
import { ViteHotContext } from "vite/types/hot.js";

export class ViteClient {

    requestQueue: Map<string, {connTimer: NodeJS.Timeout, reslove: (value: any) => void}> = new Map();

    viteHotContext?: ViteHotContext

    register(viteHotContext: ViteHotContext) {
        this.viteHotContext = viteHotContext;
        this.viteHotContext.on("ddkj:apiResponse", (response:any) => {
            const requestId = response.id;
            const requestCallback = this.requestQueue.get(requestId);
            if (requestCallback) {
                if (requestCallback.connTimer) {
                    clearTimeout(requestCallback.connTimer);
                }
                
                if (requestCallback.reslove) {
                    requestCallback.reslove(response);
                }
            }
        });
    }

    get<T = any>(config: any) {
        const queryConfig = {method: "GET", ...config};
        return this.sendApiRequest<T>(queryConfig);
    }

    post<T = any>(config: any) {
        const postConfig = {method: "POST", ...config};
        return this.sendApiRequest<T>(postConfig);
    }

    put<T = any>(config: any) {
        const putConfig = {method: "PUT", ...config};
        return this.sendApiRequest<T>(putConfig);
    }

    delete<T = any>(config: any) {
        const deleteConfig = {method: "PUT", ...config};
        return this.sendApiRequest<T>(deleteConfig);
    }

    sendApiRequest<T=any>(config:any) {
        return new Promise((reslove:(value: T) => void, reject) => {
            if (this.viteHotContext) {
                const id = JSON.stringify({url: config.url, params: config.params, data: config.data});
                const headerAuthor = config.headers && config.headers['Authorization'];
                const localToken = sessionStorage.getItem("ddkjDesignToken");
                if (!headerAuthor && localToken) {
                    config.headers = {
                        ...config.headers,
                        'Authorization': `Bearer ${localToken}`
                    }
                }

                if (this.requestQueue.has(id)) {
                    reject({code: -1, msg: 'repeat request'});

                } else {
                    this.viteHotContext.send("ddkj:apiRequest", {id: id, ...config});
                    const connection =  config.headers && config.headers["Connection"];
                    
                    let timeout = 60000;
                    if (connection === "keep-alive") {
                        timeout = 300000;
                    }
                    const connTimer = setTimeout(() => reject({code: 400, msg : 'connect timeout'}), timeout);
                    this.requestQueue.set(id, {connTimer, reslove});

                }
               
            } else {
                reject({code: -1, msg: 'vitehost context is null'});

            }
        });
    }
}

const viteClient = new ViteClient(); 
export {viteClient};

export default function (hot?: ViteHotContext) {
    if (hot) {
        viteClient.register(hot);
    }
}

