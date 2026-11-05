import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const LoadingSkeleton = ({ width, height, borderRadius = 8, style }) => {
  const { colors } = useTheme();
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width || '100%',
          height: height || 20,
          borderRadius: borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const MechanicCardSkeleton = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <LoadingSkeleton height={20} width="60%" />
      <LoadingSkeleton height={14} width="40%" style={{ marginTop: 8 }} />
      <View style={styles.skeletonRow}>
        <LoadingSkeleton height={14} width="30%" />
        <LoadingSkeleton height={14} width="30%" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});

export default LoadingSkeleton;