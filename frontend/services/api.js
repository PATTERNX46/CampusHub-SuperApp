import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// WARNING: Change this to your computer's Wi-Fi IP address!
// Example: 'http://192.168.29.15:5000/api'
const API_URL = 'https://campushub-superapp.onrender.com/api'; 

const api = axios.create({
  baseURL: API_URL,
});

// প্রতিটা API কলের সাথে Token পাঠানোর ব্যবস্থা
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;