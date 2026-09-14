import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '@/services/api';

const STORAGE_KEY = 'lms_custom_categories';

/** Built-in predefined categories always available */
const BUILTIN_CATEGORIES = [
  'Biography',
  'Business',
  'Classic',
  'Fantasy',
  'Fiction',
  'Finance',
  'History',
  'Memoir',
  'Mystery',
  'Non-Fiction',
  'Philosophy',
  'Psychology',
  'Science',
  'Science Fiction',
  'Self-Help',
  'Technology',
  'Thriller',
  'Other',
];

/** Load custom categories saved by admin from localStorage */
function loadCustomFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Persist custom categories to localStorage */
function saveCustomToStorage(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/**
 * Merge built-in + custom categories into a deduplicated list.
 * Built-in categories come first, then alphabetically sorted custom ones.
 */
function mergeCategories(custom = []) {
  const builtinSet = new Set(BUILTIN_CATEGORIES.map((c) => c.toLowerCase()));
  const extra = (Array.isArray(custom) ? custom : []).filter(
    (c) => typeof c === 'string' && !builtinSet.has(c.toLowerCase())
  );
  return [...BUILTIN_CATEGORIES, ...extra.sort((a, b) => a.localeCompare(b))];
}

/**
 * Try to fetch categories from the backend.
 * Falls back to merged built-in + localStorage list if endpoint doesn't exist.
 */
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/books/categories');
      const serverList = response.data?.data || response.data || [];
      const validServerList = Array.isArray(serverList)
        ? serverList.map((c) => (typeof c === 'object' ? c.name : c)).filter(Boolean)
        : [];

      // Merge server list with built-ins for a complete list
      const all = [
        ...BUILTIN_CATEGORIES,
        ...validServerList.filter(
          (c) => !BUILTIN_CATEGORIES.map((b) => b.toLowerCase()).includes(c.toLowerCase())
        ),
      ];
      return { list: all, source: 'server' };
    } catch {
      // Backend endpoint not available — use localStorage fallback
      const custom = loadCustomFromStorage();
      return { list: mergeCategories(custom), source: 'local' };
    }
  }
);

/**
 * Create a new custom category.
 * Tries the backend first; on failure saves to localStorage.
 */
export const createCategory = createAsyncThunk(
  'categories/create',
  async (name, { rejectWithValue, getState }) => {
    const normalised = typeof name === 'string' ? name.trim() : '';
    if (!normalised) return rejectWithValue('Category name cannot be empty');

    // Check for duplicate (case-insensitive)
    const existing = getState().categories?.list || [];
    if (existing.some((c) => c.toLowerCase() === normalised.toLowerCase())) {
      return rejectWithValue(`"${normalised}" already exists`);
    }

    try {
      // Attempt backend save
      const response = await api.post('/books/categories', { name: normalised });
      const saved = response.data?.data?.name || response.data?.name || normalised;
      return { name: saved, source: 'server' };
    } catch {
      // Backend not available — persist locally
      const custom = loadCustomFromStorage();
      if (!custom.some((c) => c.toLowerCase() === normalised.toLowerCase())) {
        custom.push(normalised);
        saveCustomToStorage(custom);
      }
      return { name: normalised, source: 'local' };
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    list: mergeCategories(loadCustomFromStorage()),
    loading: false,
    createLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── fetchCategories ──────────────────────────────
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── createCategory ───────────────────────────────
      .addCase(createCategory.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.createLoading = false;
        const { name } = action.payload;
        if (!state.list.some((c) => c.toLowerCase() === name.toLowerCase())) {
          state.list.push(name);
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      });
  },
});

export default categoriesSlice.reducer;
