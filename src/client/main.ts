import { App } from "vue";
import { createPinia } from 'pinia';

export default function registDdkjByApp(app: App<Element>) {
    const store = createPinia();
    app.use(store);
}