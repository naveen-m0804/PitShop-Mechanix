import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import shopsReducer from './shopsSlice';
import requestsReducer from './requestsSlice';
import locationReducer from './locationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shops: shopsReducer,
    requests: requestsReducer,
    location: locationReducer,
  },
});
