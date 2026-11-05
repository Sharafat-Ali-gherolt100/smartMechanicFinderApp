/**
 * Offline Cache Utility
 * Manages caching of data for offline mode functionality
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  USER_PROFILE: 'cache_user_profile',
  MECHANIC_LIST: 'cache_mechanic_list',
  VIDEOS: 'cache_videos',
  SOP_PRICING: 'cache_sop_pricing',
  SERVICE_HISTORY: 'cache_service_history',
  LAST_SEARCH_LOCATION: 'cache_last_search_location',
  CACHE_TIMESTAMP: 'cache_timestamp',
};

const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Save data to cache with timestamp
 */
export const saveToCache = async (key, data) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    console.log(`✅ Cached: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Cache save error for ${key}:`, error);
    return false;
  }
};

/**
 * Get data from cache (returns null if expired or not found)
 */
export const getFromCache = async (key, ignoreExpiry = false) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const cacheItem = JSON.parse(cached);
    
    // Check if cache is expired (unless ignoreExpiry is true)
    if (!ignoreExpiry) {
      const age = Date.now() - cacheItem.timestamp;
      if (age > CACHE_EXPIRY) {
        console.log(`⏰ Cache expired: ${key}`);
        await AsyncStorage.removeItem(key);
        return null;
      }
    }

    console.log(`✅ Cache hit: ${key}`);
    return cacheItem.data;
  } catch (error) {
    console.error(`❌ Cache read error for ${key}:`, error);
    return null;
  }
};

/**
 * Clear specific cache key
 */
export const clearCache = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`🗑️ Cleared cache: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Cache clear error for ${key}:`, error);
    return false;
  }
};

/**
 * Clear all cached data
 */
export const clearAllCache = async () => {
  try {
    const keys = Object.values(CACHE_KEYS);
    await AsyncStorage.multiRemove(keys);
    console.log('🗑️ All cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Clear all cache error:', error);
    return false;
  }
};

/**
 * Check if cache exists and is valid
 */
export const isCacheValid = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return false;

    const cacheItem = JSON.parse(cached);
    const age = Date.now() - cacheItem.timestamp;
    return age <= CACHE_EXPIRY;
  } catch (error) {
    return false;
  }
};

/**
 * Get cache age in hours
 */
export const getCacheAge = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const cacheItem = JSON.parse(cached);
    const ageInHours = (Date.now() - cacheItem.timestamp) / (1000 * 60 * 60);
    return Math.floor(ageInHours);
  } catch (error) {
    return null;
  }
};

// Specific cache methods for different data types

/**
 * Cache user profile
 */
export const cacheUserProfile = async (userData) => {
  return saveToCache(CACHE_KEYS.USER_PROFILE, userData);
};

export const getCachedUserProfile = async () => {
  return getFromCache(CACHE_KEYS.USER_PROFILE);
};

/**
 * Cache mechanic list
 */
export const cacheMechanicList = async (mechanics) => {
  return saveToCache(CACHE_KEYS.MECHANIC_LIST, mechanics);
};

export const getCachedMechanicList = async () => {
  return getFromCache(CACHE_KEYS.MECHANIC_LIST);
};

export const DEFAULT_BUNDLED_VIDEOS = [
  {
    _id: 'local_v1',
    title: 'Battery Jump Start Guide',
    description: 'Step-by-step video guide on how to safely jump start a car using another battery and jumper cables.',
    category: 'Battery',
    duration: 120,
    views: 245,
    file_url: '/api/videos/file/battery_jumpstart.mp4',
    filename: 'battery_jumpstart.mp4',
    icon_name: 'battery-charging-full',
    theme_color: '#e74c3c',
    is_offline_bundled: true,
  },
  {
    _id: 'local_v2',
    title: 'Radiator & Cooling Water Level Fix',
    description: 'Learn why radiator water level drops and how to check coolant and prevent engine overheating.',
    category: 'Engine',
    duration: 120,
    views: 189,
    file_url: '/api/videos/file/radiator_cooling_fix.mp4',
    filename: 'radiator_cooling_fix.mp4',
    icon_name: 'invert-colors',
    theme_color: '#3498db',
    is_offline_bundled: true,
  },
  {
    _id: 'local_v3',
    title: 'Dashboard Warning Lights & Diagnostics',
    description: 'Detailed guide explaining car dashboard warning lights, check engine icons, and troubleshooting steps.',
    category: 'Diagnostics',
    duration: 150,
    views: 312,
    file_url: '/api/videos/file/car_warning_lights.mp4',
    filename: 'car_warning_lights.mp4',
    icon_name: 'warning',
    theme_color: '#f39c12',
    is_offline_bundled: true,
  },
];

/**
 * Cache videos
 */
export const cacheVideos = async (videos) => {
  return saveToCache(CACHE_KEYS.VIDEOS, videos);
};

export const getCachedVideos = async () => {
  const cached = await getFromCache(CACHE_KEYS.VIDEOS);
  if (cached && cached.length > 0) return cached;
  return DEFAULT_BUNDLED_VIDEOS;
};

/**
 * Cache SOP pricing
 */
export const cacheSOPPricing = async (sopData) => {
  return saveToCache(CACHE_KEYS.SOP_PRICING, sopData);
};

export const getCachedSOPPricing = async () => {
  return getFromCache(CACHE_KEYS.SOP_PRICING);
};

/**
 * Cache service history
 */
export const cacheServiceHistory = async (history) => {
  return saveToCache(CACHE_KEYS.SERVICE_HISTORY, history);
};

export const getCachedServiceHistory = async () => {
  return getFromCache(CACHE_KEYS.SERVICE_HISTORY);
};

/**
 * Cache last search location
 */
export const cacheLastSearchLocation = async (location) => {
  return saveToCache(CACHE_KEYS.LAST_SEARCH_LOCATION, location);
};

export const getCachedLastSearchLocation = async () => {
  return getFromCache(CACHE_KEYS.LAST_SEARCH_LOCATION);
};

export default {
  CACHE_KEYS,
  saveToCache,
  getFromCache,
  clearCache,
  clearAllCache,
  isCacheValid,
  getCacheAge,
  cacheUserProfile,
  getCachedUserProfile,
  cacheMechanicList,
  getCachedMechanicList,
  cacheVideos,
  getCachedVideos,
  cacheSOPPricing,
  getCachedSOPPricing,
  cacheServiceHistory,
  getCachedServiceHistory,
  cacheLastSearchLocation,
  getCachedLastSearchLocation,
};
