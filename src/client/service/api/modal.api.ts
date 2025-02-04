import { defHttp } from "../request";
import { ErrorMessageMode, ResultData } from "../request/type";
import BaseApi from "./baseApi.api";
import DataForm from "./modal/dataform";
import ModalTreeNode from "./modal/modal-tree-node";

class ModalApi extends BaseApi<DataForm> {
    constructor() {
        super('/dataform')
    }

      /**
   * 新增记录
   *
   * @param account
   * @param mode
   * @returns
   */
  create(data: DataForm, mode: ErrorMessageMode = 'modal') {
    return defHttp.post<ResultData<DataForm>>(
      {
        url: this.url,
        data,
      },
      { errorMessageMode: mode }
    );
  }

  /**
   * 获取所有模型的树形结构
   * 
   * @param project 
   * @param mode 
   */
  getModalTrees(project: number, mode: ErrorMessageMode = 'modal') {
    return defHttp.get<ResultData<Array<ModalTreeNode>>>(
        {
          url: this.url,
          params: {project},
        },
        { errorMessageMode: mode }
      );
  }
}

const modalApi = new ModalApi();
export default modalApi;