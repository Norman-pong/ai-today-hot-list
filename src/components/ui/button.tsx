import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

import type { HTMLAttributes } from "preact/compat"

const buttonVariants = cva(
  // 基础样式：内联布局、居中、圆角、字体、过渡动画
  // 移动端适配：增大触摸区域（min-h-11 min-w-11），确保可点击性
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 min-h-11 min-w-11 touch-manipulation active:translate-y-px",
  {
    variants: {
      variant: {
        // 主按钮：深色背景，用于主要操作
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        // 次级按钮：浅色背景，用于次要操作
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        // 轮廓按钮：边框样式，用于低优先级操作
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        // 幽灵按钮：透明背景，用于图标按钮或导航
        ghost: "hover:bg-accent/70 hover:text-accent-foreground",
        // 链接样式：纯文本按钮
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // 默认尺寸：适合大多数场景
        default: "h-9 px-4 py-2",
        // 小尺寸：适合紧凑布局
        sm: "h-8 rounded-md px-3 text-xs",
        // 大尺寸：适合强调按钮
        lg: "h-10 rounded-md px-8",
        // 图标按钮：正方形，适合图标
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  disabled?: boolean
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
