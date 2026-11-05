import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const RatingScreen = ({ route, navigation }) => {
  const { mechanicId } = route.params;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [serviceQuality, setServiceQuality] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [pricing, setPricing] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/ratings/create', {
        mechanic_id: mechanicId,
        rating,
        review,
        service_quality: serviceQuality || rating,
        punctuality: punctuality || rating,
        pricing: pricing || rating,
        communication: communication || rating,
      });

      Alert.alert(
        'Success',
        'Thank you for your rating!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value, setValue, label) => {
    return (
      <View style={styles.starContainer}>
        <Text style={styles.starLabel}>{label}</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setValue(star)}
              style={styles.starButton}
            >
              <Icon
                name={star <= value ? 'star' : 'star-border'}
                size={32}
                color={star <= value ? '#f1c40f' : '#bdc3c7'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rate Mechanic</Text>
        <Text style={styles.subtitle}>Help others by sharing your experience</Text>
      </View>

      <View style={styles.card}>
        {renderStars(rating, setRating, 'Overall Rating')}
        {renderStars(serviceQuality, setServiceQuality, 'Service Quality')}
        {renderStars(punctuality, setPunctuality, 'Punctuality')}
        {renderStars(pricing, setPricing, 'Pricing')}
        {renderStars(communication, setCommunication, 'Communication')}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Review (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share your experience..."
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  starContainer: {
    marginBottom: 20,
  },
  starLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 4,
  },
  inputGroup: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RatingScreen;