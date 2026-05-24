import api from './api';
import { saveTokens, removeToken, getRefreshToken } from './auth';
import { AuthResponse } from './auth';

// Send OTP
export const sendOtp = async (phone: string) => {
  const response = await api.post('/auth/send-otp', { phone });
  return response.data;
};

// Verify OTP
export const verifyOtp = async (phone: string, otp: string) => {
  const response = await api.post<AuthResponse>('/auth/verify-otp', {
    phone,
    otp,
  });
  await saveTokens(response.data.token, response.data.refreshToken);
  return response.data;
};

// Register
export const register = async (phone: string, role: string = 'RESIDENT') => {
  const response = await api.post<AuthResponse>('/auth/register', {
    phone,
    role,
  });
  await saveTokens(response.data.token, response.data.refreshToken);
  return response.data;
};

// Refresh access token
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    await saveTokens(response.data.token, response.data.refreshToken);
    return response.data.token;
  } catch (err) {
    console.log('Token refresh failed:', err);
    await removeToken();
    return null;
  }
};

// Logout — revoke refresh token on server
export const logoutApi = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.log('Logout API error:', err);
  }
};