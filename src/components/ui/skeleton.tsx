import { cn } from "../../lib/utils"
import type { HTMLAttributes } from "preact/compat"

/**
 * Skeleton 组件
 * 骨架屏加载效果，用于数据加载时的占位
 * 移动端适配：使用 shimmer 动画提供视觉反馈
 */
function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
