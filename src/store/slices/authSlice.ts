// src/store/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  userEmail: string | null;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('authToken') : null,
  userEmail: typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; email: string }>) => {
      state.token = action.payload.token;
      state.userEmail = action.payload.email;
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('userEmail', action.payload.email);
    },
    logout: (state) => {
      state.token = null;
      state.userEmail = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
