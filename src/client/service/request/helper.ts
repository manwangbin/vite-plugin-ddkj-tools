import { isObject, isString } from '@sa/utils';
import { md5 } from 'js-md5';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function joinTimestamp<T extends boolean>(join: boolean, restful: T): T extends true ? string : object;

export function joinTimestamp(join: boolean, restful = false): string | object {
  if (!join) {
    return restful ? '' : {};
  }
  const now = new Date().getTime();
  if (restful) {
    return `?_t=${now}`;
  }
  return { _t: now };
}

/** @description: Format request parameter time */
export function formatRequestDate(params: Recordable) {
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return;
  }

  // eslint-disable-next-line guard-for-in
  for (const key in params) {
    const format = params[key]?.format ?? null;
    if (format && typeof format === 'function') {
      params[key] = params[key].format(DATE_TIME_FORMAT);
    }

    if (isString(key)) {
      const value = params[key];
      if (value) {
        try {
          params[key] = isString(value) ? value.trim() : value;
        } catch (error: any) {
          throw new Error(error);
        }
      }
    }

    if (isObject(params[key])) {
      formatRequestDate(params[key]);
    }
  }
}

export function createParamSign(param: any, time: number, salt: string): string {
  const signParams = { ...(param || {}) };
  signParams.time = time;

  const keys = Object.keys(signParams).sort((o1, o2) => (o1 > o2 ? 1 : -1));
  let signOrg = '';
  keys.forEach(key => {
    if (signParams[key] !== null && signParams[key] !== undefined) {
      const paramValue = signParams[key];
      if (typeof paramValue === 'object') {
        signOrg += `${key}=${JSON.stringify(paramValue)}&`;
      } else {
        signOrg += `${key}=${paramValue}&`;
      }
    }
  });

  signOrg += salt;
  return md5(signOrg);
}
