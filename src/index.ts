import ddkjDevTools from './ddkj';
import DevTools, { TDevTools } from './dev-tools';
import { App, Plugin } from 'vue';

export { ddkjDevTools, TDevTools }

const components = [DevTools];
export default {
    install: (app: App) => {
        components.forEach((component) => {
            app.use(component);
        });
    },
} as Plugin;

