import BaseApi from "./base.api";
import { viteClient } from "./ws.api";
import { ContentTypeEnum, ResultData } from "./modal/request";
import WsStreamHolder from "./wsStreamHolder";
import AppMenu from "./modal/app-menu";
import DdkjAccount from "./modal/ddkj-account";

class ToolApi extends BaseApi {

    constructor() {
        super("/tool/account")
    }

    login(token: string) {
        return viteClient.get<ResultData<DdkjAccount>>(
            {
                url: `${this.baseUri}/login`,
                params: { token },
                Headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
    }

    sse() {
        return viteClient.get(
            {
                url: `${this.baseUri}/sse`
            }
        );
    }

    say(content: string) {
        return viteClient.post<WsStreamHolder>(
            {
                url: `${this.baseUri}/say`,
                data: { content },
                headers: {
                    "Content-Type": ContentTypeEnum.FORM_URLENCODED,
                },
                responseType: "stream"
            }
        )
    }

    getAppMenus() {
        return viteClient.get<ResultData<Array<AppMenu>>>(
            {
                url: `${this.baseUri}/app-menus`,
            }
        )
    }
}

const toolApi = new ToolApi();
export default toolApi;