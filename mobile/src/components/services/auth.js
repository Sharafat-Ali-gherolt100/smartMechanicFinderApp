import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from './api';

class AuthManager {
  constructor() {
    this.token = null;
    this.user = null;
    this.isLoading = true;
  }

  async init() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  isMechanic() {
    return this.user?.is_mechanic || false;
  }

  isAdmin() {
    return this.user?.is_admin || false;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  async login(email, password) {
    try {
      const response = await AuthService.login(email, password);
      this.token = response.access_token;
      this.user = response.user;
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await AuthService.logout();
      this.token = null;
      this.user = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async updateUser(userData) {
    try {
      const response = await AuthService.updateProfile(userData);
      this.user = response;
      await AsyncStorage.setItem('user_data', JSON.stringify(response));
      return response;
    } catch (error) {
      throw error;
    }
  }

  getRole() {
    if (this.isAdmin()) return 'admin';
    if (this.isMechanic()) return 'mechanic';
    return 'user';
  }
}

export const authManager = new AuthManager();