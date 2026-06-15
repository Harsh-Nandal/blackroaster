import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileMenuOpen: false,
    searchOpen: false,
    searchQuery: '',
    activeModal: null,
    pageLoading: false,
  },
  reducers: {
    toggleMobileMenu(state) { state.mobileMenuOpen = !state.mobileMenuOpen },
    closeMobileMenu(state) { state.mobileMenuOpen = false },
    toggleSearch(state) { state.searchOpen = !state.searchOpen },
    closeSearch(state) { state.searchOpen = false; state.searchQuery = '' },
    setSearchQuery(state, action) { state.searchQuery = action.payload },
    openModal(state, action) { state.activeModal = action.payload },
    closeModal(state) { state.activeModal = null },
    setPageLoading(state, action) { state.pageLoading = action.payload },
  },
})

export const {
  toggleMobileMenu,
  closeMobileMenu,
  toggleSearch,
  closeSearch,
  setSearchQuery,
  openModal,
  closeModal,
  setPageLoading,
} = uiSlice.actions

export default uiSlice.reducer
