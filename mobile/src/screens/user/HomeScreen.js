import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useNetworkStatus } from '../../utils/networkStatus';
import OfflineBanner from '../../components/common/OfflineBanner';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { location, refreshLocation } = useLocation();
  const { isOnline } = useNetworkStatus();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleFindMechanics = () => {
    navigation.navigate('MechanicSearch');
  };

  const handleSOS = () => {
    if (!isOnline) {
      Alert.alert('Offline', 'SOS Emergency requires an internet connection. Please connect and try again.');
      return;
    }
    navigation.navigate('SOS');
  };

  const handleMyHistory = () => {
    navigation.navigate('History');
  };

  const handleVideoLibrary = () => {
    navigation.navigate('VideoLibrary');
  };

  const handleSOP = () => {
    navigation.navigate('SOP');
  };

  const handleEmergencyAlert = () => {
    navigation.navigate('EmergencyAlert');
  };

  const handleRequestService = () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Requesting service requires an internet connection.');
      return;
    }
    navigation.navigate('CreateServiceRequest');
  };

  const handleMyRequests = () => {
    navigation.navigate('UserServiceRequests');
  };

  const handleMessages = () => {
    // ChatTab is the tab containing ChatListScreen.
    // navigate() on a tab navigator name jumps to that tab.
    navigation.navigate('ChatTab');
  };

  return (
    <View style={styles.outerContainer}>
      <OfflineBanner visible={!isOnline} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={!isOnline ? styles.contentOffsetTop : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.appTitleHeader}>GetFix</Text>
          <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      {location && (
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={20} color="#3498db" />
          <Text style={styles.locationText}>
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={handleFindMechanics}>
          <Icon name="search" size={40} color="#3498db" />
          <Text style={styles.actionText}>Find Mechanics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, styles.sosCard]} onPress={handleSOS}>
          <Icon name="warning" size={40} color="#e74c3c" />
          <Text style={styles.actionText}>SOS Emergency</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={handleMyHistory}>
          <Icon name="history" size={40} color="#2ecc71" />
          <Text style={styles.actionText}>My History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleVideoLibrary}>
          <Icon name="play-circle-outline" size={40} color="#e67e22" />
          <Text style={styles.actionText}>Video Library</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.sopCard} onPress={handleSOP}>
        <Icon name="receipt" size={24} color="#fff" />
        <Text style={styles.sopText}>View Standard Pricing (SOP)</Text>
        <Icon name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.emergencyAlertCard} onPress={handleEmergencyAlert}>
        <Icon name="campaign" size={24} color="#fff" />
        <Text style={styles.emergencyAlertText}>Emergency Service Alert</Text>
        <Icon name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Service request row */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={handleRequestService}>
          <Icon name="assignment" size={40} color="#9b59b6" />
          <Text style={styles.actionText}>Request Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleMessages}>
          <Icon name="chat" size={40} color="#1abc9c" />
          <Text style={styles.actionText}>Messages</Text>
        </TouchableOpacity>
      </View>

      {user?.is_mechanic && (
        <TouchableOpacity
          style={styles.mechanicDashboardCard}
          onPress={() => navigation.navigate('MechanicDashboard')}
        >
          <Icon name="build" size={24} color="#fff" />
          <Text style={styles.mechanicDashboardText}>Mechanic Portal</Text>
          <Icon name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {user?.is_admin && (
        <TouchableOpacity
          style={styles.adminDashboardCard}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Icon name="admin-panel-settings" size={24} color="#fff" />
          <Text style={styles.adminDashboardText}>Admin Dashboard</Text>
          <Icon name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>GetFix v2.0</Text>
        <Text style={styles.footerSubText}>Skardu</Text>
      </View>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentOffsetTop: {
    paddingTop: 36,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeContainer: {
    flex: 1,
  },
  appTitleHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutButton: {
    padding: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e8f4fd',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2c3e50',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sosCard: {
    backgroundColor: '#fff5f5',
  },
  actionText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
  sopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  sopText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  emergencyAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emergencyAlertText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  mechanicDashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  mechanicDashboardText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  adminDashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e67e22',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  adminDashboardText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  footerSubText: {
    fontSize: 12,
    color: '#bdc3c7',
    marginTop: 5,
  },
});

export default HomeScreen;