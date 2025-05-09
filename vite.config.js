import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve("./src") // 相对路径别名配置，使用 @ 代替 src
    }
  },
  server: {
    proxy: {
      // 以 /api 开头的请求都将被转发到后端服务器
      '/api': {
        target: 'http://localhost:8090',  // 后端服务器地址
        changeOrigin: true,  // 解决跨域问题
        rewrite: (path) => path.replace(/^\/api/, ''),  // 去掉路径中的 /api 前缀
      }
    }
  },
})
