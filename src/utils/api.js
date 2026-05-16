const BASE = import.meta.env.VITE_WORKER_URL || ''
const SECRET = import.meta.env.VITE_APP_SECRET || ''

async function req(path, method = 'GET', body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET}`,
    },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(BASE + path, opts)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  getStores: () => req('/api/stores'),
  createStore: (data) => req('/api/stores', 'POST', data),
  updateStore: (id, data) => req(`/api/stores/${id}`, 'PUT', data),
  deleteStore: (id) => req(`/api/stores/${id}`, 'DELETE'),

  getDishes: (storeId) => req(`/api/stores/${storeId}/dishes`),
  createDish: (storeId, data) => req(`/api/stores/${storeId}/dishes`, 'POST', data),
  updateDish: (storeId, dishId, data) => req(`/api/stores/${storeId}/dishes/${dishId}`, 'PUT', data),
  deleteDish: (storeId, dishId) => req(`/api/stores/${storeId}/dishes/${dishId}`, 'DELETE'),

  getRatings: (storeId) => req(`/api/stores/${storeId}/ratings`),
  createRating: (storeId, data) => req(`/api/stores/${storeId}/ratings`, 'POST', data),
  deleteRating: (storeId, ratingId) => req(`/api/stores/${storeId}/ratings/${ratingId}`, 'DELETE'),

  getTags: () => req('/api/tags'),
  saveTags: (tags) => req('/api/tags', 'PUT', tags),

  uploadPhoto: (storeId, base64, filename) =>
    req('/api/photos', 'POST', { storeId, base64, filename }),
}