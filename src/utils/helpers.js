export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function avgRating(ratings) {
  if (!ratings || ratings.length === 0) return null
  const sum = ratings.reduce((a, r) => a + r.stars, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

export function formatPrice(p) {
  if (!p) return ''
  const map = { low: '$100以下', mid: '$100–300', high: '$300–600', vhigh: '$600以上' }
  return map[p] || p
}

export const SPICY_LEVELS = ['小辣', '中辣', '大辣']

// 壓縮圖片到最大 800px 寬，品質 80%，回傳 base64
export function compressAndConvertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 800
        let w = img.width
        let h = img.height
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX }
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataUrl.split(',')[1])
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function fileToBase64(file) {
  return compressAndConvertToBase64(file)
}
