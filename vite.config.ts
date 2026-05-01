import { defineConfig } from "vite"
import preact from "@preact/preset-vite"

/**
 * Vite 配置文件
 * 
 * 配置说明：
 * - 使用 @preact/preset-vite 插件支持 Preact
 * - 开发服务器配置：端口、代理等
 * - 构建配置：输出目录、代码分割等
 * 
 * 跨域解决方案（开发环境）：
 * 如果 API 存在 CORS 限制，可以取消下面的 proxy 配置注释
 * 通过 Vite 开发服务器代理请求
 */
export default defineConfig({
  // GitHub Pages 部署在子路径下，需要设置 base
  // 格式：/仓库名/，例如 /today-hot-list/
  // 使用环境变量允许本地开发时设置为 '/'
  base: process.env.GITHUB_PAGES === "true" ? "/ai-today-hot-list/" : "/",
  plugins: [preact()],
  server: {
    port: 3000,
    host: true, // 允许局域网访问，方便手机测试
    proxy: {
      "/dailyhotapi": {
        target: "http://localhost:6688",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dailyhotapi/, ""),
      },
    },
    // 跨域代理配置（可选）
    // proxy: {
    //   '/api': {
    //     target: 'https://apis.uctb.cn',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // 代码分割配置，优化加载性能
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 vendor 代码单独打包
          vendor: ["preact", "preact/hooks"],
        },
      },
    },
  },
})
