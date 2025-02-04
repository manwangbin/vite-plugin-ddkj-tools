import type { AppRouteRecordRaw } from 'vue-router';

declare namespace Auth {
  interface LoginToken {
    tokenType: string; // 认证类别
    token: string; // 访问token，访问api需要带到Auth
    expiresIn: number; // 超时时间
  }

  interface AccountInfo {
    account: string;
    avatar: string;
    name: string;
    state: string;
  }
}
