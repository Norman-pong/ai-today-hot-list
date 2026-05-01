// API 基础配置
const API_BASE_URL = "https://apis.uctb.cn/api/dailyhot"
const HN_API_BASE_URL = "https://hacker-news.firebaseio.com/v0"
const REDDIT_BASE_URL = "https://www.reddit.com"
const DAILYHOT_API_BASE_URLS = String(
  (import.meta as any).env?.VITE_DAILYHOT_API_BASE_URLS ||
    (import.meta as any).env?.VITE_DAILYHOT_API_BASE_URL ||
    "https://api-hot.imsyy.top,https://api.guole.fun"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

export type DataRegion = "cn" | "global"
export type DataSource = "dailyhot" | "dailyhotapi" | "hackernews" | "reddit"

// 供应商类型定义
export interface Provider {
  title: string
  name: string
  region: DataRegion
  source: DataSource
  sourceKey?: string
  icon?: string
}

// 热榜条目类型定义
export interface HotItem {
  title: string
  desc?: string
  pic?: string
  hot?: string | number
  url: string
  mobileUrl?: string
}

// API 响应类型
export interface ApiResponse<T> {
  code: number
  message?: string
  msg?: string
  data: T
}

// 供应商列表响应数据格式
interface ProvidersData {
  platforms: string[]
  total: number
}

interface DailyHotApiResponse<T> {
  code: number
  message?: string
  title?: string
  subtitle?: string
  from?: string
  total?: number
  updateTime?: string
  data: T
}

// 自定义错误类
export class ApiError extends Error {
  code?: number
  isCorsError: boolean

  constructor(
    message: string,
    code?: number,
    isCorsError: boolean = false
  ) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.isCorsError = isCorsError
  }
}

/**
 * 检查是否为 CORS 错误
 * CORS 错误通常表现为 TypeError: Failed to fetch
 * 且错误信息中包含特定关键词
 */
function isCorsError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase()
    return (
      message.includes("failed to fetch") ||
      message.includes("networkerror") ||
      message.includes("cors")
    )
  }
  return false
}

/**
 * 获取所有支持的供应商列表
 * GET https://apis.uctb.cn/api/dailyhot
 */
export async function getProviders(): Promise<Provider[]> {
  return getProvidersByRegion("cn")
}

