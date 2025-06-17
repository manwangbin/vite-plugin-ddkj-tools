import { default as  withInstall } from '../utils';
// import DevTools from './DevTools.vue';
import Ide from './ide.vue';

const TIde = withInstall(Ide)
export {
    Ide as TDevTools
}
export default TIde