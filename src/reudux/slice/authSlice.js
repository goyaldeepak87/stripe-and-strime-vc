// src/redux/slice/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // User data
    isAuthenticated: false, // Whether the user is logged in or not
    loading: false, // Loading state
    error: null, // Error state for login failures
  },
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.error = null; // Reset error on new login attempt
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload; // Set user data upon successful login
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload; // Set error message
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null; // Clear user data upon logout
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
