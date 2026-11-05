import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';

import DashboardScreen from '../../screens/mechanic/DashboardScreen';
import ProfileScreen from '../../screens/mechanic/ProfileScreen';
import ServicesScreen from '../../screens/mechanic/ServicesScreen';
import MechanicRatingsScreen from '../../screens/mechanic/MechanicRatingsScreen';
import MechanicRequestsScreen from '../../screens/mechanic/MechanicRequestsScreen';
import HistoryScreen from '../../screens/user/HistoryScreen';
import SOSScreen from '../../screens/user/SOSScreen';
import HomeScreen from '../../screens/user/HomeScreen';
import SOPScreen from '../../screens/user/SOPScreen';
import VideoLibraryScreen from '../../screens/user/VideoLibraryScreen';
import ChatListScreen from '../../screens/common/ChatListScreen';
import ChatDetailScreen from '../../screens/common/ChatDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DashStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MechanicDashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    <Stack.Screen name="MechanicProfile" component={ProfileScreen} options={{ title: 'Shop Profile' }} />
    <Stack.Screen name="MechanicServices" component={ServicesScreen} options={{ title: 'My Services' }} />
    <Stack.Screen name="MechanicHistory" component={HistoryScreen} options={{ title: 'Jobs' }} />
    <Stack.Screen name="MechanicSOS" component={SOSScreen} options={{ title: 'SOS Requests' }} />
    <Stack.Screen name="MechanicRatings" component={MechanicRatingsScreen} options={{ title: 'Reviews & Ratings' }} />
    <Stack.Screen name="MechanicRequests" component={MechanicRequestsScreen} options={{ title: 'Job Board' }} />
    <Stack.Screen name="SOP" component={SOPScreen} options={{ title: 'Pricing Guide' }} />
    <Stack.Screen name="VideoLibrary" component={VideoLibraryScreen} options={{ title: 'Videos' }} />
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: 'Chat with Customer' }} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages' }} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: 'Chat' }} />
  </Stack.Navigator>
);

const RequestsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MechanicRequests" component={MechanicRequestsScreen} options={{ title: 'Job Board' }} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: 'Chat with Customer' }} />
  </Stack.Navigator>
);

const MechanicNavigator = () => {
  const [needsStatusUpdate, setNeedsStatusUpdate] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        const cached = await AsyncStorage.getItem('mechanic_needs_status_update');
        if (mounted && cached === 'true') {
          setNeedsStatusUpdate(true);
        }

        const res = await api.get('/mechanic/offline-status-check');
        if (mounted && res.data) {
          const isNeeded = !!res.data.needs_status_update || !!res.data.offline_reminder_due;
          setNeedsStatusUpdate(isNeeded);
          await AsyncStorage.setItem('mechanic_needs_status_update', isNeeded ? 'true' : 'false');
        }
      } catch (e) {}
    };

    checkStatus();
    const interval = setInterval(checkStatus, 25000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            DashTab: 'dashboard',
            RequestsTab: 'assignment-ind',
            ChatTab: 'chat',
            ServicesTab: 'build',
            ProfileTab: 'person',
          };
          return <Icon name={iconMap[route.name] || 'dashboard'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#27ae60',
        tabBarInactiveTintColor: '#7f8c8d',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="DashTab"
        component={DashStack}
        options={{
          title: 'Dashboard',
          tabBarBadge: needsStatusUpdate ? '' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#e74c3c',
            width: 10,
            height: 10,
            minWidth: 10,
            borderRadius: 5,
            marginTop: 4,
          },
        }}
      />
      <Tab.Screen name="RequestsTab" component={RequestsStack} options={{ title: 'Job Board' }} />
      <Tab.Screen name="ChatTab" component={ChatStack} options={{ title: 'Messages' }} />
      <Tab.Screen name="ServicesTab" component={ServicesScreen} options={{ title: 'Services', headerShown: true }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile', headerShown: true }} />
    </Tab.Navigator>
  );
};

export default MechanicNavigator;
