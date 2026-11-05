import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const SOSScreen = ({ navigation }) => {
  const { location } = useLocation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSOS, setActiveSOS] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadActiveSOS();
  }, []);

  const loadActiveSOS = async () => {
    try {
      const response = await api.get('/sos/active');
      setActiveSOS(response.data.sos_requests || []);
    } catch (error) {
      console.error('Error loading SOS:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActiveSOS();
    setRefreshing(false);
  };

  const sendSOS = async () => {
    if (!location) {
      Alert.alert('Error', 'Unable to get your location. Please enable GPS.');
      return;
    }

    Alert.alert(
      'Emergency SOS',
      'This will send an emergency alert to nearby mechanics. Only use in real emergencies.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: performSOS,
        },
      ]
    );
  };

  const performSOS = async () => {
    setSending(true);
    try {
      const response = await api.post('/sos/create', {
        latitude: location.latitude,
        longitude: location.longitude,
        location_name: 'Current Location',
        vehicle_type: 'Unknown',
        issue_description: 'Emergency assistance needed',
      });

      Alert.alert(
        'SOS Sent!',
        'Nearby mechanics have been notified. Help is on the way.',
        [{ text: 'OK' }]
      );
      
      loadActiveSOS();
    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const cancelSOS = async (sosId) => {
    Alert.alert(
      'Cancel SOS',
      'Are you sure you want to cancel this SOS request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/sos/${sosId}/cancel`);
              loadActiveSOS();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel SOS');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#e74c3c';
      case 'responding': return '#f39c12';
      case 'resolved': return '#2ecc71';
      default: return '#7f8c8d';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* SOS Button */}
      <TouchableOpacity
        style={[styles.sosButton, sending && styles.sosButtonDisabled]}
        onPress={sendSOS}
        disabled={sending}
      >
        {sending ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <Icon name="warning" size={40} color="#fff" />
            <Text style={styles.sosButtonText}>EMERGENCY SOS</Text>
            <Text style={styles.sosSubText}>Tap for immediate help</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Active SOS */}
      {activeSOS.length > 0 && (
        <View style={styles.activeSection}>
          <Text style={styles.sectionTitle}>Active SOS Requests</Text>
          {activeSOS.map((sos) => (
            <View key={sos._id} style={styles.sosCard}>
              <View style={styles.sosCardHeader}>
                <View style={[styles.sosStatus, { backgroundColor: getStatusColor(sos.status) }]}>
                <Text style={styles.sosStatusText} numberOfLines={1}>{sos.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.sosTime}>
                  {new Date(sos.created_at).toLocaleTimeString()}
                </Text>
              </View>
              
              <View style={styles.sosLocation}>
                <Icon name="location-on" size={16} color="#e74c3c" />
                <Text style={styles.sosLocationText}>
                  Lat: {sos.latitude.toFixed(4)}, Lng: {sos.longitude.toFixed(4)}
                </Text>
              </View>
              
              {sos.assigned_mechanic_id && (
                <View style={styles.sosAssigned}>
                  <Icon name="build" size={16} color="#3498db" />
                  <Text style={styles.sosAssignedText}>
                    Mechanic assigned - On the way!
                  </Text>
                </View>
              )}
              
              {sos.status === 'active' && (
                <TouchableOpacity
                  style={styles.cancelSOSButton}
                  onPress={() => cancelSOS(sos._id)}
                >
                  <Text style={styles.cancelSOSText}>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Emergency Tips</Text>
        
        <View style={styles.infoCard}>
          <Icon name="wb-incandescent" size={24} color="#f39c12" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Stay Safe</Text>
            <Text style={styles.infoText}>
              Move to a safe location away from traffic while waiting for help.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Icon name="phone" size={24} color="#3498db" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Emergency Contacts</Text>
            <Text style={styles.infoText}>
              Police: 15 | Rescue: 1122 | Fire: 16
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Icon name="videocam" size={24} color="#2ecc71" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Documentation</Text>
            <Text style={styles.infoText}>
              Take photos of the situation for insurance and records.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    padding: 40,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sosButtonDisabled: {
    opacity: 0.6,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  sosSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  activeSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  sosCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  sosCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sosStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  sosStatusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  sosTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  sosLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sosLocationText: {
    fontSize: 13,
    color: '#2c3e50',
    marginLeft: 6,
  },
  sosAssigned: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sosAssignedText: {
    fontSize: 13,
    color: '#3498db',
    marginLeft: 6,
    fontWeight: '500',
  },
  cancelSOSButton: {
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelSOSText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  infoText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
});

export default SOSScreen;