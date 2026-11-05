/**
 * SmartMapView
 *
 * Renders react-native-maps when a real Google Maps API key is configured.
 * Falls back to an OpenStreetMap (Leaflet) WebView when:
 *  - The API key is still the placeholder "YOUR_API_KEY_HERE"
 *  - The native MapView fires onError (e.g. billing not enabled)
 *  - The mapError state is set to true for any reason
 *
 * Usage is identical to the previous version — just drop in <SmartMapView />.
 */
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ─── API key detection ──────────────────────────────────────────────────────
// Read from NativeModules meta-data (injected by react-native-maps) or fall
// back to the well-known placeholder string. We never hardcode the key here.
const MAPS_API_KEY = (() => {
  try {
    // react-native-maps exposes this on Android via NativeModules
    const { AirMapModule } = require('react-native').NativeModules;
    return AirMapModule?.apiKey || 'YOUR_API_KEY_HERE';
  } catch {
    return 'YOUR_API_KEY_HERE';
  }
})();

const HAS_REAL_API_KEY =
  typeof MAPS_API_KEY === 'string' &&
  MAPS_API_KEY.length > 10 &&
  MAPS_API_KEY !== 'YOUR_API_KEY_HERE';

const DEFAULT_REGION = {
  latitude: 35.2973,
  longitude: 75.6333,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// ─── OpenStreetMap fallback (Leaflet in WebView) ────────────────────────────
const buildLeafletHTML = (lat, lng, latDelta, lngDelta, markers) => {
  const zoom = latDelta < 0.02 ? 15 : latDelta < 0.1 ? 13 : 11;

  const markerJS = markers
    .slice(0, 20)
    .map((m) => {
      const color = m.status === 'open' ? '#2ecc71' : '#e74c3c';
      const label = (m.shop_name || 'Mechanic').replace(/'/g, "\\'");
      const addr = (m.address || '').replace(/'/g, "\\'");
      return `
        L.circleMarker([${parseFloat(m.latitude)}, ${parseFloat(m.longitude)}], {
          radius: 10, color: '${color}', fillColor: '${color}',
          fillOpacity: 0.9, weight: 2
        }).bindPopup('<b>${label}</b><br>${addr}').addTo(map);
      `;
    })
    .join('\n');

  const userMarkerJS =
    markers.length === 0
      ? `L.circleMarker([${lat}, ${lng}], {
          radius: 8, color: '#3498db', fillColor: '#3498db',
          fillOpacity: 0.9, weight: 2
        }).bindPopup('You are here').addTo(map);`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: true })
               .setView([${lat}, ${lng}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    ${markerJS}
    ${userMarkerJS}
  </script>
</body>
</html>`;
};

// ─── Component ───────────────────────────────────────────────────────────────
const SmartMapView = ({
  region,
  initialRegion,
  markers = [],
  onMarkerPress,
  showsUserLocation = true,
  style,
  scrollEnabled = true,
  zoomEnabled = true,
  children,
  mapRef: customMapRef,
  ...props
}) => {
  // Start in fallback mode immediately if no real API key
  const [mapError, setMapError] = useState(!HAS_REAL_API_KEY);
  const internalMapRef = useRef(null);
  const mapRef = customMapRef || internalMapRef;

  const activeRegion = region || initialRegion || DEFAULT_REGION;

  const handleMapError = (e) => {
    console.warn('SmartMapView: native map error, switching to OSM fallback.', e);
    setMapError(true);
  };

  const handleRecenter = () => {
    if (!mapError && mapRef.current) {
      mapRef.current.animateToRegion(activeRegion, 500);
    }
  };

  const leafletHTML = buildLeafletHTML(
    activeRegion.latitude,
    activeRegion.longitude,
    activeRegion.latitudeDelta,
    activeRegion.longitudeDelta,
    markers
  );

  return (
    <View style={[styles.container, style]}>
      {mapError ? (
        /* ── OpenStreetMap via Leaflet WebView ─────────────────────────── */
        <WebView
          source={{ html: leafletHTML }}
          style={styles.map}
          scrollEnabled={scrollEnabled}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
          originWhitelist={['*']}
          // Disable overscroll so the WebView doesn't steal scroll gestures
          // from the parent ScrollView when embedded in a 250 px container
          bounces={false}
          overScrollMode="never"
        />
      ) : (
        /* ── Native react-native-maps (requires a real API key on Android) */
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}          // no PROVIDER_GOOGLE = avoids blank tiles
          initialRegion={activeRegion}
          region={region}
          showsUserLocation={showsUserLocation}
          showsMyLocationButton={false}
          showsCompass
          showsScale
          scrollEnabled={scrollEnabled}
          zoomEnabled={zoomEnabled}
          onError={handleMapError}
          {...props}
        >
          {markers.map((m, idx) => {
            const key = m._id || m.id || `marker-${idx}`;
            const pinColor = m.pinColor || (m.status === 'open' ? '#2ecc71' : '#e74c3c');
            return (
              <Marker
                key={key}
                coordinate={{
                  latitude: parseFloat(m.latitude),
                  longitude: parseFloat(m.longitude),
                }}
                title={m.shop_name || m.title || 'Mechanic'}
                description={m.address || m.description || ''}
                pinColor={pinColor}
                onPress={() => onMarkerPress && onMarkerPress(m)}
              >
                <View style={styles.customMarkerContainer}>
                  <View style={[styles.markerPin, { backgroundColor: pinColor }]}>
                    <Icon name="build" size={14} color="#fff" />
                  </View>
                </View>
              </Marker>
            );
          })}
          {children}
        </MapView>
      )}

      {/* Recenter button – shown for both map types */}
      <View style={styles.controlsOverlay}>
        <TouchableOpacity style={styles.controlBtn} onPress={handleRecenter}>
          <Icon name="my-location" size={20} color="#2c3e50" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#e8f0fe',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default SmartMapView;
