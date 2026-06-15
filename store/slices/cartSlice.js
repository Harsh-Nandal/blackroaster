import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const getLocalCart = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('lw_cart') || '[]')
  } catch {
    return []
  }
}

const saveLocalCart = (items) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lw_cart', JSON.stringify(items))
  }
}

export const syncCart = createAsyncThunk('cart/sync', async (_, { getState }) => {
  const { auth } = getState()
  if (!auth.isAuthenticated) return null
  const { data } = await axios.get('/api/cart')
  return data.cart
})

export const addToCartAPI = createAsyncThunk(
  'cart/addAPI',
  async ({ productId, variantId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/cart', { productId, variantId, quantity })
      return data.cart
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const removeFromCartAPI = createAsyncThunk(
  'cart/removeAPI',
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/api/cart/${itemId}`)
      return data.cart
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const updateCartQuantityAPI = createAsyncThunk(
  'cart/updateQtyAPI',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/cart/${itemId}`, { quantity })
      return data.cart
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getLocalCart(),
    coupon: null,
    couponDiscount: 0,
    loading: false,
    cartOpen: false,
  },
  reducers: {
    addToCart(state, action) {
      const { product, variant, quantity = 1 } = action.payload
      const existingIdx = state.items.findIndex(
        (i) => i.productId === product._id && i.variantId === (variant?._id || null)
      )
      if (existingIdx >= 0) {
        state.items[existingIdx].quantity += quantity
      } else {
        state.items.push({
          productId: product._id,
          variantId: variant?._id || null,
          name: product.name,
          image: product.images?.[0] || '',
          price: variant?.price || product.salePrice || product.price,
          variant: variant ? { label: variant.label, sku: variant.sku } : null,
          quantity,
          stock: variant?.stock || product.stock || 99,
        })
      }
      saveLocalCart(state.items)
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && i.variantId === action.payload.variantId)
      )
      saveLocalCart(state.items)
    },
    updateQuantity(state, action) {
      const { productId, variantId, quantity } = action.payload
      const item = state.items.find(
        (i) => i.productId === productId && i.variantId === variantId
      )
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock))
        saveLocalCart(state.items)
      }
    },
    clearCart(state) {
      state.items = []
      state.coupon = null
      state.couponDiscount = 0
      saveLocalCart([])
    },
    applyCoupon(state, action) {
      state.coupon = action.payload.code
      state.couponDiscount = action.payload.discount
    },
    removeCoupon(state) {
      state.coupon = null
      state.couponDiscount = 0
    },
    toggleCart(state) { state.cartOpen = !state.cartOpen },
    closeCart(state) { state.cartOpen = false },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
          saveLocalCart(action.payload)
        }
      })
      .addCase(addToCartAPI.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
          saveLocalCart(action.payload)
        }
      })
      .addCase(removeFromCartAPI.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
          saveLocalCart(action.payload)
        }
      })
      .addCase(updateCartQuantityAPI.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
          saveLocalCart(action.payload)
        }
      })
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  toggleCart,
  closeCart,
} = cartSlice.actions

// Selectors
export const selectCartItems = (state) => state.cart.items
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0)
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state)
  return subtotal - (subtotal * state.cart.couponDiscount) / 100
}

export default cartSlice.reducer
