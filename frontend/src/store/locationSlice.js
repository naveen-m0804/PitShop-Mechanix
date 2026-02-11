import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentLocation: null,
    error: null,
    loading: true,
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setLocation: (state, action) => {
            state.currentLocation = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLocationError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setLocation, setLocationError, setLoading } = locationSlice.actions;
export default locationSlice.reducer;
