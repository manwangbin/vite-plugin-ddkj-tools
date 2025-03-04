import { ViteDevServer } from "vite";
import ClientRequest from "./modal/clientRequest";
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8002/api";

export default function startServer(server: ViteDevServer) {
    server.hot.on("ddkj:apiRequest", (data: ClientRequest, client: any) => {
        axios(
            {
                ...data,
                url: `${API_BASE}${data.url}`
            }
        ).then(res => {
            const resData = { ...res.data, id: data.id };
            client.send("ddkj:apiResponse", resData);
            console.log("send response", resData);

        }).catch((err) => {
            client.send("ddkj:apiResponse", { id: data.id, state: -1, msg: err });
            console.error("response error", err);

        })
    });
}