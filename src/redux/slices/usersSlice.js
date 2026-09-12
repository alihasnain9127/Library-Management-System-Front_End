import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
// Admin Thunks
export const fetchAllUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/users');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch directory registry');
  }
});

export const toggleUserSuspension = createAsyncThunk('users/toggleSuspension', async ({ userId, isSuspended, suspensionReason, suspensionEndDate }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/users/${userId}/suspend`, { isSuspended, suspensionReason, suspensionEndDate });
    return response.data.data; // Returns updated user object
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to mutate account restriction state');
  }
});

export const createAdminUser = createAsyncThunk('users/createAdmin', async (adminData, { rejectWithValue }) => {
  try {
    const response = await api.post('/users/create-admin', adminData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create administrator account');
  }
});

// Self-Service User Thunks
export const updateSelfProfile = createAsyncThunk('users/updateSelf', async (profileData, { rejectWithValue }) => {
  try {
    const response = await api.put('/users/profile/update', profileData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update personal registry profile');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    actionLoading: false,
    createLoading: false,
    createError: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Suspension Mutation
      .addCase(toggleUserSuspension.pending, (state) => { state.actionLoading = true; })
      .addCase(toggleUserSuspension.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex(u => u._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(toggleUserSuspension.rejected, (state) => { state.actionLoading = false; })

      // Create Admin
      .addCase(createAdminUser.pending, (state) => { state.createLoading = true; state.createError = null; })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.createLoading = false;
        if (action.payload) state.list.unshift(action.payload);
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });
  },
});

export default usersSlice.reducer;