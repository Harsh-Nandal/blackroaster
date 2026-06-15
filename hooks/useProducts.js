// hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export function useProducts(params = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
      ).toString()
      const { data } = await axios.get(`/api/products?${query}`)
      setProducts(data.data || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  return { products, loading, error, pagination, refetch: fetch }
}
