import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {ddkjDevTools} from './src/vite-plugin-ddkj-dev-tools';
export default defineConfig({
  plugins: [

    ddkjDevTools(),
    vue()
  ],
})
