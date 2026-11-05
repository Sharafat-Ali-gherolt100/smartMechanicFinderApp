import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Correct relative path: components/context → components/styles
import { Colors } from '../styles/colors';

const ThemeContext = createContext(null);

const STORAGE_KEY = '@smf_theme';

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else {
        setTheme(systemScheme === 'dark' ? 'dark' : 'light');
      }
    } catch (e) {
      setTheme('light');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      console.warn('Failed to persist theme:', e);
    }
  };

  const setThemeExplicit = async (t) => {
    if (t !== 'light' && t !== 'dark') return;
    setTheme(t);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, t);
    } catch (e) {
      console.warn('Failed to persist theme:', e);
    }
  };

  const colors = Colors[theme] || Colors.light;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme: setThemeExplicit, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
