import { default as  withInstall } from '../utils';
import DevTools from './DevTools.vue';

const TDevTools = withInstall(DevTools)
export {
    DevTools as TDevTools
}
export default TDevTools