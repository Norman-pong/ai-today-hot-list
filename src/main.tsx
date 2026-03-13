import { render } from "preact"
import { App } from "./app"
import "./style.css"

/**
 * 应用入口文件
 * 使用 Preact 渲染应用到 DOM
 */
const rootElement = document.getElementById("app")

if (rootElement) {
  render(<App />, rootElement)
} else {
  console.error("找不到根元素 #app")
}
