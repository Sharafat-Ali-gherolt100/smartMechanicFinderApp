import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';

const NetworkStatus = () => {
  const { colors } = useTheme();
  const [isConnected, setIsConnected] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected);
      
      Animated.timing(fadeAnim, {
        toValue: connected ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: colors.danger,
        },
      ]}
    >
      <Icon name="wifi-off" size={20} color="#fff" />
      <Text style={styles.text}>No internet connection</Text>
      <Text style={styles.subText}>Some features may not work</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  subText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 8,
  },
});

export default NetworkStatus;