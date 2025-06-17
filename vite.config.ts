import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import dts from 'vite-plugin-dts';
import Inspect from 'vite-plugin-inspect';
import UnoCSS from 'unocss/vite'
import ddkjTools from 'vite-plugin-ddkj-tools';
// import {ddkjDevTools} from './src/index'

export default defineConfig((configEnv) => {
  const isBuild = configEnv.command === 'build';
  const plugins = [vue(), ...UnoCSS()];
  const {ddkjDevTools } = ddkjTools
  if (isBuild) {
    plugins.push(dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.app.json',
      outDir: ['dist']
    }));
  } else {
    plugins.push(
      Inspect(),
      ddkjDevTools(1)
    );
  }

  return {
    resolve: {
      alias: {
        "~": path.resolve(__dirname, ''),
        "@": path.resolve(__dirname, "./src")
      }
    },

    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "${path.resolve(__dirname, 'src/client/assets/styles/global.less')}";`
        }
      }
    },

    // build
    build: {
      target: 'modules',
      //打包文件目录
      outDir: "dist",
      //压缩
      minify: false,
      // css分离
      // cssCodeSplit: true,
      lib: {
        entry: path.resolve(__dirname, './src/index.ts'), // 设置入口文件
        name: 'vite-plugin-ddkj-tools', // 起个名字，安装、引入用
        // fileName: (format) => `${format}.js`, // 打包后的文件名
      },
      sourcemap: true, // 输出.map文件
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: ['vue', 'unocss', 'ant-design-vue'],
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
      ...plugins,
    ],
  };
})
