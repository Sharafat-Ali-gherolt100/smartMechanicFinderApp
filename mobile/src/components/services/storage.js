import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage service wrapper around AsyncStorage with error handling
 */
export const StorageService = {
  /**
   * Store a value (automatically stringifies objects)
   */
  set: async (key, value) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error('Storage.set error:', error);
      return false;
    }
  },

  /**
   * Retrieve a value (automatically parses JSON if possible)
   */
  get: async (key, defaultValue = null) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return defaultValue;
      
      // Try to parse as JSON, fall back to raw string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Storage.get error:', error);
      return defaultValue;
    }
  },

  /**
   * Remove a single item
   */
  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage.remove error:', error);
      return false;
    }
  },

  /**
   * Clear all storage (use with caution)
   */
  clear: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage.clear error:', error);
      return false;
    }
  },

  /**
   * Get all keys
   */
  getAllKeys: async () => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage.getAllKeys error:', error);
      return [];
    }
  },

  /**
   * Get multiple items at once
   */
  multiGet: async (keys) => {
    try {
      const results = await AsyncStorage.multiGet(keys);
      return results.map(([key, value]) => ({
        key,
        value: value ? ((() => { try { return JSON.parse(value); } catch { return value; } })()) : null,
      }));
    } catch (error) {
      console.error('Storage.multiGet error:', error);
      return [];
    }
  },

  /**
   * Set multiple items at once
   */
  multiSet: async (keyValuePairs) => {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Storage.multiSet error:', error);
      return false;
    }
  },

  /**
   * Remove multiple items at once
   */
  multiRemove: async (keys) => {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Storage.multiRemove error:', error);
      return false;
    }
  },
};

export default StorageService;
