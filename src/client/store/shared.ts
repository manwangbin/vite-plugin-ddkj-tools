import Application from "../api/modal/application";
import { Auth } from "../typings/auth";


/** Get token */
export function getToken() {
  return sessionStorage.getItem('ddkjDesignToken') || '';
}

/** Get user info */
export function getUserInfo() {
  const emptyInfo: Auth.AccountInfo = { account: '', name: '', avatar: '', state: '' };
  const storeUser = sessionStorage.getItem('ddkjDesignUserInfo');
  if (!storeUser) {
    return emptyInfo;
  }
  return JSON.parse(storeUser) as Auth.AccountInfo;
}

export function getApp() {
  const storeApp= sessionStorage.getItem('ddkjDesignApp');
  if (!storeApp) {
    return undefined;
  } else {
    return JSON.parse(storeApp) as Application;
  }
}

/** Clear auth storage */
export function clearAuthStorage() {
  sessionStorage.remove('ddkjDesignToken');
  sessionStorage.remove('ddkjDesignUserInfo');
}
