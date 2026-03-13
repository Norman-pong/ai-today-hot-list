# Today Hot List - Agent 指南

## 项目概述

今日热榜（Today Hot List）是一个 React/Preact + TypeScript + Vite + Tailwind CSS 构建的热榜聚合应用，展示各大平台的热门内容。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Preact | 10.29.0 | UI 框架（React 兼容） |
| React | 19.2.4 | 类型定义兼容 |
| TypeScript | 5.9.3 | 类型系统 |
| Vite | 7.3.1 | 构建工具 |
| Tailwind CSS | 3.4.19 | CSS 框架 |
| class-variance-authority | - | 组件变体管理 |

## 包管理器

**使用 pnpm**

```bash
# 安装依赖
pnpm install

# 开发服务器
pnpm run dev

# 生产构建
pnpm run build

# 预览构建
pnpm run preview
```

## npm 代理配置

```bash
npm config set registry https://registry.npmmirror.com
```

当前代理：`https://registry.npmmirror.com`

## 项目结构

```
today-hot-list/
├── src/
│   ├── app.tsx              # 主应用组件
│   ├── main.tsx             # 入口文件
│   ├── index.css            # 全局样式
│   ├── components/          # 组件目录
│   │   ├── Header.tsx       # 顶部标题栏
│   │   ├── ProviderGrid.tsx # 供应商网格（首页）
│   │   ├── HotList.tsx      # 热榜详情页
│   │   ├── CorsHelp.tsx     # CORS 错误帮助
│   │   └── ui/              # UI 基础组件
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── skeleton.tsx
│   │       └── toast.tsx
│   ├── lib/
│   │   ├── api.ts           # API 调用层
│   │   └── utils.ts         # 工具函数
│   └── types/
│       └── index.ts         # 类型定义
├── public/                  # 静态资源
├── index.html
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── tailwind.config.js       # Tailwind 配置
└── package.json
```

## 开发服务器

```bash
pnpm run dev
```

- 本地地址：http://localhost:3000
- 局域网访问：自动检测本机 IP

## 构建

```bash
# TypeScript 编译 + Vite 构建
pnpm run build

# 输出目录：dist/
```

## API 接口

**基础 URL**: `https://apis.uctb.cn/api/dailyhot`

### 获取供应商列表

```
GET /
```

响应格式：
```typescript
{
  code: number
  msg: string
  data: {
    platforms: string[]  // 平台名称列表
    total: number
  }
}
```

### 获取热榜数据

```
GET ?title={平台名称}
```

## 重要注意事项

### 1. TypeScript 配置

`tsconfig.json` 必须包含 JSX 配置：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

### 2. React vs Preact

- 项目使用 Preact 作为运行时
- 类型定义使用 `preact/compat` 而非 `React` 命名空间
- 例如：`HTMLAttributes<HTMLButtonElement>` 从 `preact/compat` 导入

### 3. API 数据处理

供应商列表 API 返回的是字符串数组，需要转换为 `Provider` 对象：

```typescript
// API 返回
data.platforms: ["微博", "知乎", "抖音", ...]

// 转换为 Provider[]
platforms.map(name => ({ title: name, name: name }))
```

### 4. CORS 问题

API 可能存在跨域限制，应用已内置 CORS 错误检测和处理：
- 自动检测 `TypeError: Failed to fetch`
- 显示 CORS 帮助页面引导用户安装浏览器插件

### 5. 移动端适配

- 使用 Tailwind 的响应式前缀（`sm:`, `md:`, `lg:`）
- 触摸优化：`touch-manipulation`, `min-h-11`, `min-w-11`
- 安全区域：`env(safe-area-inset-*)`
- 下拉刷新手势支持

## 常用命令

```bash
# 开发
pnpm run dev

# 构建
pnpm run build

# 预览生产构建
pnpm run preview
```

## 故障排除

### TypeScript 错误：JSX element implicitly has type 'any'

检查 `tsconfig.json` 是否配置了正确的 `jsx` 和 `jsxImportSource`。

### 构建错误：Cannot find namespace 'React'

将 `React.HTMLAttributes` 改为从 `preact/compat` 导入的 `HTMLAttributes`。

### 运行时错误：providers.map is not a function

检查 API 响应格式，确保将 `data.platforms` 转换为 `Provider[]`。
