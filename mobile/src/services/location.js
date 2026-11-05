/**
 * Barrel re-export for location service.
 * Also exposes pure utility helpers so screens can do:
 *   import { LocationService } from '../../services/location';
 *   LocationService.calculateDistance(...)
 */
export { LocationService, default } from '../components/services/location';

// ─── pure helpers (also available on LocationService object below) ───────────
const R = 6371; // km

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export function calculateETA(distanceKm, speedKmh = 30) {
  if (!distanceKm || distanceKm <= 0) return 0;
  return Math.round((distanceKm / speedKmh) * 60);
}

export function formatDistance(km) {
  if (km == null) return 'N/A';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatETA(minutes) {
  if (!minutes || minutes <= 0) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
