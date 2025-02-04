import type { AxiosInstance, AxiosResponse } from 'axios';
// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import { clone } from 'lodash-es';
import { RequestOptions, ResultData, ContentTypeEnum, RequestEnum, VAxios, Recordable } from './vaxios';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';
import { isString } from '@/client/utils/is';
import { deepMerge } from '@/client/utils/object';
import { Modal, message } from 'ant-design-vue';
import { localStg } from '@/client/utils/storage';
import { checkStatus } from './checkStatus';
import { createParamSign, formatRequestDate } from './helper';
import qs from 'qs';

const API_SALT = 'ddkj@tuweisoft.com';
const API_BASE_URl = 'http://127.0.0.1:8002/api/';

/** @description: 数据处理，方便区分多种处理方式 */

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  const transform: AxiosTransform = {
    /** @description: 处理响应数据。如果数据不是预期格式，可直接抛出错误 */
    transformResponseHook: (res: AxiosResponse<ResultData>, options: RequestOptions) => {
      if (res.headers.token) {
        localStg.set('ddkjtoolsToken', res.headers.token)
      }

      const { data } = res;
      const successed = data && Reflect.has(data, 'state');
      if (successed) {
        return data;
      }

      // 错误的时候返回
      const msg = `$t(api.apiRequestFailed):${res.status}`;
      if (options.errorMessageMode === 'modal') {
        Modal.error({ title: '请求错误', content: msg });
      } else if (options.errorMessageMode === 'message') {
        message.error(msg);
      }

      throw new Error(msg);
    },

    // 请求之前处理config
    beforeRequestHook: (config, options) => {
      const { formatDate } = options;
      const params = config.params || {};
      const data = config.data;

      if (!(config as Recordable).headers) {
        (config as Recordable).headers = {};
      }
      const time = new Date().getTime();
      (config as Recordable).headers.time = time;
      (config as Recordable).headers.sign = createParamSign(params, time, API_SALT);

      formatDate && data && !isString(data) && formatRequestDate(data);
      const token = localStg.get('ddkjtoolsToken');
      if (token) {
        (config as Recordable).headers.Authorization = `Bearer ${token}`;
      }
      if (config.method?.toUpperCase() === RequestEnum.GET) {
        config.paramsSerializer = function(params) {
          return qs.stringify(params, {arrayFormat: 'repeat'})
        }
        if (!isString(params)) {
          // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
          config.params = params;
        } else {
          // 兼容restful风格
          config.url += params;
          config.params = undefined;
        }
      } else if (!isString(params)) {
        formatDate && formatRequestDate(params);
        if (
          Reflect.has(config, 'data') &&
          config.data &&
          (Object.keys(config.data).length > 0 || config.data instanceof FormData)
        ) {
          config.data = data;
          config.params = params;
        } else {
          // 非GET请求如果没有提供data，则将params视为data
          config.data = params;
          config.params = undefined;
        }
      } else {
        // 兼容restful风格
        config.url += params;
        config.params = undefined;
      }
      return config;
    },

    /** @description: 请求拦截器处理 */
    requestInterceptors: config => {
      return config;
    },

    /**
     * @description: 响应拦截器处理
     */
    responseInterceptors: (res: AxiosResponse<any>) => {
      const contentType = res.headers['content-type'];
      if (contentType.indexOf('application/octet-stream') > -1) {
        //根据响应头获取文件名称
        let fileName = res.headers['content-disposition'].match(/filename=(.*)/)[1]
        if (fileName) {
            fileName = decodeURI(fileName)
        } else {
            //此处表示后台没有设置响应头 content-disposition,请根据业务场景自行处理
            fileName = "download.txt"
        }
        const blob = new Blob([res.data], { type: 'application/octet-stream' })
        if (typeof (window.navigator as any).msSaveBlob !== 'undefined') {
          (window.navigator as any).msSaveBlob(blob, fileName)
        } else {
            const blobURL = window.URL.createObjectURL(blob)
            const tempLink = document.createElement('a')
            tempLink.style.display = 'none'
            tempLink.href = blobURL
            tempLink.setAttribute('download', fileName)
            if (typeof tempLink.download === 'undefined') {
                tempLink.setAttribute('target', '_blank')
            }
            document.body.appendChild(tempLink)
            tempLink.click()
            document.body.removeChild(tempLink)
            window.URL.revokeObjectURL(blobURL)
        }
      }
      return res;
    },

    /** @description: 响应错误处理 */
    responseInterceptorsCatch: (_: AxiosInstance, error: any) => {
      const { response, code, message, config } = error || {};
      const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none';
      const msg: string = response?.data?.error?.message ?? '';
      const err: string = error?.toString?.() ?? '';
      let errMessage = '';

      try {
        if (code === 'ECONNABORTED' && message.includes('timeout')) {
          errMessage = '请求超时';
        }
        if (err?.includes('Network Error')) {
          errMessage = '忘了错误';
        }

        if (errMessage) {
          if (errorMessageMode === 'modal') {
            Modal.error({
              title: '接口错误',
              content: errMessage
            });
          } else if (errorMessageMode === 'message') {
            message.error(errMessage);
          }
          return Promise.reject(error);
        }
      } catch {
        throw new Error(error as unknown as string);
      }

      if (error?.response?.status === 401) {
        
      }

      return checkStatus(error?.response?.status, msg, errorMessageMode);
    }

  };

  return new VAxios(
    // 深度合并
    deepMerge(
      {
        timeout: 30 * 1000,
        // 基础接口地址
        baseURL: API_BASE_URl,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        transform: clone(transform),
        requestOptions: {
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: true,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: 'message',
          // 忽略重复请求
          ignoreCancelToken: true
        }
      },
      opt || {}
    )
  );
}

export const defHttp = createAxios();
