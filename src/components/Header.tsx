import { cn } from "../lib/utils"
import { TrendingUp, ArrowLeft, Sun, Moon, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "../contexts/ThemeContext"

/**
 * Header 组件属性
 */
interface HeaderProps {
  /** 当前模式：首页或详情页 */
  mode?: "home" | "detail"
  /** 页面标题（详情页模式下显示） */
  title?: string
  /** 返回按钮回调（详情页模式下使用） */
  onBack?: () => void
  /** 刷新按钮回调（可选） */
  onRefresh?: () => void
  /** 是否正在刷新 */
  refreshing?: boolean
  className?: string
}

/**
 * Header 组件
 * 应用顶部导航栏，支持首页和详情页两种模式
 * 
 * 首页模式：
 * - 显示 Logo 和 "今日热榜" 标题
 * - 显示主题切换按钮
 * 
 * 详情页模式：
 * - 显示返回按钮和页面标题
 * - 显示主题切换按钮
 * - 显示刷新按钮（如果提供 onRefresh）
 * 
 * 移动端适配：
 * - 固定在顶部
 * - 添加安全区域适配（iPhone X+ 刘海屏）
 * - 支持深色/浅色主题
 */
export function Header({
  mode = "home",
  title,
  onBack,
  onRefresh,
  refreshing = false,
  className,
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme()

  const isDetail = mode === "detail"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top shadow-sm shadow-black/5 dark:shadow-black/20",
        className
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        {/* 左侧：返回按钮 + 标题 */}
        <div className="flex items-center gap-3">
          {isDetail && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className={cn(
                "h-9 w-9 text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {isDetail ? (
            // 详情页标题
            <h1
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h1>
          ) : (
            // 首页 Logo + 标题
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/65 ring-1 ring-primary/25 shadow-sm"
                )}
              >
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h1
                className="font-display text-[18px] font-semibold tracking-wide text-foreground"
              >
                今日热榜
              </h1>
            </div>
          )}
        </div>

        {/* 右侧：主题切换 + 刷新按钮 */}
        <div className="flex items-center gap-1">
          {/* 主题切换按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "h-9 w-9 text-muted-foreground hover:text-foreground"
            )}
            title={isDark ? "切换到浅色主题" : "切换到深色主题"}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* 刷新按钮（仅在详情页且有回调时显示） */}
          {isDetail && onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={refreshing}
              className={cn(
                "h-9 w-9 text-muted-foreground hover:text-foreground"
              )}
            >
              <RefreshCw
                className={cn("h-5 w-5", refreshing && "animate-spin")}
              />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
