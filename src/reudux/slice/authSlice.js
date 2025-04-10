// src/redux/slice/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async action to perform login
export const loginUser = createAsyncThunk(
  'auth/loginUser', // action type
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:4000/v1/auth/guest-user/login', credentials); // Replace with your API endpoint
      // const response = await axios.post('/api/login', credentials); // Replace with your API endpoint
      localStorage.setItem('token', response.data.data.result.token.access.token); // Store token in local storage
      return response.data; // Return user data if login is successful
    } catch (error) {
      // console.error('Login error:', error.response || error.message); // Log the error
      if (error.response && error.response.data) {
        // console.log("error.response.data", error.response.data)
        return rejectWithValue(error.response.data); // Return API error message
      }
      return rejectWithValue({ message: 'Network error. Please try again.' }); // Handle network errors
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    paymentStatus: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.paymentStatus = null;
      state.loading = false;
      localStorage.removeItem('token'); // Remove token from local storage on logout
    },
    updatePaymentStatus(state, action) {
      state.paymentStatus = action.payload; // Update payment status
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
        state.paymentStatus = action.payload.data.result.user.guestUser.payment_status; // Set payment status if available
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set error message on failure
      });
  },
});

export const { logout, updatePaymentStatus } = authSlice.actions;

export default authSlice.reducer;
