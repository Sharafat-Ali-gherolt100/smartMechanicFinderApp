import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AdminDashboardScreen from '../../screens/admin/AdminDashboardScreen';
import ManageUsersScreen from '../../screens/admin/ManageUsersScreen';
import ManageMechanicsScreen from '../../screens/admin/ManageMechanicsScreen';
import ReportsScreen from '../../screens/admin/ReportsScreen';
import AnalyticsScreen from '../../screens/admin/AnalyticsScreen';
import EmergencyAlertsScreen from '../../screens/admin/EmergencyAlertsScreen';
import HomeScreen from '../../screens/user/HomeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
    <Stack.Screen name="ManageUsers" component={ManageUsersScreen} options={{ title: 'Users' }} />
    <Stack.Screen name="ManageMechanics" component={ManageMechanicsScreen} options={{ title: 'Mechanics' }} />
    <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
    <Stack.Screen name="EmergencyAlerts" component={EmergencyAlertsScreen} options={{ title: 'Emergency Alerts' }} />
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const AdminNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const map = {
          AdminHome:     'dashboard',
          UsersTab:      'people',
          MechanicsTab:  'build',
          ReportsTab:    'flag',
          EmAlertsTab:   'campaign',
        };
        return <Icon name={map[route.name] || 'dashboard'} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#8e44ad',
      tabBarInactiveTintColor: '#7f8c8d',
      headerShown: false,
    })}
  >
    <Tab.Screen name="AdminHome" component={AdminStack} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="UsersTab" component={ManageUsersScreen} options={{ title: 'Users', headerShown: true }} />
    <Tab.Screen name="MechanicsTab" component={ManageMechanicsScreen} options={{ title: 'Mechanics', headerShown: true }} />
    <Tab.Screen name="ReportsTab" component={ReportsScreen} options={{ title: 'Reports', headerShown: true }} />
    <Tab.Screen
      name="EmAlertsTab"
      component={EmergencyAlertsScreen}
      options={{
        title: 'Alerts',
        headerShown: true,
        headerTitle: 'Emergency Alerts',
        tabBarActiveTintColor: '#e74c3c',
      }}
    />
  </Tab.Navigator>
);

export default AdminNavigator;
