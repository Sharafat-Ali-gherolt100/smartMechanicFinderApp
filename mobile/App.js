/**
 * GetFix — Root Application Component
 *
 * Wraps the app in all required providers then renders the navigator.
 * Provider order matters:
 *   ThemeProvider (no deps)
 *   → AuthProvider (no deps)
 *   → LocationProvider (reads AuthContext for user id)
 *   → AppNavigator (reads Auth + Location)
 */
import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';

// Suppress known non-critical warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed',
  'Sending `onAnimatedValueUpdate`',
  "[react-native-gesture-handler]",
]);

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <AppNavigator />
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
