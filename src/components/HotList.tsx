import { useState, useEffect, useRef, useCallback } from "preact/hooks"
import { getHotListByProvider, type HotItem, type Provider, ApiError } from "../lib/api"
import { Card, CardContent } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { Toast } from "./ui/toast"
import { cn } from "../lib/utils"
import { Flame, ExternalLink, RefreshCw, ChevronLeft } from "lucide-react"
import { Button } from "./ui/button"

/**
 * HotList 组件属性
 */
interface HotListProps {
  provider: Provider
  /** 返回供应商列表的回调 */
  onBack: () => void
}

/**
 * 排名颜色映射
 * 前 3 名使用特殊颜色标识
 */
const rankColors: Record<number, string> = {
  1: "bg-red-500 text-white",
  2: "bg-orange-500 text-white",
  3: "bg-yellow-500 text-white",
}

/**
 * HotList 组件
 * 展示指定供应商的热榜数据，支持下拉刷新
 * 
 * 移动端适配：
 * - 使用列表布局，每条热榜项为卡片形式
 * - 排名使用圆形徽章，前 3 名特殊颜色标识
 * - 支持下拉刷新手势
 * - 点击热榜项在新标签页打开链接
 */
export function HotList({ provider, onBack }: HotListProps) {
  const [hotList, setHotList] = useState<HotItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // 下拉刷新相关状态
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  /**
   * 加载热榜数据
   */
  const loadHotList = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)
    try {
      const data = await getHotListByProvider(provider)
      setHotList(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("加载热榜数据失败")
      }
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [provider])

  // 组件挂载或供应商变化时加载数据
  useEffect(() => {
    loadHotList()
  }, [loadHotList])

  /**
   * 刷新数据
   */
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadHotList(false)
    setRefreshing(false)
    setPullDistance(0)
    setIsPulling(false)
  }

  /**
   * 下拉刷新手势处理
   * 仅在滚动到顶部时触发
   */
  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling) return

    const touchY = e.touches[0].clientY
    const diff = touchY - touchStartY.current

    // 限制最大下拉距离为 100px
    if (diff > 0 && diff < 150) {
      setPullDistance(diff * 0.5) // 添加阻尼效果
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      // 下拉超过阈值，触发刷新
      handleRefresh()
    } else {
      // 未达到阈值，回弹
      setPullDistance(0)
    }
    setIsPulling(false)
  }

  // 绑定触摸事件
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchmove", handleTouchMove, { passive: true })
    container.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isPulling, pullDistance])

  /**
   * 打开热榜链接
   * 优先使用 mobileUrl（移动端链接），否则使用 url
   */
  const openLink = (item: HotItem) => {
    const url = item.mobileUrl || item.url
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  /**
   * 格式化热度值
   * 将数字转换为易读的格式（如 1.2w）
   */
  const formatHot = (hot: string | number | undefined): string => {
    if (!hot) return ""
    const num = typeof hot === "string" ? parseFloat(hot) : hot
    if (isNaN(num)) return String(hot)
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "w"
    }
    return String(hot)
  }

  // 加载状态：显示骨架屏
  if (loading) {
    return (
      <div className="p-4">
        {/* 头部骨架 */}
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        {/* 列表骨架 */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* 固定头部 */}
      <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="flex-1 text-lg font-semibold text-foreground">
            {provider.title}热榜
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(refreshing && "animate-spin")}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 下拉刷新指示器 */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw
            className={cn(
              "h-4 w-4",
              pullDistance > 60 && "animate-spin"
            )}
          />
          <span>{pullDistance > 60 ? "释放刷新" : "下拉刷新"}</span>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hide p-4"
      >
        {/* 热榜列表 */}
        <div className="space-y-3">
          {hotList.map((item, index) => {
            const rank = index + 1
            const rankClass = rankColors[rank] || "bg-muted text-muted-foreground"

            return (
              <Card
                key={index}
                className="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] touch-manipulation"
                onClick={() => openLink(item)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  {/* 排名徽章 */}
                  <div
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      rankClass
                    )}
                  >
                    {rank}
                  </div>

                  {/* 内容区域 */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2">
                      {item.title}
                    </h3>
                    {item.desc && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {item.desc}
                      </p>
                    )}
                    {/* 热度值 */}
                    {item.hot && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-orange-500">
                        <Flame className="h-3 w-3" />
                        <span>{formatHot(item.hot)}</span>
                      </div>
                    )}
                  </div>

                  {/* 外部链接图标 */}
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          已显示全部 {hotList.length} 条热榜
        </div>
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
