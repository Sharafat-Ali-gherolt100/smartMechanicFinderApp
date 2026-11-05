import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';

const EmptyState = ({ icon, title, subtitle, children }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {icon ? (
        <Icon name={icon} size={80} color={colors.textSecondary} />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: colors.border }]} />
      )}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});

export default EmptyState;