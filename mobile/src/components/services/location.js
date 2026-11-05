import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

// Optional reverse geocoding — works without a Maps API key
let Geocoder = null;
try {
  Geocoder = require('react-native-geocoding').default;
  const key = process.env.GOOGLE_MAPS_API_KEY || '';
  if (key && Geocoder) {
    Geocoder.init(key);
  }
} catch (_) {
  Geocoder = null;
}

export const LocationService = {
  requestPermission: async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'GetFix needs access to your location to find nearby mechanics.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  },

  getCurrentPosition: async () => {
    const hasPermission = await LocationService.requestPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  },

  watchPosition: (callback, errorCallback) => {
    return Geolocation.watchPosition(callback, errorCallback, {
      enableHighAccuracy: true,
      distanceFilter: 50,
      interval: 30000,
      fastestInterval: 10000,
    });
  },

  clearWatch: (watchId) => {
    if (watchId) {
      Geolocation.clearWatch(watchId);
    }
  },

  reverseGeocode: async (latitude, longitude) => {
    if (!Geocoder) {
      return {
        formatted_address: 'Skardu, Gilgit-Baltistan',
        city: 'Skardu',
        country: 'Pakistan',
      };
    }
    try {
      const response = await Geocoder.from(latitude, longitude);
      const result = response.results[0];
      return {
        formatted_address: result?.formatted_address || 'Skardu, Gilgit-Baltistan',
        city:
          result?.address_components?.find((c) =>
            c.types.includes('locality'),
          )?.long_name || 'Skardu',
        country:
          result?.address_components?.find((c) =>
            c.types.includes('country'),
          )?.long_name || 'Pakistan',
      };
    } catch (error) {
      return {
        formatted_address: 'Skardu, Gilgit-Baltistan',
        city: 'Skardu',
        country: 'Pakistan',
      };
    }
  },

  // Skardu city center fallback when GPS unavailable
  getFallbackLocation: () => ({
    latitude: 35.2973,
    longitude: 75.6333,
  }),
};

export default LocationService;

// ─── pure distance/ETA helpers attached to the service object ────────────────
const _R = 6371;

LocationService.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return _R * 2 * Math.asin(Math.sqrt(a));
};

LocationService.calculateETA = (distanceKm, speedKmh = 30) => {
  if (!distanceKm || distanceKm <= 0) return 0;
  return Math.round((distanceKm / speedKmh) * 60);
};

LocationService.formatDistance = (km) => {
  if (km == null) return 'N/A';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

LocationService.formatETA = (minutes) => {
  if (!minutes || minutes <= 0) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};
