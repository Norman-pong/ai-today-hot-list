import { useState, useEffect } from "preact/hooks"
import { getProviders, type Provider, ApiError } from "../lib/api"
import { Card, CardContent } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { Toast } from "./ui/toast"
import { cn } from "../lib/utils"
import { useTheme } from "../contexts/ThemeContext"

/**
 * ProviderGrid 组件属性
 */
interface ProviderGridProps {
  /** 选择供应商时的回调 */
  onSelectProvider: (provider: Provider) => void
  /** providers 加载完成后的回调（用于 URL 路由初始化） */
  onProvidersLoaded?: (providers: Provider[]) => void
}

/**
 * 供应商图标映射
 * 为常见供应商提供 emoji 图标作为后备方案
 */
const providerIcons: Record<string, string> = {
  微博: "📱",
  百度: "🔍",
  知乎: "❓",
  抖音: "🎵",
  哔哩哔哩: "📺",
  B站: "📺",
  微信: "💬",
  今日头条: "📰",
  腾讯新闻: "📰",
  网易新闻: "📰",
  新浪新闻: "📰",
  搜狐: "🦊",
  "36氪": "💼",
  虎嗅: "🐯",
  掘金: "⛏️",
  GitHub: "🐙",
  淘宝: "🛒",
  京东: "📦",
  拼多多: "🛍️",
  小红书: "📕",
  快手: "🎬",
  斗鱼: "🐟",
  虎牙: "🐯",
  网易云音乐: "🎧",
  QQ音乐: "🎵",
  酷狗音乐: "🐕",
  酷我音乐: "🎼",
}

/**
 * ProviderGrid 组件
 * 展示所有可用的供应商列表，以网格形式呈现
 * 
 * 移动端适配：
 * - 使用 3 列网格布局，在手机上显示更多内容
 * - 增大触摸区域（min-h-24），确保可点击性
 * - 添加适当的间距和阴影，提升视觉层次
 * - 支持深色/浅色主题
 */
export function ProviderGrid({
  onSelectProvider,
  onProvidersLoaded,
}: ProviderGridProps) {
  const { isDark } = useTheme()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * 加载供应商列表
   */
  const loadProviders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProviders()
      setProviders(data)
      // 通知父组件 providers 已加载
      onProvidersLoaded?.(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("加载供应商列表失败")
      }
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadProviders()
  }, [])

  /**
   * 获取供应商图标
   * 优先使用 API 返回的图标，否则使用预设的 emoji
   */
  const getProviderIcon = (provider: Provider): string => {
    if (provider.icon) return provider.icon
    return providerIcons[provider.name] || "📊"
  }

  // 加载状态：显示骨架屏
  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className={cn(
          "mb-4 h-8 w-32",
          isDark ? "bg-slate-800" : "bg-gray-200"
        )} />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className={cn(
              "h-24 w-full rounded-xl",
              isDark ? "bg-slate-800" : "bg-gray-200"
            )} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* 标题 */}
      <h2 className={cn(
        "mb-4 text-lg font-semibold",
        isDark ? "text-white" : "text-gray-900"
      )}>
        选择平台
      </h2>

      {/* 供应商网格 */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {providers.map((provider) => (
          <Card
            key={provider.title}
            className={cn(
              "cursor-pointer transition-all duration-200 touch-manipulation",
              "hover:shadow-md active:scale-95",
              isDark
                ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                : "bg-white border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onSelectProvider(provider)}
          >
            <CardContent className="flex min-h-24 flex-col items-center justify-center p-3">
              <span className="mb-2 text-3xl" role="img" aria-label={provider.name}>
                {getProviderIcon(provider)}
              </span>
              <span className={cn(
                "text-center text-xs font-medium line-clamp-2",
                isDark ? "text-slate-200" : "text-gray-900"
              )}>
                {provider.name}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  )
}
