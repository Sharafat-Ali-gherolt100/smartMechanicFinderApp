/**
 * Network Status Utility
 * Manages online/offline detection and callbacks
 */
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Check if device is currently online
 */
export const checkOnlineStatus = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected && netInfo.isInternetReachable !== false;
  } catch (error) {
    console.error('Network check error:', error);
    return false; // Assume offline if check fails
  }
};

/**
 * React hook for network status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Initial check
    checkOnlineStatus().then((status) => {
      setIsOnline(status);
      setIsChecking(false);
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setIsOnline(online);
      setIsChecking(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isOnline, isChecking };
};

/**
 * Subscribe to network changes
 */
export const subscribeToNetworkChanges = (callback) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    const online = state.isConnected && state.isInternetReachable !== false;
    callback(online);
  });
  
  return unsubscribe;
};

export default {
  checkOnlineStatus,
  useNetworkStatus,
  subscribeToNetworkChanges,
};
