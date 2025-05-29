import { Auth } from "@/client/typings/auth";
import BaseApi from "./base.api";
import { viteClient } from "./ws.api";
import { ContentTypeEnum, ResultData } from "./modal/request";
import WsStreamHolder from "./wsStreamHolder";

class ToolApi extends BaseApi {

    constructor() {
        super("/tool/account")
    }

    login(token: string) {
        return viteClient.get<ResultData<Auth.LoginToken>>(
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
}

const toolApi = new ToolApi();
export default toolApi;