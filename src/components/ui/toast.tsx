import { cn } from "../../lib/utils"
import { X, AlertCircle, CheckCircle, Info } from "lucide-react"

/**
 * Toast 类型定义
 */
export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastProps {
  message: string
  type?: ToastType
  onClose?: () => void
  duration?: number
}

/**
 * Toast 图标映射
 */
const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
}

/**
 * Toast 样式映射
 */
const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
}

/**
 * Toast 组件
 * 轻量级通知提示，用于显示操作结果或错误信息
 * 移动端适配：固定在屏幕底部，宽度适配，添加安全区域
 */
export function Toast({
  message,
  type = "info",
  onClose,
}: ToastProps) {
  const Icon = toastIcons[type]

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md",
        "flex items-center gap-3 rounded-lg border p-4 shadow-lg",
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
        "safe-area-bottom",
        toastStyles[type]
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded p-1 hover:bg-black/5"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
