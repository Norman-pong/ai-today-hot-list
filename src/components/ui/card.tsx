import { cn } from "../../lib/utils"
import type { HTMLAttributes } from "preact/compat"

/**
 * Card 组件
 * 卡片容器，用于包裹内容块
 * 移动端适配：添加阴影和圆角，提升视觉层次
 */
function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardHeader 组件
 * 卡片头部区域，通常包含标题和描述
 */
function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

/**
 * CardTitle 组件
 * 卡片标题
 * 移动端适配：使用 semibold 字重确保可读性
 */
function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

/**
 * CardDescription 组件
 * 卡片描述文字
 */
function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * CardContent 组件
 * 卡片内容区域
 */
function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
