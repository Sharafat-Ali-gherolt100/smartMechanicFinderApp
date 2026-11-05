import NetInfo from '@react-native-community/netinfo';
import StorageService from './storage';

const OFFLINE_QUEUE_KEY = '@offline_queue';

/**
 * Offline service for managing network status and queuing requests
 */
export const OfflineService = {
  /**
   * Check if device is currently online
   */
  isOnline: async () => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable !== false;
    } catch (error) {
      console.error('OfflineService.isOnline error:', error);
      return false;
    }
  },

  /**
   * Subscribe to network status changes
   * @param {Function} callback - Called with boolean online status
   * @returns {Function} unsubscribe function
   */
  subscribe: (callback) => {
    return NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable !== false;
      callback(isOnline);
    });
  },

  /**
   * Add a request to the offline queue
   * @param {Object} request - { url, method, data, headers, timestamp }
   */
  queueRequest: async (request) => {
    try {
      const queue = await StorageService.get(OFFLINE_QUEUE_KEY, []);
      const newRequest = {
        ...request,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      queue.push(newRequest);
      await StorageService.set(OFFLINE_QUEUE_KEY, queue);
      return newRequest.id;
    } catch (error) {
      console.error('OfflineService.queueRequest error:', error);
      return null;
    }
  },

  /**
   * Get all queued requests
   */
  getQueue: async () => {
    try {
      return await StorageService.get(OFFLINE_QUEUE_KEY, []);
    } catch (error) {
      console.error('OfflineService.getQueue error:', error);
      return [];
    }
  },

  /**
   * Remove a request from the queue
   */
  removeFromQueue: async (requestId) => {
    try {
      const queue = await StorageService.get(OFFLINE_QUEUE_KEY, []);
      const filtered = queue.filter(req => req.id !== requestId);
      await StorageService.set(OFFLINE_QUEUE_KEY, filtered);
      return true;
    } catch (error) {
      console.error('OfflineService.removeFromQueue error:', error);
      return false;
    }
  },

  /**
   * Clear all queued requests
   */
  clearQueue: async () => {
    try {
      await StorageService.set(OFFLINE_QUEUE_KEY, []);
      return true;
    } catch (error) {
      console.error('OfflineService.clearQueue error:', error);
      return false;
    }
  },

  /**
   * Process the offline queue (call when back online)
   * @param {Function} requestHandler - Function that processes each request
   * @returns {Object} { successful: number, failed: number, errors: [] }
   */
  processQueue: async (requestHandler) => {
    try {
      const queue = await OfflineService.getQueue();
      if (queue.length === 0) {
        return { successful: 0, failed: 0, errors: [] };
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [],
      };

      for (const request of queue) {
        try {
          await requestHandler(request);
          await OfflineService.removeFromQueue(request.id);
          results.successful++;
        } catch (error) {
          console.error('Failed to process queued request:', error);
          results.failed++;
          results.errors.push({
            requestId: request.id,
            error: error.message || 'Unknown error',
          });
          // Don't remove failed requests - keep them for retry
        }
      }

      return results;
    } catch (error) {
      console.error('OfflineService.processQueue error:', error);
      return { successful: 0, failed: 0, errors: [error.message] };
    }
  },

  /**
   * Get queue size
   */
  getQueueSize: async () => {
    try {
      const queue = await StorageService.get(OFFLINE_QUEUE_KEY, []);
      return queue.length;
    } catch (error) {
      console.error('OfflineService.getQueueSize error:', error);
      return 0;
    }
  },
};

export default OfflineService;
