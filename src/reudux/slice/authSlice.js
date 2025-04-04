// src/redux/slice/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async action to perform login
export const loginUser = createAsyncThunk(
  'auth/loginUser', // action type
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8003/v1/auth/guest-user/login', credentials); // Replace with your API endpoint
      // const response = await axios.post('/api/login', credentials); // Replace with your API endpoint
      console.log('Login response:', response.data); // Log the response for debugging
      return response.data; // Return user data if login is successful
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login failed'); // Handle errors
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null; // Reset error on new login attempt
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload; // Set user data upon successful login
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set error message on failure
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
