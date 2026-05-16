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

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
