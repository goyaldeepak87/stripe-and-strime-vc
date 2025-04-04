// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/reudux/slice/authSlice'; // Ensure the correct import path

const store = configureStore({
  reducer: {
    auth: authReducer, // Here, 'auth' is the key for the authSlice in the state
  },
});

export default store;
