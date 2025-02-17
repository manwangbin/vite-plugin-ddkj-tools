import { Auth } from "@/client/typings/auth";
import { defHttp } from "../request";
import { ErrorMessageMode, ResultData } from "../request/type";
import BaseApi from "./baseApi.api";
import User from "./modal/user";
import { ContentTypeEnum } from "../request/vaxios";

class ToolApi extends BaseApi<User> {

    constructor() {
        super("/tool/account")
    }

    login(token:string, mode: ErrorMessageMode = 'modal') {
        return defHttp.get<ResultData<Auth.LoginToken>>(
            {
              url: `${this.url}/login`,
              params: {token},
            },
            { errorMessageMode: mode }
          );
    }

    sse(mode: ErrorMessageMode = 'modal') {
        return defHttp.get(
            {
                url: `${this.url}/sse`
            },
            {
                errorMessageMode:mode
            }
        );
    }

    say(content: string, mode: ErrorMessageMode = 'modal') {
        return defHttp.post(
            {
                url: `${this.url}/say`,
                data: {content},
                headers: {
                    "Content-Type": ContentTypeEnum.FORM_DATA
                }
            },
            {
                errorMessageMode:mode
            }
        )
    }
}

const toolApi = new ToolApi();
export default toolApi;