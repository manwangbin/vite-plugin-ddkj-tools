import { ViteHotContext } from "vite/types/hot.js";

export class WsBaseApi {

    constructor(public wsHot: ViteHotContext) {

    }

}

export default function (hot?: ViteHotContext) {
    if (hot) {
        hot.on('my:greetings', (data) => {
            console.log("client recive", data);
            hot.send('my:from-client', {msg: 'hello sever my is client'});
        })
    }
}

