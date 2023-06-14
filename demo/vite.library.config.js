import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: '../json-tree-view/dist',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, '../json-tree-view/index.js'),
      name: 'SimpleJsonTreeView',
      // the proper extensions will be added
      fileName: 'SimpleJsonTreeView'
    },
    rollupOptions: {
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'SimpleJsonTreeView'
        }
      }
    }
  }
})
