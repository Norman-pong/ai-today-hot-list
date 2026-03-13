# 今日热榜

一个基于 Vite + Preact + Tailwind CSS 构建的移动端优先热榜展示应用。

## 功能特性

- 📱 **移动端优先**：完美适配 iOS/Android，支持刘海屏安全区域
- 🔄 **下拉刷新**：支持下拉手势刷新热榜数据
- 🎨 **现代 UI**：卡片式布局，清晰的视觉层次
- ⚡ **快速加载**：骨架屏加载效果，流畅的用户体验
- 🔗 **一键跳转**：点击热榜条目在新标签页打开原链接
- 🛡️ **错误处理**：完善的错误提示，包括 CORS 跨域问题解决方案

## 技术栈

- **框架**：[Preact](https://preactjs.com/) - React 的轻量级替代方案
- **构建工具**：[Vite](https://vitejs.dev/) - 极速的前端构建工具
- **样式**：[Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **组件**：[shadcn/ui](https://ui.shadcn.com/) - 可复用的组件库
- **图标**：[Lucide React](https://lucide.dev/) - 精美的图标库

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动，支持局域网访问，方便手机测试。

### 构建生产版本

```bash
npm run build
```

构建后的文件位于 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

## API 说明

应用使用 [DailyHot API](https://apis.uctb.cn/api/dailyhot) 获取热榜数据。

### 接口规范

- **获取供应商列表**：`GET https://apis.uctb.cn/api/dailyhot`
- **获取热榜详情**：`GET https://apis.uctb.cn/api/dailyhot?title={供应商标题}`

## 跨域问题解决方案

由于浏览器的同源策略，直接访问 API 可能会遇到 CORS 跨域错误。以下是几种解决方案：

### 方案一：安装浏览器插件（推荐）

安装 CORS 浏览器扩展来临时允许跨域请求：

- **Chrome/Edge**：[Allow CORS](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)
- **Firefox**：[CORS Everywhere](https://addons.mozilla.org/zh-CN/firefox/addon/access-control-allow-origin/)

安装后启用插件即可正常访问。

### 方案二：配置 Vite 代理（开发环境）

在 `vite.config.ts` 中取消代理配置的注释：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://apis.uctb.cn',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

同时修改 `src/lib/api.ts` 中的 `API_BASE_URL`：

```typescript
const API_BASE_URL = "/api/api/dailyhot"
```

### 方案三：使用代理服务器（生产环境）

在生产环境中，可以通过 Nginx 或其他反向代理服务器转发请求：

```nginx
location /api/ {
    proxy_pass https://apis.uctb.cn/;
    proxy_set_header Host apis.uctb.cn;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 项目结构

```
today-hot-list/
├── src/
│   ├── components/          # 组件目录
│   │   ├── ui/             # 基础 UI 组件
│   │   │   ├── button.tsx  # 按钮组件
│   │   │   ├── card.tsx    # 卡片组件
│   │   │   ├── skeleton.tsx # 骨架屏组件
│   │   │   └── toast.tsx   # 提示组件
│   │   ├── CorsHelp.tsx    # CORS 帮助组件
│   │   ├── Header.tsx      # 顶部标题栏
│   │   ├── HotList.tsx     # 热榜列表组件
│   │   └── ProviderGrid.tsx # 供应商网格组件
│   ├── lib/                # 工具库
│   │   ├── api.ts          # API 服务
│   │   └── utils.ts        # 工具函数
│   ├── app.tsx             # 应用主组件
│   ├── main.tsx            # 应用入口
│   └── style.css           # 全局样式
├── index.html              # HTML 模板
├── tailwind.config.js      # Tailwind 配置
├── vite.config.ts          # Vite 配置
└── package.json            # 项目配置
```

## 移动端适配说明

### 视口配置

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

- `viewport-fit=cover`：支持 iPhone X+ 刘海屏安全区域

### 安全区域适配

使用 CSS `env()` 函数适配刘海屏：

```css
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 触摸优化

- 增大触摸区域（min-h-11 min-w-11）
- 添加 `touch-manipulation` 防止双击缩放
- 使用 `active:scale-95` 提供点击反馈

### 响应式布局

- 供应商网格：3 列（移动端）→ 6 列（桌面端）
- 热榜列表：单列卡片布局，自适应宽度

## 开发注意事项

1. **类型安全**：项目使用 TypeScript，确保所有组件和 API 都有正确的类型定义
2. **性能优化**：使用 `useCallback` 和 `useMemo` 优化重渲染
3. **错误处理**：所有 API 请求都有完善的错误处理和用户提示
4. **可访问性**：组件支持键盘导航和屏幕阅读器

## 许可证

MIT