export async function getProvidersByRegion(region: DataRegion): Promise<Provider[]> {
  if (region === "global") {
    return [
      {
        title: "HN Top",
        name: "HN Top",
        region: "global",
        source: "hackernews",
        sourceKey: "top",
        icon: "🟧",
      },
      {
        title: "HN Best",
        name: "HN Best",
        region: "global",
        source: "hackernews",
        sourceKey: "best",
        icon: "🟧",
      },
      {
        title: "HN New",
        name: "HN New",
        region: "global",
        source: "hackernews",
        sourceKey: "new",
        icon: "🟧",
      },
      {
        title: "HN Show",
        name: "HN Show",
        region: "global",
        source: "hackernews",
        sourceKey: "show",
        icon: "🟧",
      },
      {
        title: "Reddit Technology",
        name: "Reddit Technology",
        region: "global",
        source: "reddit",
        sourceKey: "technology",
        icon: "👽",
      },
      {
        title: "Reddit Programming",
        name: "Reddit Programming",
        region: "global",
        source: "reddit",
        sourceKey: "programming",
        icon: "👽",
      },
      {
        title: "Reddit Science",
        name: "Reddit Science",
        region: "global",
        source: "reddit",
        sourceKey: "science",
        icon: "👽",
      },
    ]
  }

  const cnFallbackProviders: Provider[] = [
    { title: "微博", name: "微博", region: "cn", source: "dailyhotapi", sourceKey: "weibo" },
    { title: "知乎", name: "知乎", region: "cn", source: "dailyhotapi", sourceKey: "zhihu" },
    { title: "百度", name: "百度", region: "cn", source: "dailyhotapi", sourceKey: "baidu" },
    { title: "抖音", name: "抖音", region: "cn", source: "dailyhotapi", sourceKey: "douyin" },
    { title: "哔哩哔哩", name: "哔哩哔哩", region: "cn", source: "dailyhotapi", sourceKey: "bilibili" },
    { title: "今日头条", name: "今日头条", region: "cn", source: "dailyhotapi", sourceKey: "toutiao" },
    { title: "36氪", name: "36氪", region: "cn", source: "dailyhotapi", sourceKey: "36kr" },
    { title: "掘金", name: "掘金", region: "cn", source: "dailyhotapi", sourceKey: "juejin" },
    { title: "少数派", name: "少数派", region: "cn", source: "dailyhotapi", sourceKey: "sspai" },
    { title: "虎嗅", name: "虎嗅", region: "cn", source: "dailyhotapi", sourceKey: "huxiu" },
    { title: "IT之家", name: "IT之家", region: "cn", source: "dailyhotapi", sourceKey: "ithome" },
    { title: "澎湃新闻", name: "澎湃新闻", region: "cn", source: "dailyhotapi", sourceKey: "thepaper" },
    { title: "腾讯新闻", name: "腾讯新闻", region: "cn", source: "dailyhotapi", sourceKey: "qq-news" },
    { title: "网易新闻", name: "网易新闻", region: "cn", source: "dailyhotapi", sourceKey: "netease-news" },
    { title: "微信读书", name: "微信读书", region: "cn", source: "dailyhotapi", sourceKey: "weread" },
  ]

  try {
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new ApiError(`HTTP 错误: ${response.status}`, response.status)
    }

    const result: ApiResponse<ProvidersData> = await response.json()

    if (result.code !== 200 || !Array.isArray(result.data?.platforms) || result.data.platforms.length === 0) {
      return cnFallbackProviders
    }

    // 将平台名称字符串数组转换为 Provider 对象数组
    return result.data.platforms.map((name) => ({
      title: name,
      name: name,
      region: "cn",
      source: "dailyhot",
    }))
  } catch (error) {
    if (error instanceof ApiError) return cnFallbackProviders
    if (isCorsError(error)) return cnFallbackProviders
    return cnFallbackProviders
  }
}

/**
 * 获取指定供应商的热榜数据
 * GET https://apis.uctb.cn/api/dailyhot?title={title}
 * @param title 供应商标题，如 "抖音"
 */
export async function getHotList(title: string): Promise<HotItem[]> {
  return getHotListByProvider({
    title,
    name: title,
    region: "cn",
    source: "dailyhot",
  })
}

