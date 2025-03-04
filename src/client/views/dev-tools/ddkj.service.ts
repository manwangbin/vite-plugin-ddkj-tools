import { ResultEnum } from "@/client/service/request/vaxios";
import { AiSession } from "@/client/service/sse/modal/aisession";
import AiMessage from "@/client/service/sse/modal/aimessage";
import { message } from "ant-design-vue";
import { inject, InjectionKey, reactive } from "vue";
import toolApi from "@/client/api/tool.api";

enum STATUS {

    CONNECTIING = 0,

    CONNECTED = 1,

    REQUESETNEWTASK = 2,

    RESPONSEING = 3,

    LOST = 4
}

interface State {
    status: STATUS,
    inputContext: string,
    session?: AiSession,
    responseReason?: AiMessage;
}

export default class DdkjService {

    static token: InjectionKey<DdkjService> = Symbol(DdkjService.name);

    static inject(): DdkjService {
        return inject(DdkjService.token) as DdkjService;
    }

    state: State;

    constructor() {
        this.state = reactive({
            showChats: false,
            status: STATUS.CONNECTIING,
            inputContext: ''
        });
    }

    getUrlQueryParam(name: string) {
        let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        let r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
        let context = '';
        if (r) context = r[2];
        return context ? context : '';
    }

    ddkjLogin(useParam?: boolean) {
        return new Promise((reslove, reject) => {
            const urlParam = this.getUrlQueryParam("ddkj");            
            let token = useParam ? urlParam : sessionStorage.getItem("ddkjDesignToken");
            if (!token) {
                token = urlParam;
            }

            toolApi.login(token).then(res => {
                if (res.state === ResultEnum.SUCCESS && res.data) {
                    sessionStorage.setItem('ddkjDesignToken', res.data.token);
                    this.state.status = STATUS.CONNECTED;
                    reslove({});
                } else {
                    const storeToken = sessionStorage.getItem("ddkjDesignToken");
                    if (storeToken) {
                        sessionStorage.removeItem("ddkjDesignToken");
                        this.ddkjLogin(true);
                    } else {
                        reject({});
                    }
                }
            }).catch((error) => {
                const storeToken = sessionStorage.getItem("ddkjDesignToken");
                if (storeToken) {
                    sessionStorage.removeItem("ddkjDesignToken");
                    this.ddkjLogin(true);
                } else {
                    reject(error);
                }
            });
        });
    }

    onInputPressEnter() {
        if (this.state.status !== STATUS.CONNECTED) {
            message.error("还没有连接到服务器！")
            return;
        }

        if (this.state.inputContext && this.state.inputContext.length > 0) {
            this.state.status = STATUS.REQUESETNEWTASK;
            toolApi.say(this.state.inputContext).then(res => {
                if (res.state !== ResultEnum.SUCCESS) {
                    message.error(res.msg);
                    this.state.status = STATUS.CONNECTED;
                } else {
                    this.state.session = { title: this.state.inputContext, sessionId: '', msg: [] } as AiSession;
                    this.state.status = STATUS.RESPONSEING;
                    this.state.inputContext = "";
                }
            });
        }
    }

    onClickStopResponse() {
        if (this.state.status === STATUS.RESPONSEING) {
            this.state.inputContext = '';
            this.state.status = STATUS.CONNECTED;
        }
    }


    sseHandler(event: any) {
        if (event.data && event.data === "connected") {
            console.log("sse connected");
            if (this.state.status === STATUS.CONNECTIING) {
                this.state.status = STATUS.CONNECTED;
            }
        }
    }

    startSession(sessionId: string) {
        this.state.status = STATUS.RESPONSEING;
        if (this.state.session) {
            this.state.session.sessionId = sessionId;
        }
    }

    complateTask() {
        setTimeout(() => {
            this.state.status = STATUS.CONNECTED;
            this.state.session = undefined;
            this.state.responseReason = undefined;
        }, 2000);
    }

    sseReasonHandler(event: any) {
        if (!event || !event.data) {
            return;
        }

        const data = JSON.parse(event.data);
        const reason = { ...data, type: 'reason' } as AiMessage;
        if (this.state.session) {
            if (!reason.finished) {
                this.state.responseReason = reason;

            } else if (this.state.session) {
                this.state.session.msg.push(reason);
                this.state.responseReason = undefined;

            }
        }

        console.log("sse reasson ", this.state);
    }
}

export { STATUS };