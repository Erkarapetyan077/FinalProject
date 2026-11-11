import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type AuthState = {
  token: string | null
}

const initialState: AuthState = {
  token: localStorage.getItem('authToken'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
    },
    getToken(state){
      state.token = localStorage.getItem('authToken');
    }
  },
  
})

export const { setToken } = authSlice.actions
export default authSlice.reducer
