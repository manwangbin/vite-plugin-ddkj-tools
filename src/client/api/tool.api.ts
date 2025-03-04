import { Auth } from "@/client/typings/auth";
import BaseApi from "./base.api";
import { viteClient } from "./ws.api";
import { ContentTypeEnum, ResultData } from "./modal/request";

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
        return viteClient.post(
            {
                url: `${this.baseUri}/say`,
                data: { content },
                headers: {
                    "Content-Type": ContentTypeEnum.FORM_DATA,
                    "Connection": "keep-alive",
                    "Keep-Alive": "timeout=300"
                }
            }
        )
    }
}

const toolApi = new ToolApi();
export default toolApi;