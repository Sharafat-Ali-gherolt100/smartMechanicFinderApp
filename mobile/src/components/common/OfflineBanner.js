/**
 * OfflineBanner
 * Shows a persistent banner at the top of screens when the device is offline.
 * Displays cache age so the user knows how stale the data is.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OfflineBanner = ({ visible = false, cacheAge = null }) => {
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
      pointerEvents="none"
    >
      <Icon name="cloud-off" size={16} color="#fff" />
      <Text style={styles.text}>
        You are offline
        {cacheAge !== null ? ` • Cached ${cacheAge}h ago` : ' • Showing cached data'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#e67e22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default OfflineBanner;
