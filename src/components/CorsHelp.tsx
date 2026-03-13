import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { AlertTriangle, Chrome, Globe } from "lucide-react"
import { Button } from "./ui/button"

/**
 * CorsHelp 组件
 * 当检测到 CORS 错误时显示的帮助信息
 * 
 * 移动端适配：
 * - 使用卡片布局，清晰展示解决方案
 * - 提供浏览器插件和代理两种方案
 */
interface CorsHelpProps {
  onRetry?: () => void
}

export function CorsHelp({ onRetry }: CorsHelpProps) {
  return (
    <div className="p-4">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-800">跨域访问受限</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-orange-700">
            由于浏览器的安全策略，无法直接访问 API。请尝试以下解决方案：
          </p>

          {/* 方案一：浏览器插件 */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Chrome className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium text-foreground">方案一：安装 CORS 插件</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              安装浏览器扩展来允许跨域请求，推荐以下插件：
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <a
                  href="https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Allow CORS (Chrome/Edge)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <a
                  href="https://addons.mozilla.org/zh-CN/firefox/addon/access-control-allow-origin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  CORS Everywhere (Firefox)
                </a>
              </li>
            </ul>
          </div>

          {/* 方案二：代理服务器 */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-green-600" />
              <h3 className="font-medium text-foreground">方案二：使用代理服务器</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              在 vite.config.ts 中配置代理（开发环境）：
            </p>
            <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs text-gray-700">
{`server: {
  proxy: {
    '/api': {
      target: 'https://apis.uctb.cn',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}`}
            </pre>
          </div>

          {/* 重试按钮 */}
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              重试
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
