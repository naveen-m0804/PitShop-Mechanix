import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mechanicsApi } from '../lib/api';

export const fetchNearbyShops = createAsyncThunk(
  'shops/fetchNearbyShops',
  async ({ lat, lng, radius = 20000, type = null }, { rejectWithValue }) => {
    try {
      // mechanicsApi uses radius in KM. The input here seems to be in meters (default 20000).
      // MapView passes 5000000 (5000km).
      const radiusKm = radius > 1000 ? radius / 1000 : radius;
      
      const data = await mechanicsApi.getNearby(lat, lng, radiusKm, type);
      return data; // mechanicsApi.getNearby already returns the data array
    } catch (error) {
       console.error('Fetch shops error:', error);
       return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch shops');
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
