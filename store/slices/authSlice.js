import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/auth/login', credentials)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed')
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await axios.post('/api/auth/logout')
})

export const fetchProfile = createAsyncThunk(
  'auth/profile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/auth/profile')
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Not authenticated')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put('/api/auth/profile', profileData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    profileLoading: false,
  },
  reducers: {
    clearAuthError(state) { state.error = null },
    setCredentials(state, action) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    })

    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => { state.profileLoading = true })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.profileLoading = false
        state.isAuthenticated = false
        state.user = null
      })

    // Update Profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
  },
})

export const { clearAuthError, setCredentials } = authSlice.actions
export default authSlice.reducer
