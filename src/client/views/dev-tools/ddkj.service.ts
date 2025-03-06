import { message } from "ant-design-vue";
import { inject, InjectionKey, reactive } from "vue";
import toolApi from "@/client/api/tool.api";
import AiSession from "@/client/api/modal/aisession";
import { ResultEnum } from "@/client/api/modal/request";
import AiMessage from "@/client/api/modal/aimessage";

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
}

export default class DdkjService {

    static token: InjectionKey<DdkjService> = Symbol(DdkjService.name);

    static inject(): DdkjService {
        return inject(DdkjService.token) as DdkjService;
    }

    state: State;

    session?: AiSession;

    constructor() {
        this.state = reactive({
            showChats: false,
            status: STATUS.CONNECTIING,
            inputContext: ''
        });

        // this.session = new AiSession("test", "创建患者模型");
        // this.state.status = STATUS.RESPONSEING;
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
                    reslove(res);

                } else {
                    const storeToken = sessionStorage.getItem("ddkjDesignToken");
                    if (storeToken) {
                        sessionStorage.removeItem("ddkjDesignToken");
                        this.ddkjLogin(true);
                    } else {
                        reject(res);
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
            return toolApi.say(this.state.inputContext).then((response) => {
                response.onData((event) => this.onStreamDataHandler(event));
                response.onEnd(() => this.onStreamEnd());
                response.onError((event) => this.onStreamError(event));
            });

        } else {
            message.error("请输入指令！");

        }
    }

    onStreamDataHandler(event: any) {
        console.log("on stream data handler", event);
        
        if (event.name === "TaskCreate") {
            this.state.status = STATUS.RESPONSEING;
            this.session = new AiSession(event.id, this.state.inputContext);
            this.state.inputContext = '';

        } else if (event.name === "reason") {
            const reasonData = event.data;
            const reason = { content: reasonData.msg, finished: reasonData.finished, role: "assistant" } as AiMessage;
            if (this.session) {
                this.session.setLastedMsg(reason);
            }
    
            console.log("sse reasson ", this.state);

        }
    }

    onStreamEnd() {
        setTimeout(() => {
            this.state.status = STATUS.CONNECTED;
            this.session = undefined;
        }, 2000);
    }

    onStreamError(error: any) {
        this.onStreamEnd();
        message.error(error.msg || "系统错误");
    }

    onClickStopResponse() {
        if (this.state.status === STATUS.RESPONSEING) {
            this.state.inputContext = '';
            this.state.status = STATUS.CONNECTED;
        }
    }
}

export { STATUS };