import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationService } from './location';

const CACHE_KEY = 'cached_mechanics';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const MechanicService = {
  getNearbyMechanics: async (latitude, longitude, maxDistance = 50) => {
    try {
      const response = await api.get('/mechanics/nearby', {
        params: { latitude, longitude, max_distance: maxDistance }
      });
      
      // Cache the results
      await MechanicService.cacheMechanics(response.data.mechanics);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby mechanics:', error);
      
      // Try to get cached data if offline
      const cached = await MechanicService.getCachedMechanics();
      if (cached && cached.length > 0) {
        return { mechanics: cached, count: cached.length, fromCache: true };
      }
      
      throw error;
    }
  },

  getMechanicDetails: async (mechanicId) => {
    try {
      const response = await api.get(`/mechanics/${mechanicId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mechanic details:', error);
      throw error;
    }
  },

  updateMechanicStatus: async (status) => {
    try {
      const response = await api.put('/mechanics/status', { status });
      return response.data;
    } catch (error) {
      console.error('Error updating mechanic status:', error);
      throw error;
    }
  },

  // Alias used by DashboardScreen
  updateStatus: async (status) => MechanicService.updateMechanicStatus(status),

  updateMechanicServices: async (services) => {
    try {
      const response = await api.put('/mechanics/services', { services });
      return response.data;
    } catch (error) {
      console.error('Error updating mechanic services:', error);
      throw error;
    }
  },

  updateServices: async (services) => MechanicService.updateMechanicServices(services),

  cacheMechanics: async (mechanics) => {
    try {
      const cacheData = {
        timestamp: Date.now(),
        mechanics: mechanics
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching mechanics:', error);
    }
  },

  getCachedMechanics: async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - data.timestamp < CACHE_EXPIRY) {
          return data.mechanics;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached mechanics:', error);
      return null;
    }
  },

  filterMechanics: (mechanics, filters) => {
    let filtered = [...mechanics];

    // Filter by service type
    if (filters.service) {
      filtered = filtered.filter(m => 
        m.services && m.services.some(s => 
          s.toLowerCase().includes(filters.service.toLowerCase())
        )
      );
    }

    // Filter by max distance
    if (filters.maxDistance) {
      filtered = filtered.filter(m => m.distance <= filters.maxDistance);
    }

    // Filter by rating
    if (filters.minRating) {
      filtered = filtered.filter(m => m.rating_average >= filters.minRating);
    }

    // Filter by availability
    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    return filtered;
  },

  sortMechanics: (mechanics, sortBy = 'distance') => {
    const sorted = [...mechanics];
    
    switch (sortBy) {
      case 'distance':
        sorted.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
        break;
      case 'name':
        sorted.sort((a, b) => a.shop_name.localeCompare(b.shop_name));
        break;
      case 'response_time':
        sorted.sort((a, b) => (a.response_time || 999) - (b.response_time || 999));
        break;
      default:
        break;
    }
    
    return sorted;
  },

  getMechanicWithDetails: async (mechanicId) => {
    try {
      const response = await api.get(`/mechanics/${mechanicId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mechanic details:', error);
      throw error;
    }
  },

  reportMechanic: async (mechanicId, reason) => {
    try {
      const response = await api.post('/report', { mechanic_id: mechanicId, reason });
      return response.data;
    } catch (error) {
      console.error('Error reporting mechanic:', error);
      throw error;
    }
  },
};