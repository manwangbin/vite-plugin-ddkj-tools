import { computed, reactive } from "vue";
import AiMessage from "./aimessage";

interface SessionState {
    id: string;
    title: string;
    msgs: Array<AiMessage>;
    responseMsg?: AiMessage;
}

export default class AiSession {

    state: SessionState;

    constructor(id: string, userMsg: string) {
        this.state = reactive({ id, title: userMsg, msgs: [{ content: userMsg, role: "user", finished: true }], responseMsg: {content: '', role: "assistant", finished: false} })
    }

    setLastedMsg(msg: AiMessage) {
        if (!msg.finished) {
            this.state.responseMsg = msg;
        } else {
            this.state.msgs.push(msg);
            this.state.responseMsg = undefined;
        }
    }

    allMsgs = computed(() => {
        const msgs = [...this.state.msgs];
        if (this.state.responseMsg) {
            msgs.push(this.state.responseMsg);
        }

        return msgs;
    })
}