export async function getHotListByProvider(provider: Provider): Promise<HotItem[]> {
  try {
    if (provider.source === "dailyhotapi") {
      const key = provider.sourceKey || provider.title
      let lastError: unknown = null

      for (const baseUrl of DAILYHOT_API_BASE_URLS) {
        try {
          const normalizedBase = baseUrl.replace(/\/$/, "")
          const url = normalizedBase.startsWith("/")
            ? new URL(`${normalizedBase}/${encodeURIComponent(key)}`, typeof window !== "undefined" ? window.location.origin : "http://localhost")
            : new URL(`${normalizedBase}/${encodeURIComponent(key)}`)

          const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          })

          if (!response.ok) {
            throw new ApiError(`HTTP 错误: ${response.status}`, response.status)
          }

          const result: DailyHotApiResponse<Array<{
            title: string
            desc?: string
            pic?: string
            hot?: string | number
            url?: string
            mobileUrl?: string
          }>> = await response.json()

          if (result.code !== 200 || !Array.isArray(result.data) || result.data.length === 0) {
            throw new ApiError(result.message || "获取热榜数据失败", result.code)
          }

          return result.data.slice(0, 50).map((item) => ({
            title: item.title,
            desc: item.desc,
            pic: item.pic,
            hot: item.hot,
            url: item.url || item.mobileUrl || "",
            mobileUrl: item.mobileUrl || item.url,
          }))
        } catch (err) {
          lastError = err
        }
      }

      if (lastError instanceof ApiError) throw lastError
      throw new ApiError("获取热榜数据失败")
    }

    if (provider.source === "hackernews") {
      const feed = provider.sourceKey === "best"
        ? "beststories"
        : provider.sourceKey === "new"
          ? "newstories"
          : provider.sourceKey === "show"
            ? "showstories"
            : "topstories"

      const topStoriesRes = await fetch(`${HN_API_BASE_URL}/${feed}.json`, {
        method: "GET",
        headers: { Accept: "application/json" },
      })

      if (!topStoriesRes.ok) {
        throw new ApiError(`HTTP 错误: ${topStoriesRes.status}`, topStoriesRes.status)
      }

      const ids: number[] = await topStoriesRes.json()
      const topIds = ids.slice(0, 50)

      const items = await Promise.all(
        topIds.map(async (id) => {
          const itemRes = await fetch(`${HN_API_BASE_URL}/item/${id}.json`, {
            method: "GET",
            headers: { Accept: "application/json" },
          })
          if (!itemRes.ok) {
            throw new ApiError(`HTTP 错误: ${itemRes.status}`, itemRes.status)
          }
          const data: {
            id: number
            title?: string
            by?: string
            score?: number
            url?: string
          } = await itemRes.json()

          const url = data.url || `https://news.ycombinator.com/item?id=${id}`
          return {
            title: data.title || `HN #${id}`,
            desc: data.by ? `by ${data.by}` : undefined,
            hot: data.score,
            url,
            mobileUrl: url,
          } satisfies HotItem
        })
      )

      return items
    }

    if (provider.source === "reddit") {
      const subreddit = provider.sourceKey || "worldnews"
      const url = new URL(`${REDDIT_BASE_URL}/r/${encodeURIComponent(subreddit)}/hot.json`)
      url.searchParams.set("limit", "50")

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new ApiError(`HTTP 错误: ${response.status}`, response.status)
      }

      const result: {
        data: {
          children: Array<{
            data: {
              title: string
              author?: string
              score?: number
              ups?: number
              permalink?: string
              url_overridden_by_dest?: string
              url?: string
            }
          }>
        }
      } = await response.json()

      return result.data.children.slice(0, 50).map((c) => {
        const d = c.data
        const permalink = d.permalink ? `https://www.reddit.com${d.permalink}` : undefined
        const link = d.url_overridden_by_dest || d.url || permalink || `${REDDIT_BASE_URL}/r/${subreddit}/`

        return {
          title: d.title,
          desc: d.author ? `u/${d.author}` : undefined,
          hot: d.score ?? d.ups,
          url: link,
          mobileUrl: permalink || link,
        }
      })
    }

    const url = new URL(API_BASE_URL)
    url.searchParams.append("title", provider.title)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new ApiError(`HTTP 错误: ${response.status}`, response.status)
    }

    const result: ApiResponse<HotItem[]> = await response.json()

    if (result.code !== 200 || !Array.isArray(result.data) || result.data.length === 0) {
      const fallbackKey = ({
        微博: "weibo",
        知乎: "zhihu",
        百度: "baidu",
        抖音: "douyin",
        哔哩哔哩: "bilibili",
        B站: "bilibili",
        今日头条: "toutiao",
        "36氪": "36kr",
        掘金: "juejin",
        稀土掘金: "juejin",
        少数派: "sspai",
        虎嗅: "huxiu",
        IT之家: "ithome",
        澎湃新闻: "thepaper",
        腾讯新闻: "qq-news",
        网易新闻: "netease-news",
        微信读书: "weread",
      } as Record<string, string>)[provider.title]

      if (fallbackKey) {
        return getHotListByProvider({
          ...provider,
          source: "dailyhotapi",
          sourceKey: fallbackKey,
        })
      }

      throw new ApiError(result.message || "获取热榜数据失败", result.code)
    }

    // 只返回前 50 条
    return result.data.slice(0, 50)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (isCorsError(error)) {
      throw new ApiError(
        "跨域错误：无法直接访问 API。请安装 CORS 浏览器插件或使用代理服务器。",
        undefined,
        true
      )
    }

    throw new ApiError(
      error instanceof Error ? error.message : "获取热榜数据失败"
    )
  }
}
