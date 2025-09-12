import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarUnfoldable: false,
  sidebarShow: true,
}

export const togglerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    toggleChange: (state, action) => {
      state.sidebarShow = action.payload
    },
    toggleUnfold: (state, action) => {
      state.sidebarUnfoldable = action.payload
    },
  },
})

export const { toggleChange, toggleUnfold } = togglerSlice.actions
export default togglerSlice.reducer
