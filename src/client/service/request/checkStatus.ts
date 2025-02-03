import type { ErrorMessageMode } from '@sa/axios/type';
import { Modal, message } from 'ant-design-vue';
import { $t } from '@/locales';

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
      errMessage = $t('api.errMsg401');
      break;

    case 403:
      errMessage = $t('api.errMsg403');
      break;
    // 404请求不存在
    case 404:
      errMessage = $t('api.errMsg404');
      break;

    case 405:
      errMessage = $t('api.errMsg405');
      break;

    case 408:
      errMessage = $t('api.errMsg408');
      break;

    case 500:
      errMessage = $t('api.errMsg500');
      break;

    case 501:
      errMessage = $t('api.errMsg501');
      break;

    case 502:
      errMessage = $t('api.errMsg502');
      break;

    case 503:
      errMessage = $t('api.errMsg503');
      break;

    case 504:
      errMessage = $t('api.errMsg504');
      break;

    case 505:
      errMessage = $t('api.errMsg505');
      break;

    default:
  }

  if (errMessage) {
    if (errorMessageMode === 'modal') {
      Modal.error({
        title: $t('api.errorTip'),
        content: errMessage
      });
    } else if (errorMessageMode === 'message') {
      message.error(errMessage);
    }
  }

  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject({ code: status, msg: errMessage });
}
