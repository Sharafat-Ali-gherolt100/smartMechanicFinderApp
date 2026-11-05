import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../../screens/user/HomeScreen';
import MechanicSearchScreen from '../../screens/user/MechanicSearchScreen';
import MechanicDetailScreen from '../../screens/user/MechanicDetailScreen';
import RatingScreen from '../../screens/user/RatingScreen';
import HistoryScreen from '../../screens/user/HistoryScreen';
import VideoLibraryScreen from '../../screens/user/VideoLibraryScreen';
import VideoPlayerScreen from '../../screens/user/VideoPlayerScreen';
import SOPScreen from '../../screens/user/SOPScreen';
import SOSScreen from '../../screens/user/SOSScreen';
import EmergencyAlertScreen from '../../screens/user/EmergencyAlertScreen';
import CreateServiceRequestScreen from '../../screens/user/CreateServiceRequestScreen';
import UserServiceRequestsScreen from '../../screens/user/UserServiceRequestsScreen';
import ChatListScreen from '../../screens/common/ChatListScreen';
import ChatDetailScreen from '../../screens/common/ChatDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Screens shared across multiple stacks (chat + service requests)
const sharedScreens = (
  <>
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: 'Chat' }} />
    <Stack.Screen name="CreateServiceRequest" component={CreateServiceRequestScreen} options={{ title: 'Request Service' }} />
    <Stack.Screen name="UserServiceRequests" component={UserServiceRequestsScreen} options={{ title: 'My Requests' }} />
  </>
);

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MechanicSearch" component={MechanicSearchScreen} options={{ title: 'Find Mechanics' }} />
    <Stack.Screen name="MechanicDetail" component={MechanicDetailScreen} options={{ title: 'Mechanic Details' }} />
    <Stack.Screen name="Rating" component={RatingScreen} options={{ title: 'Rate Mechanic' }} />
    <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Service History' }} />
    <Stack.Screen name="VideoLibrary" component={VideoLibraryScreen} options={{ title: 'Video Library' }} />
    <Stack.Screen
      name="VideoPlayer"
      component={VideoPlayerScreen}
      options={{ headerShown: false, orientation: 'landscape' }}
    />
    <Stack.Screen name="SOP" component={SOPScreen} options={{ title: 'Standard Pricing' }} />
    <Stack.Screen name="SOS" component={SOSScreen} options={{ title: 'Emergency SOS' }} />
    <Stack.Screen name="EmergencyAlert" component={EmergencyAlertScreen} options={{ title: 'Emergency Alert' }} />
    {sharedScreens}
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MechanicSearch" component={MechanicSearchScreen} options={{ title: 'Find Mechanics' }} />
    <Stack.Screen name="MechanicDetail" component={MechanicDetailScreen} options={{ title: 'Mechanic Details' }} />
    <Stack.Screen name="Rating" component={RatingScreen} options={{ title: 'Rate Mechanic' }} />
    {sharedScreens}
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Service History' }} />
    <Stack.Screen name="Rating" component={RatingScreen} options={{ title: 'Rate Mechanic' }} />
    {sharedScreens}
  </Stack.Navigator>
);

const SOSStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="SOS" component={SOSScreen} options={{ title: 'Emergency SOS' }} />
    <Stack.Screen name="EmergencyAlert" component={EmergencyAlertScreen} options={{ title: 'Emergency Alert' }} />
    {sharedScreens}
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
    <Stack.Screen name="UserServiceRequests" component={UserServiceRequestsScreen} options={{ title: 'My Requests' }} />
    <Stack.Screen name="CreateServiceRequest" component={CreateServiceRequestScreen} options={{ title: 'Request Service' }} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: 'Chat with Mechanic' }} />
  </Stack.Navigator>
);

const UserNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            HomeTab: 'home',
            Search: 'search',
            RequestsTab: 'assignment',
            ChatTab: 'chat',
            SOSTab: 'warning',
            AlertsTab: 'campaign',
          };
          return <Icon name={iconMap[route.name] || 'home'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Search" component={SearchStack} options={{ title: 'Search' }} />
      <Tab.Screen name="RequestsTab" component={RequestsStack} options={{ title: 'Requests' }} />
      <Tab.Screen name="ChatTab" component={ChatStack} options={{ title: 'Messages' }} />
      <Tab.Screen name="SOSTab" component={SOSStack} options={{ title: 'SOS' }} />
      <Tab.Screen
        name="AlertsTab"
        component={EmergencyAlertScreen}
        options={{
          title: 'Alert',
          headerShown: true,
          headerTitle: 'Emergency Alert',
          tabBarIcon: ({ color, size }) => (
            <Icon name="campaign" size={size} color={color} />
          ),
          tabBarActiveTintColor: '#e74c3c',
        }}
      />
    </Tab.Navigator>
  );
};

export default UserNavigator;
