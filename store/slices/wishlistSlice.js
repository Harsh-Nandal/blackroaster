import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const getLocalWishlist = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('lw_wishlist') || '[]')
  } catch {
    return []
  }
}

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { getState }) => {
  const { auth } = getState()
  if (!auth.isAuthenticated) return null
  const { data } = await axios.get('/api/wishlist')
  return data.wishlist
})

export const toggleWishlistAPI = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { getState }) => {
    const { auth } = getState()
    if (!auth.isAuthenticated) return null
    const { data } = await axios.post('/api/wishlist', { productId })
    return data
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: getLocalWishlist(),
    loading: false,
  },
  reducers: {
    toggleWishlistLocal(state, action) {
      const { product } = action.payload
      const idx = state.items.findIndex((i) => i.productId === product._id)
      if (idx >= 0) {
        state.items.splice(idx, 1)
      } else {
        state.items.push({
          productId: product._id,
          name: product.name,
          image: product.images?.[0] || '',
          price: product.salePrice || product.price,
          slug: product.slug,
        })
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('lw_wishlist', JSON.stringify(state.items))
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        if (action.payload) state.items = action.payload
      })
      .addCase(toggleWishlistAPI.fulfilled, (state, action) => {
        if (action.payload?.wishlist) state.items = action.payload.wishlist
      })
  },
})

export const { toggleWishlistLocal } = wishlistSlice.actions

export const selectWishlistItems = (state) => state.wishlist.items
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some((i) => i.productId === productId)

export default wishlistSlice.reducer
