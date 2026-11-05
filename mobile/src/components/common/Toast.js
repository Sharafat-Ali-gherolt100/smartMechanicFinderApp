import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';

export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

const Toast = ({ visible, message, type = ToastType.INFO, duration = 3000, onHide }) => {
  const { colors } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getIcon = () => {
    switch (type) {
      case ToastType.SUCCESS:
        return 'check-circle';
      case ToastType.ERROR:
        return 'error';
      case ToastType.WARNING:
        return 'warning';
      default:
        return 'info';
    }
  };

  const getColor = () => {
    switch (type) {
      case ToastType.SUCCESS:
        return '#2ecc71';
      case ToastType.ERROR:
        return '#e74c3c';
      case ToastType.WARNING:
        return '#f39c12';
      default:
        return '#3498db';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.card,
          borderLeftColor: getColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <Icon name={getIcon()} size={24} color={getColor()} style={styles.icon} />
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      </View>
      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <Icon name="close" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;