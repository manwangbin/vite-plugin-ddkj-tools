import ddkjDevTools from './ddkj-dev-tools';
import DevTools, { VDevTools } from './dev-tools';
import { App, Plugin } from 'vue';

export { ddkjDevTools, VDevTools }

const components = [DevTools];
export default {
    install: (app: App) => {
        components.forEach((component) => {
            app.use(component);
        });
    },
} as Plugin;

