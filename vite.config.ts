import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import path from 'path';

function pathResolve (dir: string) {
  return resolve(process.cwd(), '.', dir)
}

export default defineConfig({
  resolve: {
    alias: [
      { find: /^~/, replacement: resolve(__dirname, '') },
      {
        find: /^@\//,
        replacement: `${pathResolve('src')}/`
      }
    ]
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'), // 设置入口文件
      name: 'vite-plugin-ddkj-tools', // 起个名字，安装、引入用
      fileName: (format) => `vite-plugin-ddkj-tools.${format}.js`, // 打包后的文件名
    },
    sourcemap: true, // 输出.map文件
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'ant-design-vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          'ant-design-vue': 'ant-design-vue'
        }
      }
    }
  },
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.app.json',
      outDir: 'dist'
    })
  ],
})
