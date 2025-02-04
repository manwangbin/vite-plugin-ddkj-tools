import { ContentTypeEnum, type ErrorMessageMode, type ResultData, type StardPageData } from '../request/vaxios';
import { defHttp } from '../request';

export default class BaseApi<T> {
  
  constructor(public url: string) { }

  /**
   * 新增记录
   *
   * @param account
   * @param mode
   * @returns
   */
  insert(data: T, mode: ErrorMessageMode = 'modal') {
    return defHttp.post<ResultData<T>>(
      {
        url: this.url,
        data,
      },
      { errorMessageMode: mode }
    );
  }

  /**
   * 修改
   *
   * @param data
   * @param mode
   * @returns
   */
  update(data: any, mode: ErrorMessageMode = 'modal') {
    return defHttp.put<ResultData<T>>(
      {
        url: this.url,
        data,
      },
      {
        errorMessageMode: mode
      }
    );
  }

  /**
   * 删除账号
   *
   * @param account
   * @param mode
   * @returns
   */
  remove(id: string, mode: ErrorMessageMode = 'modal') {
    return defHttp.delete<ResultData<string>>(
      {
        url: this.url,
        params: { id },
        headers: {
          'Content-Type': ContentTypeEnum.FORM_DATA
        }
      },
      { errorMessageMode: mode }
    );
  }

  /**
   * 根据Id获取记录
   *
   * @param id
   * @param mode
   * @returns
   */
  getById(id: string, mode: ErrorMessageMode = 'modal') {
    return defHttp.get<ResultData<T>>({ url: `${this.url}/getById`, params: { id } }, { errorMessageMode: mode });
  }

  /**
   * @param mode
   * @returns
   */
  getAll(mode: ErrorMessageMode = 'modal') {
    return defHttp.get<ResultData<StardPageData<T>>>({ url: `${this.url}/getAll` }, { errorMessageMode: mode });
  }

  /**
   * 根据条件查找
   *
   * @param data
   * @param mode
   * @returns
   */
  findByExample(data: any, mode: ErrorMessageMode = 'modal') {
    return defHttp.get<ResultData<StardPageData<T>>>(
      {
        url: `${this.url}/getAllExamplePaged`,
        params: data,
      },
      { errorMessageMode: mode }
    );
  }

  /** @param ids */
  getByIds(ids: Array<string>, mode: ErrorMessageMode = 'modal') {
    return defHttp.get<ResultData<Array<T>>>(
      {
        url: `${this.url}/getByIds`,
        params: { ids: ids },
        headers: {
          "Content-Type": ContentTypeEnum.FORM_DATA
        }
      },
      { errorMessageMode: mode }
    );
  }
}
