import { createContext, useContext, useState, useEffect, type ReactNode } from "preact/compat"

/**
 * 主题上下文类型定义
 */
interface ThemeContextType {
  /** 当前是否为深色主题 */
  isDark: boolean
  /** 切换主题 */
  toggleTheme: () => void
  /** 设置指定主题 */
  setTheme: (isDark: boolean) => void
}

/**
 * 创建主题上下文
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * localStorage 键名
 */
const THEME_STORAGE_KEY = "hotlist-theme"

/**
 * 从 localStorage 读取主题设置
 */
function getStoredTheme(): boolean {
  if (typeof window === "undefined") return true
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  // 默认深色主题
  return stored ? stored === "dark" : true
}

/**
 * 保存主题设置到 localStorage
 */
function storeTheme(isDark: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light")
}

/**
 * ThemeProvider 组件属性
 */
interface ThemeProviderProps {
  children: ReactNode
}

/**
 * 主题提供者组件
 * 管理全局主题状态并提供主题切换功能
 * 主题设置自动持久化到 localStorage
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // 初始化时从 localStorage 读取
  const [isDark, setIsDark] = useState(() => getStoredTheme())

  /**
   * 切换主题
   */
  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev
      storeTheme(newValue)
      return newValue
    })
  }

  /**
   * 设置指定主题
   */
  const setTheme = (value: boolean) => {
    setIsDark(value)
    storeTheme(value)
  }

  // 同步到其他标签页
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        setIsDark(e.newValue === "dark")
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.style.colorScheme = isDark ? "dark" : "light"
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * 使用主题上下文的 Hook
 * 必须在 ThemeProvider 内部使用
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
