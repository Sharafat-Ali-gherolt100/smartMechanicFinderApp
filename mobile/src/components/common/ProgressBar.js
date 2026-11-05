import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const ProgressBar = ({ progress, label, color }) => {
  const { colors } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress || 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              backgroundColor: color || colors.primary,
            },
          ]}
        />
      </View>
      <Text style={[styles.percentage, { color: colors.textSecondary }]}>
        {Math.round(progress || 0)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
});

export default ProgressBar;