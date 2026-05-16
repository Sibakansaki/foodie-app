# 好食記 — 部署教學

## 前置需求
- GitHub 帳號
- Cloudflare 帳號（免費）
- Node.js 18+

---

## 步驟一：建立 GitHub 資料 Repo

1. 到 GitHub 新建一個 repo，例如叫 `foodie-data`
2. 設成 **Private**（只有你看得到）
3. 建立一個空的 `README.md`（這樣 repo 才會初始化）

---

## 步驟二：取得 GitHub Token

1. GitHub → Settings → Developer Settings → **Personal access tokens → Fine-grained tokens**
2. 點 "Generate new token"
3. 設定：
   - Token name：`foodie-worker`
   - Expiration：選 1 year 或 No expiration
   - Repository access：選 **Only select repositories** → 選剛建立的 `foodie-data`
   - Permissions → Contents：選 **Read and write**
4. 點 Generate，**複製 token 存好**（只出現一次）

---

## 步驟三：部署 Cloudflare Worker

1. 安裝 wrangler：
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. 在專案根目錄部署：
   ```bash
   wrangler deploy
   ```

3. 到 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers → `foodie-worker` → Settings → Variables
   新增以下環境變數（加密儲存）：

   | 變數名 | 值 |
   |--------|-----|
   | `GITHUB_TOKEN` | 剛才複製的 token |
   | `GITHUB_OWNER` | 你的 GitHub 帳號名 |
   | `GITHUB_REPO` | `foodie-data` |
   | `APP_SECRET` | 自訂一個密碼，例如 `family2024` |

4. 記下你的 Worker URL，格式類似：
   `https://foodie-worker.你的帳號.workers.dev`

---

## 步驟四：設定前端環境變數

在專案根目錄建立 `.env.local`（不要 commit 進 git）：

```env
VITE_WORKER_URL=https://foodie-worker.你的帳號.workers.dev
VITE_APP_SECRET=family2024
```

同時修改 `src/utils/api.js`，讓 Authorization header 帶上 secret：

```js
const SECRET = import.meta.env.VITE_APP_SECRET || ''

async function req(path, method = 'GET', body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET}`,
    },
  }
  // ...
}
```

---

## 步驟五：部署前端到 Cloudflare Pages

1. 先把這個專案 push 到一個 GitHub repo（前端程式碼）
2. 到 Cloudflare Dashboard → Pages → "Create a project" → "Connect to Git"
3. 選你的前端 repo
4. 設定：
   - Build command：`npm run build`
   - Build output directory：`dist`
5. 在 Pages 的 Settings → Environment variables 加入：
   - `VITE_WORKER_URL` = 你的 Worker URL
   - `VITE_APP_SECRET` = 你設定的密碼

6. 點 "Save and Deploy"

完成！你會得到一個 `*.pages.dev` 的網址，手機電腦都能用。

---

## 多人使用

家人只要打開同一個網址，輸入密碼（或直接加進瀏覽器書籤），就能新增/評分，資料自動同步到 GitHub。

## 資料位置

所有資料存在 `foodie-data` repo 的 `data/` 資料夾：
- `data/stores.json` — 所有店家
- `data/tags.json` — 所有標籤
- `data/dishes_[storeId].json` — 各店餐點
- `data/ratings_[storeId].json` — 各店評分
- `photos/` — 店家照片

---

## 本地開發

```bash
npm install
npm run dev
```

Worker 本地測試：
```bash
wrangler dev worker/index.js
```
