import { ViteDevServer } from "vite";
import ClientRequest from "./modal/clientRequest";
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8002/api";

export default function startServer(server: ViteDevServer) {
    server.ws.on("ddkj:apiRequest", (data: ClientRequest, client: any) => {
        const streamResponse = data.responseType === "stream";
        axios(
            {
                ...data,
                url: `${API_BASE}${data.url}`
            }
        ).then(res => {
            if (streamResponse) {
                res.data.on('data', (chunk: Buffer) => {
                    const chunkData = chunk.toString('utf8');
                    try {
                        client.send("ddkj:streamData", {...JSON.parse(chunkData), id: data.id});
                    } catch(e) {
                        client.send("ddkj:streamData", {data: chunkData, id: data.id});
                    }
                });

                res.data.on('end', () => {
                    client.send("ddkj:streamEnd", { id: data.id });
                });

                res.data.on("error", (error: any) => {
                    client.send("ddkj:streamError", error);
                    console.error("stream error", {id: data.id, error});
                });

            } else {
                const resData = { ...res.data, id: data.id };
                client.send("ddkj:apiResponse", resData);
                console.log("send response", resData);

            }

        }).catch((err) => {
            client.send("ddkj:apiResponse", { id: data.id, state: -1, msg: err });
            console.error("response error", err);

        })
    });
}