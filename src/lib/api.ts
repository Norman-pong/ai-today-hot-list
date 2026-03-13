// API 基础配置
const API_BASE_URL = "https://apis.uctb.cn/api/dailyhot"

// 供应商类型定义
export interface Provider {
  title: string
  name: string
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

    if (result.code !== 200) {
      throw new ApiError(result.message || result.msg || "获取供应商列表失败", result.code)
    }

    // 将平台名称字符串数组转换为 Provider 对象数组
    return result.data.platforms.map((name) => ({
      title: name,
      name: name,
    }))
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
      error instanceof Error ? error.message : "获取供应商列表失败"
    )
  }
}

/**
 * 获取指定供应商的热榜数据
 * GET https://apis.uctb.cn/api/dailyhot?title={title}
 * @param title 供应商标题，如 "抖音"
 */
export async function getHotList(title: string): Promise<HotItem[]> {
  try {
    const url = new URL(API_BASE_URL)
    url.searchParams.append("title", title)

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

    if (result.code !== 200) {
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
