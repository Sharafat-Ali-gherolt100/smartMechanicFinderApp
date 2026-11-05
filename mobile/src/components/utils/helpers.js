export const formatDistance = (km) => {
  if (km == null || isNaN(km)) return 'N/A';
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${Number(km).toFixed(1)} km`;
};

export const formatETA = (minutes) => {
  if (minutes == null || isNaN(minutes)) return 'N/A';
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs}h ${mins}m`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
};

export default {
  formatDistance,
  formatETA,
  formatDate,
};
