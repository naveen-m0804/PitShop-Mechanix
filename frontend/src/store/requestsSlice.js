import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pendingRequests: [],
  acceptedRequests: [],
  completedRequests: [],
  activeTracking: null, // Currently tracked request
  loading: false,
  error: null,
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setPendingRequests: (state, action) => {
      state.pendingRequests = action.payload;
    },
    setAcceptedRequests: (state, action) => {
      state.acceptedRequests = action.payload;
    },
    setCompletedRequests: (state, action) => {
      state.completedRequests = action.payload;
    },
    addRequest: (state, action) => {
      state.pendingRequests.push(action.payload);
    },
    updateRequestStatus: (state, action) => {
      const { requestId, status } = action.payload;
      
      // Remove from pending
      state.pendingRequests = state.pendingRequests.filter(r => r.id !== requestId);
      
      // Add to appropriate list based on status
      if (status === 'ACCEPTED') {
        const request = action.payload.request;
        state.acceptedRequests.push(request);
      } else if (status === 'COMPLETED') {
        const request = action.payload.request;
        state.completedRequests.push(request);
        state.acceptedRequests = state.acceptedRequests.filter(r => r.id !== requestId);
      }
    },
    setActiveTracking: (state, action) => {
      state.activeTracking = action.payload;
    },
    clearActiveTracking: (state) => {
      state.activeTracking = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPendingRequests,
  setAcceptedRequests,
  setCompletedRequests,
  addRequest,
  updateRequestStatus,
  setActiveTracking,
  clearActiveTracking,
  setLoading,
  setError,
} = requestsSlice.actions;

export default requestsSlice.reducer;
