import { useState, useEffect, useCallback } from "preact/compat"
import { Header } from "./components/Header"
import { ProviderGrid } from "./components/ProviderGrid"
import { TimelineHotList } from "./components/TimelineHotList"
import { ThemeProvider } from "./contexts/ThemeContext"
import type { Provider, DataRegion } from "./lib/api"
import { cn } from "./lib/utils"
import { Button } from "./components/ui/button"

/**
 * 从 URL 查询参数获取当前 provider
 */
function getProviderFromURL(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get("provider")
}

function getRegionFromURL(): DataRegion | null {
  const params = new URLSearchParams(window.location.search)
  const region = params.get("region")
  if (region === "cn" || region === "global") return region
  return null
}

/**
 * 更新 URL 查询参数
 */
function updateURL(region: DataRegion, provider: string | null) {
  const url = new URL(window.location.href)
  url.searchParams.set("region", region)
  if (provider) {
    url.searchParams.set("provider", provider)
  } else {
    url.searchParams.delete("provider")
  }
  window.history.pushState({ provider, region }, "", url)
}

/**
 * 应用主体组件
 * 使用 ThemeContext 获取主题状态
 * 支持 URL 路由：?provider=xxx
 */
function AppContent() {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [region, setRegion] = useState<DataRegion>(() => getRegionFromURL() || "cn")

  /**
   * 根据 title 查找 provider
   */
  const findProviderByTitle = useCallback((title: string, providerList: Provider[]): Provider | null => {
    return providerList.find(p => p.title === title) || null
  }, [])

  /**
   * 设置当前 provider 并更新 URL
   */
  const handleSelectProvider = useCallback((provider: Provider) => {
    setSelectedProvider(provider)
    updateURL(region, provider.title)
  }, [region])

  /**
   * 返回首页并清除 URL 参数
   */
  const handleBack = useCallback(() => {
    setSelectedProvider(null)
    updateURL(region, null)
  }, [region])

  /**
   * 处理浏览器前进/后退
   */
  useEffect(() => {
    const handlePopState = (_event: PopStateEvent) => {
      const nextRegion = getRegionFromURL() || "cn"
      setRegion(nextRegion)
      const providerTitle = getProviderFromURL()
      if (providerTitle && providers.length > 0) {
        const provider = findProviderByTitle(providerTitle, providers)
        setSelectedProvider(provider)
      } else {
        setSelectedProvider(null)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [providers, findProviderByTitle])

  /**
   * 加载 providers 后检查 URL 参数
   */
  const handleProvidersLoaded = useCallback((loadedProviders: Provider[]) => {
    setProviders(loadedProviders)
    
    // 检查 URL 是否有 provider 参数
    const providerTitle = getProviderFromURL()
    if (providerTitle) {
      const provider = findProviderByTitle(providerTitle, loadedProviders)
      if (provider) {
        setSelectedProvider(provider)
      }
    }
  }, [findProviderByTitle])

  const handleSwitchRegion = useCallback((nextRegion: DataRegion) => {
    setRegion(nextRegion)
    setSelectedProvider(null)
    updateURL(nextRegion, null)
  }, [])

  const isDetail = selectedProvider !== null

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-background text-foreground transition-colors duration-300"
      )}
    >
      {/* 全局导航栏 - 根据页面状态切换模式 */}
      <Header
        mode={isDetail ? "detail" : "home"}
        title={selectedProvider?.title}
        onBack={isDetail ? handleBack : undefined}
      />

      {/* 页面内容区域 */}
      {/* 首页：可滚动；详情页：独立滚动区域 */}
      <main 
        className={cn(
          "flex-1",
          isDetail ? "overflow-hidden" : "overflow-y-auto scrollbar-hide"
        )}
      >
        {selectedProvider ? (
          <TimelineHotList
            provider={selectedProvider}
            onBack={handleBack}
          />
        ) : (
          <div className="mx-auto w-full max-w-6xl">
            <div className="sticky top-14 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="px-4 py-3">
                <div className="inline-flex rounded-lg bg-muted p-1">
                  <Button
                    variant={region === "cn" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleSwitchRegion("cn")}
                    className="min-h-9 min-w-0 px-4"
                  >
                    国内
                  </Button>
                  <Button
                    variant={region === "global" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleSwitchRegion("global")}
                    className="min-h-9 min-w-0 px-4"
                  >
                    国外
                  </Button>
                </div>
              </div>
            </div>

            <ProviderGrid
              region={region}
              onSelectProvider={handleSelectProvider}
              onProvidersLoaded={handleProvidersLoaded}
            />
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * 应用根组件
 * 提供全局 ThemeContext
 */
export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
