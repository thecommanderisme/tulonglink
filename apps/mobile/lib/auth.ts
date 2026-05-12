import * as SecureStore from 'expo-secure-store';

export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
  message: string;
  refreshToken: string;
}

const JWT_KEY = 'jwt_token';
const REFRESH_KEY = 'refresh_token';

// Save both tokens
export const saveTokens = async (token: string, refreshToken: string) => {
  await SecureStore.setItemAsync(JWT_KEY, token);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
};

// Save single token (backward compatibility)
export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync(JWT_KEY, token);
};

// Get JWT token
export const getToken = async () => {
  return await SecureStore.getItemAsync(JWT_KEY);
};

// Get refresh token
export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync(REFRESH_KEY);
};

// Remove both tokens (logout)
export const removeToken = async () => {
  await SecureStore.deleteItemAsync(JWT_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
};

// Check if user is logged in
export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};

// Logout
export const logout = async () => {
  await removeToken();
};