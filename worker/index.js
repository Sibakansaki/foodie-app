/**
 * 好食記 Cloudflare Worker
 * 所有環境變數在 Cloudflare Dashboard 設定：
 *   GITHUB_TOKEN  — GitHub Personal Access Token (fine-grained, contents:write)
 *   GITHUB_OWNER  — 你的 GitHub 帳號名
 *   GITHUB_REPO   — 儲存資料的 repo 名稱
 *   APP_SECRET    — 自訂密碼，前端請求時帶在 Authorization header
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

function err(msg, status = 400) {
  return json({ error: msg }, status)
}

// ── GitHub API helpers ──────────────────────────────────────────────
async function ghGet(env, path) {
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'foodie-worker',
    },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status}`)
  return res.json()
}

async function ghReadJson(env, path) {
  const file = await ghGet(env, path)
  if (!file) return null
  const content = atob(file.content.replace(/\n/g, ''))
  return { data: JSON.parse(content), sha: file.sha }
}

async function ghWriteJson(env, path, data, sha) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))))
  const body = { message: `update ${path}`, content }
  if (sha) body.sha = sha

  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'foodie-worker',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub write ${path}: ${res.status} ${await res.text()}`)
  return res.json()
}

async function ghWriteBase64(env, path, base64, sha) {
  const body = { message: `upload ${path}`, content: base64 }
  if (sha) body.sha = sha
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'foodie-worker',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub upload ${path}: ${res.status}`)
  return res.json()
}

// 讀取 JSON，不存在就回傳 default
async function read(env, path, defaultVal) {
  const result = await ghReadJson(env, path)
  if (!result) return { data: defaultVal, sha: null }
  return result
}

// ── 路由 ──────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // Preflight
    if (method === 'OPTIONS') return new Response(null, { headers: CORS })

    // Auth check（除了 OPTIONS）
    const auth = request.headers.get('Authorization')
    if (env.APP_SECRET && auth !== `Bearer ${env.APP_SECRET}`) {
      return err('Unauthorized', 401)
    }

    try {
      // ── 店家 ──
      if (path === '/api/stores' && method === 'GET') {
        const { data } = await read(env, 'data/stores.json', [])
        return json(data)
      }

      if (path === '/api/stores' && method === 'POST') {
        const body = await request.json()
        const { data, sha } = await read(env, 'data/stores.json', [])
        const store = { ...body, id: body.id || Date.now().toString(36), avgRating: null, createdAt: new Date().toISOString() }
        data.push(store)
        await ghWriteJson(env, 'data/stores.json', data, sha)
        return json(store)
      }

      const storeMatch = path.match(/^\/api\/stores\/([^/]+)$/)
      if (storeMatch) {
        const storeId = storeMatch[1]
        if (method === 'PUT') {
          const body = await request.json()
          const { data, sha } = await read(env, 'data/stores.json', [])
          const idx = data.findIndex(s => s.id === storeId)
          if (idx === -1) return err('Not found', 404)
          data[idx] = { ...data[idx], ...body }
          await ghWriteJson(env, 'data/stores.json', data, sha)
          return json(data[idx])
        }
        if (method === 'DELETE') {
          const { data, sha } = await read(env, 'data/stores.json', [])
          const filtered = data.filter(s => s.id !== storeId)
          await ghWriteJson(env, 'data/stores.json', filtered, sha)
          return json({ ok: true })
        }
      }

      // ── 餐點 ──
      const dishesMatch = path.match(/^\/api\/stores\/([^/]+)\/dishes$/)
      if (dishesMatch) {
        const storeId = dishesMatch[1]
        if (method === 'GET') {
          const { data } = await read(env, `data/dishes_${storeId}.json`, [])
          return json(data)
        }
        if (method === 'POST') {
          const body = await request.json()
          const { data, sha } = await read(env, `data/dishes_${storeId}.json`, [])
          const dish = { ...body, id: Date.now().toString(36), storeId, createdAt: new Date().toISOString() }
          data.push(dish)
          await ghWriteJson(env, `data/dishes_${storeId}.json`, data, sha)
          return json(dish)
        }
      }

      const dishMatch = path.match(/^\/api\/stores\/([^/]+)\/dishes\/([^/]+)$/)
      if (dishMatch) {
        const [, storeId, dishId] = dishMatch
        const filePath = `data/dishes_${storeId}.json`
        if (method === 'PUT') {
          const body = await request.json()
          const { data, sha } = await read(env, filePath, [])
          const idx = data.findIndex(d => d.id === dishId)
          if (idx === -1) return err('Not found', 404)
          data[idx] = { ...data[idx], ...body }
          await ghWriteJson(env, filePath, data, sha)
          return json(data[idx])
        }
        if (method === 'DELETE') {
          const { data, sha } = await read(env, filePath, [])
          await ghWriteJson(env, filePath, data.filter(d => d.id !== dishId), sha)
          return json({ ok: true })
        }
      }

      // ── 評分 ──
      const ratingsMatch = path.match(/^\/api\/stores\/([^/]+)\/ratings$/)
      if (ratingsMatch) {
        const storeId = ratingsMatch[1]
        const filePath = `data/ratings_${storeId}.json`
        if (method === 'GET') {
          const { data } = await read(env, filePath, [])
          return json(data)
        }
        if (method === 'POST') {
          const body = await request.json()
          const { data, sha } = await read(env, filePath, [])
          const rating = { ...body, storeId }
          data.push(rating)
          await ghWriteJson(env, filePath, data, sha)
          // 更新 store 的 avgRating 快取
          await updateStoreAvg(env, storeId, data)
          return json(rating)
        }
      }

      const ratingDelMatch = path.match(/^\/api\/stores\/([^/]+)\/ratings\/([^/]+)$/)
      if (ratingDelMatch && method === 'DELETE') {
        const [, storeId, ratingId] = ratingDelMatch
        const filePath = `data/ratings_${storeId}.json`
        const { data, sha } = await read(env, filePath, [])
        const filtered = data.filter(r => r.id !== ratingId)
        await ghWriteJson(env, filePath, filtered, sha)
        await updateStoreAvg(env, storeId, filtered)
        return json({ ok: true })
      }

      // ── 標籤 ──
      if (path === '/api/tags') {
        if (method === 'GET') {
          const { data } = await read(env, 'data/tags.json', [])
          return json(data)
        }
        if (method === 'PUT') {
          const body = await request.json()
          const { sha } = await read(env, 'data/tags.json', [])
          await ghWriteJson(env, 'data/tags.json', body, sha)
          return json(body)
        }
      }

      // ── 照片上傳 ──
      if (path === '/api/photos' && method === 'POST') {
        const { storeId, base64, filename } = await request.json()
        const ext = filename.split('.').pop() || 'jpg'
        const filePath = `photos/${storeId}_${Date.now()}.${ext}`
        const existing = await ghGet(env, filePath)
        await ghWriteBase64(env, filePath, base64, existing?.sha)
        const rawUrl = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/main/${filePath}`
        return json({ url: rawUrl })
      }

      return err('Not found', 404)
    } catch (e) {
      return err(e.message, 500)
    }
  }
}

// 更新 store 的 avgRating 欄位（方便列表頁顯示）
async function updateStoreAvg(env, storeId, ratings) {
  try {
    const scored = ratings.filter(r => r.overallStars > 0)
    const avg = scored.length > 0
      ? Math.round((scored.reduce((a, r) => a + r.overallStars, 0) / scored.length) * 10) / 10
      : null
    const { data: stores, sha } = await read(env, 'data/stores.json', [])
    const idx = stores.findIndex(s => s.id === storeId)
    if (idx !== -1) {
      stores[idx].avgRating = avg
      await ghWriteJson(env, 'data/stores.json', stores, sha)
    }
  } catch (_) {}
}
