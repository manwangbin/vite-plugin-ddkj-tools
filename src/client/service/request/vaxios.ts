import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { cloneDeep } from 'lodash-es';
import { isFunction } from '@/client/utils/is';
import qs from 'qs';
import type { CreateAxiosOptions } from './axiosTransform';
import type { RequestOptions, ResultData, UploadFileParams } from './type';
import { AxiosCanceler } from './axiosCancel';

export * from './axiosTransform';

/** @description: Request result set */
export enum ResultEnum {
  SUCCESS = 0,
  ERROR = -1,
  TIMEOUT = 401,
  TYPE = 'success'
}

/** @description: request method */
export enum RequestEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

/** @description: contentType */
export enum ContentTypeEnum {
  // json
  JSON = 'application/json;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data  upload
  FORM_DATA = 'multipart/form-data;charset=UTF-8'
}

/** @description: axios module */
export class VAxios {
  private axiosInstance: AxiosInstance;
  private readonly options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    this.setupInterceptors();
  }

  /** @description: Interceptor configuration 拦截器配置 */
  private setupInterceptors() {
    const { transform } = this.options;
    if (!transform) {
      return;
    }

    const { requestInterceptors, requestInterceptorsCatch, responseInterceptors, responseInterceptorsCatch } =
      transform;

    const axiosCanceler = new AxiosCanceler();
    this.axiosInstance.interceptors.request.use(config => {
      // If cancel repeat request is turned on, then cancel repeat request is prohibited
      const { ignoreCancelToken } = (config as any).requestOptions;
      const ignoreCancel =
        ignoreCancelToken !== undefined ? ignoreCancelToken : this.options.requestOptions?.ignoreCancelToken;

      !ignoreCancel && axiosCanceler.addPending(config);
      if (requestInterceptors && isFunction(requestInterceptors)) {
        return requestInterceptors(config, this.options);
      }
      return config;
    }, undefined);

    // Request interceptor error capture
    requestInterceptorsCatch &&
      isFunction(requestInterceptorsCatch) &&
      this.axiosInstance.interceptors.request.use(undefined, requestInterceptorsCatch);

    // Response result interceptor processing
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      res && axiosCanceler.removePending(res.config);
      if (responseInterceptors && isFunction(responseInterceptors)) {
        return responseInterceptors(res);
      }
      return res;
    }, undefined);

    // Response result interceptor error capture
    responseInterceptorsCatch &&
      isFunction(responseInterceptorsCatch) &&
      this.axiosInstance.interceptors.response.use(undefined, error => {
        return responseInterceptorsCatch(this.axiosInstance, error);
      });
  }

  /** @description: File Upload */
  uploadFile<T = any>(config: AxiosRequestConfig, params: UploadFileParams) {
    const formData = new window.FormData();
    const customFilename = params.name || 'file';

    if (params.data) {
      Object.keys(params.data).forEach(key => {
        const value = params.data![key];
        if (Array.isArray(value)) {
          value.forEach(item => {
            formData.append(`${key}[]`, item);
          });
          return;
        }

        formData.append(key, params.data![key]);
      });
    }

    if (params.filename) {
      formData.append(customFilename, params.file);
    } else {
      formData.append(customFilename, params.file);
    }

    return this.axiosInstance.request<T>({
      ...config,
      method: 'POST',
      data: formData,
      headers: {
        'Content-type': ContentTypeEnum.FORM_DATA,
        ignoreCancelToken: true
      }
    });
  }

  download<T = any>(config: AxiosRequestConfig, params: UploadFileParams) {
    return this.axiosInstance.request<T>({
      ...config,
    });
  }

  supportFormData(config: AxiosRequestConfig) {
    const headers = config.headers || this.options.headers;
    const contentType = headers?.['Content-Type'] || headers?.['content-type'];

    if (
      contentType !== ContentTypeEnum.FORM_URLENCODED ||
      !Reflect.has(config, 'data') ||
      config.method?.toUpperCase() === RequestEnum.GET
    ) {
      return config;
    }

    return {
      ...config,
      data: qs.stringify(config.data, { arrayFormat: 'brackets' })
    };
  }

  get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options);
  }

  request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    let conf: CreateAxiosOptions = cloneDeep(config);
    if (conf.url && (conf.url.startsWith('http://') || conf.url.startsWith('https://'))) {
      return new Promise((resolve, reject) => {
        this.axiosInstance
          .request<any, AxiosResponse<ResultData>>(conf)
          .then((res: AxiosResponse<ResultData>) => {
            resolve(res as unknown as Promise<T>);
          })
          .catch((e: Error | AxiosError) => {
            reject(e);
          });
      });

    } else {
      const { requestOptions } = this.options;
      const opt: RequestOptions = { ...requestOptions, ...options };
      const transform = this.options.transform;

      const { beforeRequestHook, requestCatchHook, transformResponseHook } = transform || {};
      if (beforeRequestHook && isFunction(beforeRequestHook)) {
        conf = beforeRequestHook(conf, opt);
      }
      conf.requestOptions = opt;
      conf = this.supportFormData(conf);

      return new Promise((resolve, reject) => {
        this.axiosInstance
          .request<any, AxiosResponse<ResultData>>(conf)
          .then((res: AxiosResponse<ResultData>) => {
            if (conf.responseType !== 'blob' && transformResponseHook && isFunction(transformResponseHook)) {
              try {
                const ret = transformResponseHook(res, opt);
                resolve(ret);
              } catch (err) {
                reject(err || new Error('request error!'));
              }
            } else {
              resolve(res as unknown as Promise<T>);
            }
          })
          .catch((e: Error | AxiosError) => {
            if (requestCatchHook && isFunction(requestCatchHook)) {
              reject(requestCatchHook(e, opt));
              return;
            }
            if (axios.isAxiosError(e)) {
              // rewrite error message from axios in here
            }
            reject(e);
          });
      });
    }
  }
}

export type * from './type';
