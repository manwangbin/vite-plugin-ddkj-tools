import { default as  withInstall } from '@/utils';
import DevTools from './DevTools.vue';

const VDevTools = withInstall(DevTools)
export {
    DevTools as VDevTools
}
export default VDevTools