import { useState, useEffect, useRef, useCallback } from "preact/hooks"
import { getHotList, type HotItem, ApiError } from "../lib/api"
import { cn } from "../lib/utils"
import { Flame } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"

/**
 * 时间线热榜项
 */
interface TimelineItem {
  id: string
  time: string
  title: string
  desc?: string
  hot: number
  url: string
  mobileUrl?: string
}

/**
 * TimelineHotList 组件属性
 */
interface TimelineHotListProps {
  /** 当前选中的供应商标题 */
  providerTitle: string
  /** 返回供应商列表的回调 */
  onBack: () => void
}

/**
 * 生成模拟时间
 * 根据索引生成递减的时间（每5分钟一条）
 */
function generateTime(index: number): string {
  const now = new Date()
  const time = new Date(now.getTime() - index * 5 * 60 * 1000)
  const hours = time.getHours().toString().padStart(2, "0")
  const minutes = time.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * 格式化热度值
 */
function formatHot(hot: number): string {
  if (hot >= 10000) {
    return (hot / 10000).toFixed(1) + "w"
  }
  return hot.toString()
}

/**
 * TimelineHotList 组件
 * 时间线形式展示热榜数据，支持无限滚动加载
 * 
 * 设计参考：
 * - 深色主题背景
 * - 左侧时间线（线条 + 圆点）
 * - 右侧新闻内容（时间、标题、热度）
 * - 底部无限滚动加载
 */
export function TimelineHotList({ providerTitle }: TimelineHotListProps) {
  const { isDark } = useTheme()
  
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef(1)

  /**
   * 将 HotItem 转换为 TimelineItem
   */
  const convertToTimelineItems = useCallback((hotItems: HotItem[], startIndex: number): TimelineItem[] => {
    return hotItems.map((item, index) => ({
      id: `${item.title}-${startIndex + index}`,
      time: generateTime(startIndex + index),
      title: item.title,
      desc: item.desc,
      hot: typeof item.hot === "string" ? parseFloat(item.hot) || Math.floor(Math.random() * 50000) + 10000 : (item.hot || Math.floor(Math.random() * 50000) + 10000),
      url: item.url,
      mobileUrl: item.mobileUrl,
    }))
  }, [])

  /**
   * 加载热榜数据
   */
  const loadHotList = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true)
      pageRef.current = 1
      setHasMore(true)
    } else {
      setLoadingMore(true)
    }
    setError(null)
    
    try {
      const data = await getHotList(providerTitle)
      const startIndex = isRefresh ? 0 : items.length
      const newItems = convertToTimelineItems(data, startIndex)
      
      if (isRefresh) {
        setItems(newItems)
      } else {
        // 模拟分页：只取部分数据
        const pageSize = 10
        const start = (pageRef.current - 1) * pageSize
        const end = start + pageSize
        const pageItems = newItems.slice(start, end)
        
        if (pageItems.length === 0) {
          setHasMore(false)
        } else {
          setItems(prev => [...prev, ...pageItems])
          pageRef.current += 1
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("加载热榜数据失败")
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [providerTitle, items.length, convertToTimelineItems])

  /**
   * 加载更多数据（模拟）
   */
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    
    // 模拟生成更多数据
    setLoadingMore(true)
    setTimeout(() => {
      const newItems: TimelineItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `mock-${Date.now()}-${i}`,
        time: generateTime(items.length + i),
        title: `热点新闻 ${items.length + i + 1}：这是一条模拟的热点新闻标题，用于展示无限滚动加载效果`,
        hot: Math.floor(Math.random() * 80000) + 10000,
        url: "#",
      }))
      
      setItems(prev => [...prev, ...newItems])
      setLoadingMore(false)
      
      // 最多加载 100 条
      if (items.length >= 100) {
        setHasMore(false)
      }
    }, 800)
  }, [items.length, loadingMore, hasMore])

  // 初始加载
  useEffect(() => {
    loadHotList(true)
  }, [loadHotList])

  // 无限滚动：Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, loadMore])

  /**
   * 打开链接
   */
  const openLink = (item: TimelineItem) => {
    const url = item.mobileUrl || item.url
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  // 加载状态 - 骨架屏
  if (loading && items.length === 0) {
    return (
      <div className={cn(
        "flex h-full flex-col",
        isDark ? "bg-slate-950" : "bg-white"
      )}>
        {/* 时间线骨架 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn("h-3 w-3 animate-pulse rounded-full", isDark ? "bg-slate-800" : "bg-gray-200")} />
                  <div className={cn("mt-2 h-16 w-0.5 animate-pulse", isDark ? "bg-slate-800" : "bg-gray-200")} />
                </div>
                <div className="flex-1 pb-6">
                  <div className={cn("h-4 w-12 animate-pulse rounded", isDark ? "bg-slate-800" : "bg-gray-200")} />
                  <div className={cn("mt-2 h-5 w-full animate-pulse rounded", isDark ? "bg-slate-800" : "bg-gray-200")} />
                  <div className={cn("mt-2 h-4 w-24 animate-pulse rounded", isDark ? "bg-slate-800" : "bg-gray-200")} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex h-full flex-col",
      isDark ? "bg-slate-950" : "bg-white"
    )}>
      {/* 可滚动内容区域 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
      >
        {/* 时间线列表 */}
        <div className="relative p-4">
          {/* 垂直时间线 */}
          <div className={cn(
            "absolute left-[21px] top-4 bottom-4 w-0.5",
            isDark ? "bg-slate-800" : "bg-gray-200"
          )} />
          
          <div className="space-y-0">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="relative flex gap-4 pb-6 cursor-pointer group"
                onClick={() => openLink(item)}
              >
                {/* 时间线圆点 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div 
                    className={cn(
                      "h-3 w-3 rounded-full border-2 transition-colors",
                      index === 0 
                        ? "bg-blue-500 border-blue-500" 
                        : isDark
                          ? "bg-slate-950 border-slate-600 group-hover:border-blue-400"
                          : "bg-white border-gray-400 group-hover:border-blue-500"
                    )} 
                  />
                </div>

                {/* 内容区域 */}
                <div className="flex-1 pt-0">
                  {/* 时间 */}
                  <span className={cn(
                    "text-xs font-medium",
                    isDark ? "text-slate-500" : "text-gray-400"
                  )}>
                    {item.time}
                  </span>
                  
                  {/* 标题 */}
                  <h3 className={cn(
                    "mt-1 text-[15px] font-medium leading-snug transition-colors line-clamp-2",
                    isDark 
                      ? "text-slate-100 group-hover:text-blue-400" 
                      : "text-gray-900 group-hover:text-blue-600"
                  )}>
                    {item.title}
                  </h3>
                  
                  {/* 描述 */}
                  {item.desc && item.desc !== item.title && (
                    <p className={cn(
                      "mt-1.5 text-[13px] leading-relaxed line-clamp-2",
                      isDark ? "text-slate-400" : "text-gray-500"
                    )}>
                      {item.desc}
                    </p>
                  )}
                  
                  {/* 热度值 */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs font-medium text-orange-500">
                      {formatHot(item.hot)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 加载更多触发器 */}
        <div ref={loadMoreRef} className="py-4">
          {loadingMore && (
            <div className={cn(
              "flex items-center justify-center gap-2 text-sm",
              isDark ? "text-slate-500" : "text-gray-400"
            )}>
              <div className={cn(
                "h-4 w-4 animate-spin rounded-full border-2",
                isDark ? "border-slate-600 border-t-blue-500" : "border-gray-300 border-t-blue-500"
              )} />
              <span>加载中...</span>
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div className={cn(
              "text-center text-xs",
              isDark ? "text-slate-600" : "text-gray-400"
            )}>
              已经到底了
            </div>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className={cn(
          "absolute inset-x-4 bottom-4 rounded-lg border p-3",
          isDark 
            ? "bg-red-500/10 border-red-500/20" 
            : "bg-red-50 border-red-200"
        )}>
          <p className={cn(
            "text-sm",
            isDark ? "text-red-400" : "text-red-600"
          )}>{error}</p>
          <button 
            onClick={() => loadHotList(true)}
            className={cn(
              "mt-2 text-xs underline",
              isDark ? "text-red-400" : "text-red-600"
            )}
          >
            重试
          </button>
        </div>
      )}
    </div>
  )
}
