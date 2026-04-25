import * as SecureStore from 'expo-secure-store';
import api from './api';

export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
  message: string;
}

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync('jwt_token', token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('jwt_token');
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync('jwt_token');
};

export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};

export const sendOtp = async (phone: string) => {
  try {
    const response = await api.post('/auth/send-otp', { phone });
    console.log('sendOtp success:', response.data);
    return response.data;
  } catch (err: any) {
    console.log('sendOtp error:', err.message);
    console.log('sendOtp error response:', JSON.stringify(err.response?.data));
    console.log('sendOtp status:', err.response?.status);
    throw err;
  }
};

export const verifyOtp = async (phone: string, otp: string) => {
  const response = await api.post<AuthResponse>('/auth/verify-otp', {
    phone,
    otp,
  });
  await saveToken(response.data.token);
  return response.data;
};

export const register = async (phone: string, role: string = 'RESIDENT') => {
  const response = await api.post<AuthResponse>('/auth/register', {
    phone,
    role,
  });
  await saveToken(response.data.token);
  return response.data;
};

export const logout = async () => {
  await removeToken();
};