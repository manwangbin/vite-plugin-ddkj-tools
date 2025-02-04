import type { ErrorMessageMode } from './type';
import { Modal, message } from 'ant-design-vue';

export function checkStatus(status: number, msg: string, errorMessageMode: ErrorMessageMode = 'message') {
  let errMessage = '';

  switch (status) {
    case 400:
      errMessage = `${msg}`;
      break;
    // 401: Not logged in
    // Jump to the login page if not logged in, and carry the path of the current page
    // Return to the current page after successful login. This step needs to be operated on the login page.
    case 401:
      errMessage = '无权访问401';
      break;

    case 403:
      errMessage = '无权访问403';
      break;
    // 404请求不存在
    case 404:
      errMessage = '页面不存在404';
      break;

    case 405:
      errMessage = '405';
      break;

    case 408:
      errMessage = '408';
      break;

    case 500:
      errMessage = '服务器错误500';
      break;

    case 501:
      errMessage = '服务器错误501';
      break;

    case 502:
      errMessage = '服务器错误502';
      break;

    case 503:
      errMessage = '服务器错误503';
      break;

    case 504:
      errMessage = '服务器错误504';
      break;

    case 505:
      errMessage = '服务器错误505';
      break;

    default:
  }

  if (errMessage) {
    if (errorMessageMode === 'modal') {
      Modal.error({
        title: '错误',
        content: errMessage
      });
    } else if (errorMessageMode === 'message') {
      message.error(errMessage);
    }
  }

  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject({ code: status, msg: errMessage });
}
