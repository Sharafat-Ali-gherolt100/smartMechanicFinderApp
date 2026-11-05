import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import MechanicNavigator from './MechanicNavigator';
import AdminNavigator from './AdminNavigator';
import { View, ActivityIndicator } from 'react-native';

const AppNavigator = () => {
  const { isAuthenticated, isLoading, getRole } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const role = isAuthenticated ? getRole() : null;

  return (
    <NavigationContainer>
      {!isAuthenticated && <AuthNavigator />}
      {isAuthenticated && role === 'admin' && <AdminNavigator />}
      {isAuthenticated && role === 'mechanic' && <MechanicNavigator />}
      {isAuthenticated && role === 'user' && <UserNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
