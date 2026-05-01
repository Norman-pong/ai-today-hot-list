import http from "node:http"

const port = Number(process.env.PORT || 6688)

const json = (res, body) => {
  const text = JSON.stringify(body)
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Content-Length": Buffer.byteLength(text),
  })
  res.end(text)
}

const server = http.createServer((req, res) => {
  if (!req.url) return json(res, { code: 404, message: "Not Found", data: [] })
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    })
    return res.end()
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`)
  const key = url.pathname.replace(/^\/+/, "")

  if (!key) return json(res, { code: 200, message: "ok", data: [] })

  if (key === "all") {
    return json(res, {
      code: 200,
      message: "ok",
      data: [
        { title: "微博", name: "weibo" },
        { title: "知乎", name: "zhihu" },
      ],
    })
  }

  const items = Array.from({ length: 20 }).map((_, i) => ({
    id: `${key}-${i + 1}`,
    title: `${key.toUpperCase()} 热点 ${i + 1}`,
    desc: `mock item ${i + 1}`,
    hot: 10000 + i,
    url: `https://example.com/${encodeURIComponent(key)}/${i + 1}`,
    mobileUrl: `https://m.example.com/${encodeURIComponent(key)}/${i + 1}`,
  }))

  return json(res, {
    code: 200,
    message: "获取成功",
    title: key,
    subtitle: "mock",
    total: items.length,
    updateTime: new Date().toISOString(),
    data: items,
  })
})

server.listen(port, () => {
  process.stdout.write(`mock dailyhotapi listening on http://localhost:${port}\n`)
})

