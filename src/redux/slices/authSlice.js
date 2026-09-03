
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    const userJson = Cookies.get('user');
    return userJson ? JSON.parse(userJson) : null;
  }
  return null;
};

const initialState = {
  user: getInitialUser(),
  isAuthenticated: typeof window !== 'undefined' ? !!Cookies.get('token') : false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.error = null;

      // Store credentials and profile snapshot only when available
      if (token) {
        Cookies.set('token', token, { secure: true });
      }
      if (user) {
        Cookies.set('role', user.role, { secure: true });
        Cookies.set('user', JSON.stringify(user), { secure: true });
      }
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      Cookies.remove('token');
      Cookies.remove('role');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  },
});

export const { authStart, authSuccess, authFailure, logout } = authSlice.actions;
export default authSlice.reducer;