import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api.js'

// 全域快取，避免重複 fetch
let cache = { stores: null, tags: null }

export function useStores() {
  const [stores, setStores] = useState(cache.stores || [])
  const [loading, setLoading] = useState(!cache.stores)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getStores()
      cache.stores = data
      setStores(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createStore = async (data) => {
    const newStore = await api.createStore(data)
    cache.stores = null
    await load()
    return newStore
  }

  const updateStore = async (id, data) => {
    await api.updateStore(id, data)
    cache.stores = null
    await load()
  }

  const deleteStore = async (id) => {
    await api.deleteStore(id)
    cache.stores = null
    await load()
  }

  return { stores, loading, error, reload: load, createStore, updateStore, deleteStore }
}

export function useStore(storeId) {
  const [store, setStore] = useState(null)
  const [dishes, setDishes] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!storeId) return
    try {
      setLoading(true)
      const [storeList, dishData, ratingData] = await Promise.all([
        api.getStores(),
        api.getDishes(storeId),
        api.getRatings(storeId),
      ])
      const found = storeList.find(s => s.id === storeId)
      setStore(found || null)
      setDishes(dishData)
      setRatings(ratingData)
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => { load() }, [load])

  const createDish = async (data) => { await api.createDish(storeId, data); await load() }
  const updateDish = async (dishId, data) => { await api.updateDish(storeId, dishId, data); await load() }
  const deleteDish = async (dishId) => { await api.deleteDish(storeId, dishId); await load() }
  const createRating = async (data) => { await api.createRating(storeId, data); await load() }
  const deleteRating = async (ratingId) => { await api.deleteRating(storeId, ratingId); await load() }

  return { store, dishes, ratings, loading, reload: load, createDish, updateDish, deleteDish, createRating, deleteRating }
}

export function useTags() {
  const [tags, setTags] = useState(cache.tags || [])
  const [loading, setLoading] = useState(!cache.tags)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getTags()
      cache.tags = data
      setTags(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveTags = async (newTags) => {
    await api.saveTags(newTags)
    cache.tags = newTags
    setTags(newTags)
  }

  return { tags, loading, saveTags }
}
