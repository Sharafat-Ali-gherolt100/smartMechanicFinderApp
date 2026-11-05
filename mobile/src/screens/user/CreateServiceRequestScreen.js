import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';
import LocationService from '../../components/services/location';

const SERVICE_TYPES = [
  'General Maintenance',
  'Engine Repair',
  'Oil & Filter Change',
  'Brake Service',
  'Battery & Electrical',
  'Tire Service & Alignment',
  'Transmission Repair',
  'Emergency Towing / Roadside',
];

const VEHICLE_TYPES = ['Car', 'SUV / 4x4', 'Motorcycle / Bike', 'Truck / Van'];
const BUDGET_PRESETS = ['2500', '5000', '8000', '12000', '15000'];

const CreateServiceRequestScreen = ({ navigation }) => {
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [description, setDescription] = useState('');
  const [proposedBudget, setProposedBudget] = useState('5000');
  const [locationName, setLocationName] = useState('Fetching location...');
  const [coords, setCoords] = useState({ latitude: 35.2973, longitude: 75.6333 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    LocationService.getCurrentPosition()
      .then((pos) => {
        setCoords({ latitude: pos.latitude, longitude: pos.longitude });
        LocationService.reverseGeocode(pos.latitude, pos.longitude).then((geo) => {
          if (geo && geo.formatted_address) {
            setLocationName(geo.formatted_address);
          } else {
            setLocationName('Skardu, Gilgit-Baltistan');
          }
        });
      })
      .catch(() => {
        setLocationName('Skardu, Gilgit-Baltistan');
      });
  }, []);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please provide details about your vehicle problem.');
      return;
    }

    const budgetVal = parseFloat(proposedBudget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      Alert.alert('Proposed Budget Required', 'Please enter your proposed service budget in PKR.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/service-requests/create', {
        service_type: serviceType,
        vehicle_type: vehicleType,
        description: description.trim(),
        proposed_budget: budgetVal,
        location_name: locationName,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      Alert.alert(
        'Request Broadcasted!',
        `Your request with proposed budget of PKR ${budgetVal.toLocaleString()} has been sent to all registered mechanics.\n\nMechanics can accept your budget or submit a counter-offer (+10% to +40%). Travel charges (PKR 400/km) are itemized separately.`,
        [
          {
            text: 'View Requests',
            onPress: () => navigation.navigate('UserServiceRequests'),
          },
        ]
      );
    } catch (err) {
      console.error('Error creating service request:', err);
      Alert.alert('Submission Failed', err.response?.data?.error || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Request Mechanic Service</Text>
      <Text style={styles.headerSubtitle}>
        Broadcast your vehicle repair request to all registered mechanics nearby.
      </Text>

      {/* Service Type Selection */}
      <Text style={styles.label}>Required Service Type</Text>
      <View style={styles.chipContainer}>
        {SERVICE_TYPES.map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.chip, serviceType === st && styles.chipActive]}
            onPress={() => setServiceType(st)}
          >
            <Text style={[styles.chipText, serviceType === st && styles.chipTextActive]}>
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vehicle Type Selection */}
      <Text style={styles.label}>Vehicle Category</Text>
      <View style={styles.chipContainer}>
        {VEHICLE_TYPES.map((vt) => (
          <TouchableOpacity
            key={vt}
            style={[styles.chip, vehicleType === vt && styles.chipActive]}
            onPress={() => setVehicleType(vt)}
          >
            <Text style={[styles.chipText, vehicleType === vt && styles.chipTextActive]}>
              {vt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User Proposed Budget */}
      <Text style={styles.label}>Your Proposed Budget for Service (PKR)</Text>
      <View style={styles.budgetInputContainer}>
        <Text style={styles.currencyPrefix}>PKR</Text>
        <TextInput
          style={styles.budgetInput}
          value={proposedBudget}
          onChangeText={setProposedBudget}
          placeholder="e.g. 5000"
          keyboardType="numeric"
        />
      </View>

      {/* Budget Presets */}
      <View style={styles.presetRow}>
        {BUDGET_PRESETS.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[styles.presetChip, proposedBudget === amount && styles.presetChipActive]}
            onPress={() => setProposedBudget(amount)}
          >
            <Text style={[styles.presetText, proposedBudget === amount && styles.presetTextActive]}>
              PKR {parseInt(amount, 10).toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Travel Charge Information Notice */}
      <View style={styles.travelNoticeCard}>
        <Icon name="commute" size={20} color="#2980b9" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.travelNoticeTitle}>Travel / Distance Charges</Text>
          <Text style={styles.travelNoticeDesc}>
            Mechanics charge a standard travel rate of PKR 400 / km based on distance from your breakdown location. This is itemized separately from your service offer.
          </Text>
        </View>
      </View>

      {/* Location */}
      <Text style={styles.label}>Current Breakdown Location</Text>
      <View style={styles.locationCard}>
        <Icon name="location-on" size={22} color="#e74c3c" />
        <TextInput
          style={styles.locationInput}
          value={locationName}
          onChangeText={setLocationName}
          placeholder="Location address..."
        />
      </View>

      {/* Problem Description */}
      <Text style={styles.label}>Problem & Repair Details</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe what is wrong with your vehicle (e.g. Engine won't start, flat tire, brake noise)..."
        placeholderTextColor="#95a5a6"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Icon name="send" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>Broadcast Request to All Mechanics</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#34495e',
    marginTop: 16,
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  chip: {
    backgroundColor: '#f1f2f6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#3498db',
  },
  chipText: {
    fontSize: 13,
    color: '#57606f',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#2ecc71',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 4,
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#f0f3f4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  presetChipActive: {
    backgroundColor: '#2ecc71',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  presetTextActive: {
    color: '#ffffff',
  },
  travelNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ebf5fb',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#d4e6f1',
  },
  travelNoticeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2980b9',
  },
  travelNoticeDesc: {
    fontSize: 11,
    color: '#34495e',
    marginTop: 2,
    lineHeight: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#2c3e50',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#2c3e50',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#a4b0be',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateServiceRequestScreen;
