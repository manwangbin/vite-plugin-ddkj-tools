import { ViteDevServer } from "vite";
import ClientRequest from "./modal/clientRequest";
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8002/api";
const textDecoder = new TextDecoder();

function updateDevNum(appId: number, number: number) {
    axios({
        url: `${API_BASE}/tool/account/dev-number`,
        params: { appId, number },
        method: 'get'
    }).then((res) => {
        
    }).catch(error => {
        console.error("update dev number error", error);
    })
}

export default function startServer(appId: number, server: ViteDevServer) {
    server.ws.on("connection", (socket, request) => {
        if (socket) {
            socket.on("close", () => {
                updateDevNum(appId, server.ws.clients.size || 0);
            });
        }

        updateDevNum(appId, server.ws.clients.size || 0)
    });

    server.ws.on("ddkj:apiRequest", (data: ClientRequest, client: any) => {
        const streamResponse = data.responseType === "stream";
        console.log("begin send request ", data);
        axios(
            {
                ...data,
                url: `${API_BASE}${data.url}`
            }
        ).then(async (res) => {
            if (res.status !== 200) {
                client.send("ddkj:streamError", res.statusText);
                console.error("stream error", { id: data.id, error: res.statusText });
            } else {
                if (streamResponse) {
                    console.log("res.data", res.data);
                    const reader = res.data.getReader();

                    let end = false;
                    do {
                        const { done, value } = await reader.read();
                        if (value) {
                            const chunkData = textDecoder.decode(value);
                            client.send("ddkj:streamData", { ...JSON.parse(chunkData), id: data.id });
                        }

                        if (done) {
                            client.send("ddkj:streamEnd", { id: data.id });
                        }

                        end = done;
                        console.log("reader ", done, textDecoder.decode(value));
                    } while (!end)

                } else {
                    const resData = { ...res.data, id: data.id };
                    client.send("ddkj:apiResponse", resData);
                    console.log("send response", resData);

                }

            }

        }).catch((err) => {
            client.send("ddkj:apiResponse", { id: data.id, state: -1, msg: err });
            console.error("response error", err);

        })
    });
}