import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * API base URL configuration for Windows + Android:
 * - Android emulator: 10.0.2.2 maps to the host machine's localhost
 * - Physical device (USB / same Wi-Fi): use your PC LAN IP (see SETUP.md)
 *
 * Override by editing API_HOST below, or set in .env as API_HOST.
 */
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

// Physical device on this network: set to your Wi-Fi IP, e.g. '192.168.100.102'
// Leave null to use emulator-friendly DEFAULT_HOST.
const PHYSICAL_DEVICE_HOST = '192.168.100.115';

// Prefer physical LAN IP when developing against a real phone; emulator can use 10.0.2.2.
// Change USE_PHYSICAL_DEVICE_IP to false when using the Android Emulator only.
const USE_PHYSICAL_DEVICE_IP = true;

const API_HOST = USE_PHYSICAL_DEVICE_IP && PHYSICAL_DEVICE_HOST
  ? PHYSICAL_DEVICE_HOST
  : DEFAULT_HOST;

// Render live production URL:
export const PRODUCTION_RENDER_URL = 'https://smart-mechanics-finder-backend.onrender.com/api';

export const API_BASE_URL =
  PRODUCTION_RENDER_URL ||
  (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) ||
  `http://${API_HOST}:5000/api`;


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      try {
        const NetInfo = require('@react-native-community/netinfo').default;
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          config.headers['X-Offline'] = 'true';
        }
      } catch (_) {
        // NetInfo optional
      }

      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('user_data');
      }
      return Promise.reject(data || error.response);
    }
    if (error.request) {
      return Promise.reject({
        error: `Network error. Cannot reach ${API_BASE_URL}. Check backend and API_HOST.`,
      });
    }
    return Promise.reject({ error: error.message });
  },
);

export const AuthService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user_data');
  },
};

export const LocationService = {
  updateLocation: async (latitude, longitude) => {
    const response = await api.put('/auth/profile', { latitude, longitude });
    return response.data;
  },
};

export const MechanicService = {
  updateStatus: async (status) => {
    const response = await api.put('/mechanics/status', { status });
    return response.data;
  },

  updateServices: async (services) => {
    const response = await api.put('/mechanics/services', { services });
    return response.data;
  },
};

export { api };
export default api;
