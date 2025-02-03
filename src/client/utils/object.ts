import { isObject } from './is';

// 深度合并
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    if (isObject(src[key])) {
      src[key] = deepMerge(src[key], target[key]);
    } else {
      src[key] = target[key];
    }
  }
  return src;
}
