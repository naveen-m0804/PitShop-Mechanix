import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchNearbyShops = createAsyncThunk(
  'shops/fetchNearbyShops',
  async ({ lat, lng, radius = 20000, type = null }, { rejectWithValue }) => {
    try {
      const params = { lat, lng, radius };
      if (type) params.shopType = type;
      const response = await api.get('/client/nearby-shops', { params });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch shops');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  nearbyShops: [],
  allShops: [],
  selectedShop: null,
  viewMode: 'list', // 'list' or 'map'
  filter: {
    shopType: null,
    radius: 20000, // 20km in meters
  },
  loading: false,
  error: null,
};

const shopsSlice = createSlice({
  name: 'shops',
  initialState,
  reducers: {
    setNearbyShops: (state, action) => {
      state.nearbyShops = action.payload;
      state.loading = false;
    },
    setAllShops: (state, action) => {
      state.allShops = action.payload;
      state.loading = false;
    },
    setSelectedShop: (state, action) => {
      state.selectedShop = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyShops.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyShops = action.payload;
      })
      .addCase(fetchNearbyShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setNearbyShops,
  setAllShops,
  setSelectedShop,
  setViewMode,
  setFilter,
  setLoading,
  setError,
} = shopsSlice.actions;

export default shopsSlice.reducer;
