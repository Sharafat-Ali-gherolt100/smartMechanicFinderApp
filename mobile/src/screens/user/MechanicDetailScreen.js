import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SmartMapView from '../../components/common/SmartMapView';
import { MechanicService } from '../../components/services/mechanicService';
import { LocationService } from '../../services/location';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';

const MechanicDetailScreen = ({ route, navigation }) => {
  const { mechanicId } = route.params;
  const [mechanic, setMechanic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const { location } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    loadMechanicDetails();
  }, [mechanicId]);

  const loadMechanicDetails = async () => {
    setLoading(true);
    try {
      const data = await MechanicService.getMechanicDetails(mechanicId);
      setMechanic(data);
      if (location) {
        const dist = LocationService.calculateDistance(
          location.latitude,
          location.longitude,
          data.latitude,
          data.longitude
        );
        setDistance(dist);
        setEta(LocationService.calculateETA(dist));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load mechanic details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (mechanic.phone) {
      Linking.openURL(`tel:${mechanic.phone}`);
    } else {
      Alert.alert('No Phone', 'This mechanic has no phone number listed.');
    }
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mechanic.latitude},${mechanic.longitude}`;
    Linking.openURL(url);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${mechanic.shop_name}\nAddress: ${mechanic.address}\nRating: ${mechanic.rating_average}★ (${mechanic.total_ratings} reviews)\nDistance: ${LocationService.formatDistance(distance)}`,
        title: mechanic.shop_name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleMessage = () => {
    navigation.navigate('ChatDetail', {
      mechanicId: mechanic._id,
      partnerName: mechanic.shop_name,
    });
  };

  const handleReport = () => {
    Alert.alert(
      'Report Mechanic',
      'Are you sure you want to report this mechanic for overcharging or misconduct?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              await MechanicService.reportMechanic(mechanicId, 'Reported by user via app');
              Alert.alert('Reported', 'Your report has been submitted. Our team will review it.');
            } catch (error) {
              Alert.alert('Error', 'Failed to submit report. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleRate = () => {
    navigation.navigate('Rating', { mechanicId });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading mechanic details...</Text>
      </View>
    );
  }

  if (!mechanic) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>Mechanic not found</Text>
      </View>
    );
  }

  const mapMarkers = [{
    _id: mechanic._id,
    latitude: mechanic.latitude,
    longitude: mechanic.longitude,
    shop_name: mechanic.shop_name,
    address: mechanic.address,
    status: mechanic.status,
  }];

  const mapRegion = {
    latitude: mechanic.latitude,
    longitude: mechanic.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <ScrollView style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <SmartMapView
          initialRegion={mapRegion}
          markers={mapMarkers}
          scrollEnabled={false}
          zoomEnabled={false}
          showsUserLocation={false}
          style={styles.map}
        />
        <TouchableOpacity style={styles.mapActionButton} onPress={handleNavigate}>
          <Icon name="directions" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.nameSection}>
            <Text style={styles.shopName} numberOfLines={2}>{mechanic.shop_name}</Text>
            {mechanic.is_verified && (
              <Icon name="verified" size={24} color="#3498db" style={styles.bigVerified} />
            )}
          </View>
          <View style={styles.statusSection}>
            <View style={[
              styles.statusBadgeLarge,
              { backgroundColor: mechanic.status === 'open' ? '#2ecc71' : mechanic.status === 'busy' ? '#f39c12' : '#e74c3c' }
            ]}>
              <Text style={styles.statusTextLarge}>
                {mechanic.status === 'open' ? 'OPEN' : mechanic.status === 'busy' ? 'BUSY' : 'CLOSED'}
              </Text>
            </View>
          </View>
        </View>

        {/* Info rows */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Icon name="location-on" size={20} color="#3498db" />
            <Text style={styles.infoText}>{mechanic.address}</Text>
          </View>
          {mechanic.phone && (
            <View style={styles.infoItem}>
              <Icon name="phone" size={20} color="#3498db" />
              <Text style={styles.infoText}>{mechanic.phone}</Text>
            </View>
          )}
          {distance !== null && (
            <View style={styles.infoItem}>
              <Icon name="navigation" size={20} color="#3498db" />
              <Text style={styles.infoText}>
                {LocationService.formatDistance(distance)}
                {eta !== null && ` • ${LocationService.formatETA(eta)} away`}
              </Text>
            </View>
          )}
          {mechanic.rating_average > 0 && (
            <View style={styles.infoItem}>
              <Icon name="star" size={20} color="#f1c40f" />
              <Text style={styles.infoText}>
                {mechanic.rating_average.toFixed(1)} ★ ({mechanic.total_ratings} reviews)
              </Text>
            </View>
          )}
          {mechanic.response_time > 0 && (
            <View style={styles.infoItem}>
              <Icon name="timer" size={20} color="#3498db" />
              <Text style={styles.infoText}>Avg. Response: {mechanic.response_time} minutes</Text>
            </View>
          )}
        </View>

        {mechanic.description ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{mechanic.description}</Text>
          </View>
        ) : null}

        {mechanic.services && mechanic.services.length > 0 && (
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Services Offered</Text>
            <View style={styles.servicesGrid}>
              {mechanic.services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Icon name="check-circle" size={16} color="#2ecc71" />
                  <Text style={styles.serviceItemText} numberOfLines={1}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {mechanic.opening_hours && (
          <View style={styles.hoursSection}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            {Object.entries(mechanic.opening_hours).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={styles.hoursText} numberOfLines={1}>{hours.open} - {hours.close}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Primary actions: Call / Message / Rate / Share */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCall}>
            <Icon name="phone" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.messageButton]} onPress={handleMessage}>
            <Icon name="chat" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.rateButton]} onPress={handleRate}>
            <Icon name="star" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Rate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
            <Icon name="share" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
          <Icon name="flag" size={20} color="#e74c3c" />
          <Text style={styles.reportButtonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: '#e74c3c',
  },
  mapContainer: {
    height: 240,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapActionButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#3498db',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  shopName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  bigVerified: {
    marginLeft: 8,
    flexShrink: 0,
  },
  statusSection: {
    flexShrink: 0,
  },
  statusBadgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusTextLarge: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  servicesSection: {
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 6,
  },
  serviceItemText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 6,
    flex: 1,
  },
  hoursSection: {
    marginBottom: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  hoursText: {
    fontSize: 14,
    color: '#7f8c8d',
    flexShrink: 1,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 3,
    minHeight: 44,
  },
  callButton: {
    backgroundColor: '#2ecc71',
  },
  messageButton: {
    backgroundColor: '#3498db',
  },
  rateButton: {
    backgroundColor: '#f1c40f',
  },
  shareButton: {
    backgroundColor: '#7f8c8d',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  reportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    minHeight: 44,
  },
  reportButtonText: {
    color: '#e74c3c',
    fontWeight: '500',
    fontSize: 15,
    marginLeft: 8,
  },
});

export default MechanicDetailScreen;
