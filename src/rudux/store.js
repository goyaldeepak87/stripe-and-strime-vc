// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../features/auth/authSlice';
// import userReducer from '../features/user/userSlice';
// import productsReducer from '../features/products/productsSlice';
// import cartReducer from '../features/cart/cartSlice';

const store = configureStore({
  reducer: {
    // auth: authReducer,
    // user: userReducer,
    // products: productsReducer,
    // cart: cartReducer,
  },
});

export default store;
