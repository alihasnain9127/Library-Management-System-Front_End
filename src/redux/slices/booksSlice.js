import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

// Async Thunks for API Interaction
export const fetchBooks = createAsyncThunk('books/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/books', { params });
    return response.data.data; // Assuming API returns { data: [...] }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
  }
});

export const addBook = createAsyncThunk('books/add', async (bookData, { rejectWithValue }) => {
  try {
    const response = await api.post('/books', bookData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add book');
  }
});

export const updateBook = createAsyncThunk('books/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/books/${id}`, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update book');
  }
});

export const deleteBook = createAsyncThunk('books/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/books/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete book');
  }
});

const booksSlice = createSlice({
  name: 'books',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
    actionLoading: false, // Specifically for add/update/delete buttons
  },
  reducers: {
    clearBookErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBooks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.books || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(fetchBooks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Add
      .addCase(addBook.pending, (state) => { state.actionLoading = true; })
      .addCase(addBook.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(addBook.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      // Update
      .addCase(updateBook.pending, (state) => { state.actionLoading = true; })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.items.findIndex(b => b._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateBook.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      // Delete
      .addCase(deleteBook.pending, (state) => { state.actionLoading = true; })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.filter(b => b._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteBook.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
  }
});

export const { clearBookErrors } = booksSlice.actions;
export default booksSlice.reducer;