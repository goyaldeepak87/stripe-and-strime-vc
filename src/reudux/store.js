// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Uses localStorage by default
import authReducer from '@/reudux/slice/authSlice';

const persistConfig = {
  key: 'root', // The key under which the state will be stored
  storage, // Default is localStorage
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedReducer, // Use the persisted reducer
  },
});

const persistor = persistStore(store); // Create persistor to persist store

export { store, persistor };
