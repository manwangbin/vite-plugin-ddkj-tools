import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import 'virtual:uno.css'
import 'ant-design-vue/dist/reset.css';
import antDesign from 'ant-design-vue';

createApp(App).use(antDesign).mount('#app')
