import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import booksReducer from './slices/booksSlice';
import circulationReducer from './slices/circulationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    books: booksReducer,
    circulation: circulationReducer,
  },
});
