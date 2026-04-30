import { useState, useEffect, useRef, useCallback } from "preact/hooks"
import { getHotListByProvider, type HotItem, type Provider, ApiError } from "../lib/api"
import { cn } from "../lib/utils"
import { Flame } from "lucide-react"

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
  provider: Provider
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
export function TimelineHotList({ provider }: TimelineHotListProps) {
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
      const data = await getHotListByProvider(provider)
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
  }, [provider, items.length, convertToTimelineItems])

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
      <div className="flex h-full flex-col bg-background">
        {/* 时间线骨架 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-muted" />
                  <div className="mt-2 h-16 w-0.5 animate-pulse bg-muted" />
                </div>
                <div className="flex-1 pb-6">
                  <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-5 w-full animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* 可滚动内容区域 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
      >
        {/* 时间线列表 */}
        <div className="relative mx-auto w-full max-w-3xl p-4">
          {/* 垂直时间线 */}
          <div className="absolute bottom-4 left-[21px] top-4 w-0.5 bg-border" />
          
          <div className="space-y-0">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="group relative flex cursor-pointer gap-4 rounded-xl pb-6 transition-colors hover:bg-accent/40"
                onClick={() => openLink(item)}
              >
                {/* 时间线圆点 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div 
                    className={cn(
                      "mt-1 h-3 w-3 rounded-full border-2 transition-colors",
                      index === 0 
                        ? "border-primary bg-primary" 
                        : "border-border bg-background group-hover:border-primary/70"
                    )} 
                  />
                </div>

                {/* 内容区域 */}
                <div className="flex-1 pb-2 pt-0">
                  {/* 时间 */}
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.time}
                  </span>
                  
                  {/* 标题 */}
                  <h3 className="mt-1 text-[15px] font-medium leading-snug text-foreground transition-colors line-clamp-2 group-hover:text-primary">
                    {item.title}
                  </h3>
                  
                  {/* 描述 */}
                  {item.desc && item.desc !== item.title && (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
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
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className={cn(
                "h-4 w-4 animate-spin rounded-full border-2",
                "border-border border-t-primary"
              )} />
              <span>加载中...</span>
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div className="text-center text-xs text-muted-foreground">
              已经到底了
            </div>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="absolute inset-x-4 bottom-4 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-destructive">
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => loadHotList(true)}
            className="mt-2 text-xs underline"
          >
            重试
          </button>
        </div>
      )}
    </div>
  )
}
