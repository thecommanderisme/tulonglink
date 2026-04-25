import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Change this to your Mac's IP address
const BASE_URL = 'https://audacity-bobbed-gratify.ngrok-free.dev';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30000, // increased to 30 seconds
});
console.log('API BASE_URL:', BASE_URL);

// Automatically attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('jwt_token');
    }
    return Promise.reject(error);
  }
);

export default api;