import { ViteHotContext } from "vite/types/hot.js";

export default function (hot?: ViteHotContext) {
    if (hot) {
        hot.on('my:greetings', (data) => {
            // console.log('servermsg', data.msg) // hello
            hot.send('my:from-client', {msg: 'hello sever my is client'});
        })
    }
}