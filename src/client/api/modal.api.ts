import BaseApi from "./base.api";
import DataForm from "./modal/dataform";
import ModalTreeNode from "./modal/modal-tree-node";
import { ResultData } from "./modal/request";
import { viteClient } from "./ws.api";

class ModalApi extends BaseApi {
    constructor() {
        super('/tool/form')
    }

      /**
   * 新增记录
   *
   * @param account
   * @param mode
   * @returns
   */
  create(data: DataForm) {
    return viteClient.post<ResultData<DataForm>>(
      {
        url: this.baseUri,
        data,
      }
    );
  }

  detail(id: number) {
    return viteClient.get<ResultData<DataForm>>(
      {
        url: `${this.baseUri}/detail`,
        params: {id}
      }
    );
  }

  /**
   * 获取所有模型的树形结构
   * 
   * @param project 
   * @param mode 
   */
  getModalTrees() {
    return viteClient.get<ResultData<Array<ModalTreeNode>>>(
        {
          url: this.baseUri
        }
      );
  }
}

const modalApi = new ModalApi();
export default modalApi;