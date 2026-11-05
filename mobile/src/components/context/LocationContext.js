import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { LocationService } from '../services/location';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  // ─── permission ────────────────────────────────────────────────────────────
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'GetFix needs your location to find nearby mechanics.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        setError('Permission error: ' + err.message);
        return false;
      }
    }
    return true; // iOS handled natively
  };

  // ─── one-shot position ──────────────────────────────────────────────────────
  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        // Fall back to Skardu city centre so the app is still usable
        const fallback = LocationService.getFallbackLocation();
        setLocation(fallback);
        setError('Location permission denied. Using default location (Skardu).');
        return fallback;
      }

      const pos = await LocationService.getCurrentPosition();
      const coords = { latitude: pos.latitude, longitude: pos.longitude };
      setLocation(coords);
      return coords;
    } catch (err) {
      // Any GPS error — fall back gracefully
      const fallback = LocationService.getFallbackLocation();
      setLocation(fallback);
      setError('GPS unavailable. Using default location (Skardu).');
      return fallback;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── continuous watch ───────────────────────────────────────────────────────
  const startWatchingLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      const id = LocationService.watchPosition(
        (position) => {
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        (err) => {
          console.warn('Location watch error:', err.message);
        },
      );
      watchIdRef.current = id;
    } catch (err) {
      console.warn('startWatchingLocation error:', err.message);
    }
  };

  const stopWatchingLocation = () => {
    if (watchIdRef.current != null) {
      LocationService.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const refreshLocation = async () => {
    setIsLoading(true);
    await getCurrentLocation();
    setIsLoading(false);
  };

  // ─── lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
        await getCurrentLocation();
      }
      if (isMounted) {
        await startWatchingLocation();
      }
    })();
    return () => {
      isMounted = false;
      stopWatchingLocation();
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        getCurrentLocation,
        startWatchingLocation,
        stopWatchingLocation,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
};
