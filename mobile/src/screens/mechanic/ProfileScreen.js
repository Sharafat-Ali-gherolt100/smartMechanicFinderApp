import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

const DEFAULT_HOURS = {
  monday:    { open: '09:00', close: '18:00' },
  tuesday:   { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday:  { open: '09:00', close: '18:00' },
  friday:    { open: '09:00', close: '18:00' },
  saturday:  { open: '10:00', close: '16:00' },
  sunday:    { open: 'closed', close: 'closed' },
};

const ProfileScreen = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [formData, setFormData]             = useState({
    shop_name:     '',
    address:       '',
    phone:         '',
    description:   '',
    opening_hours: DEFAULT_HOURS,
  });

  // ── Load profile data ──────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      // Use the dedicated profile endpoint; fall back to dashboard if needed
      let mechanic = null;

      try {
        const res = await api.get('/mechanic/dashboard');
        mechanic = res.data?.mechanic ?? null;
      } catch (dashErr) {
        console.warn('Dashboard endpoint failed, trying profile directly:', dashErr);
      }

      if (mechanic) {
        setFormData({
          shop_name:     mechanic.shop_name     ?? '',
          address:       mechanic.address        ?? '',
          phone:         mechanic.phone          ?? '',
          description:   mechanic.description    ?? '',
          opening_hours: mechanic.opening_hours && Object.keys(mechanic.opening_hours).length > 0
            ? mechanic.opening_hours
            : DEFAULT_HOURS,
        });
      }
    } catch (error) {
      console.error('loadProfile error:', error);
      Alert.alert('Error', 'Failed to load profile data. Please pull to refresh.');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUpdateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateHours = (day, type, value) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: { ...prev.opening_hours[day], [type]: value },
      },
    }));
  };

  const handleSave = async () => {
    if (!formData.shop_name.trim()) {
      Alert.alert('Validation', 'Shop name is required.');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('Validation', 'Address is required.');
      return;
    }

    setSaving(true);
    try {
      await api.put('/mechanic/profile', {
        shop_name:     formData.shop_name.trim(),
        address:       formData.address.trim(),
        phone:         formData.phone.trim(),
        description:   formData.description.trim(),
        opening_hours: formData.opening_hours,
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      const msg = error?.error || error?.message || 'Failed to update profile.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
    >
      {/* ── Shop Information ─────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Name <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputRow}>
            <Icon name="store" size={18} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.shop_name}
              onChangeText={t => handleUpdateField('shop_name', t)}
              placeholder="Enter shop name"
              placeholderTextColor="#bdc3c7"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputRow, styles.inputRowMulti]}>
            <Icon name="location-on" size={18} color="#7f8c8d" style={[styles.inputIcon, { marginTop: 2 }]} />
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={formData.address}
              onChangeText={t => handleUpdateField('address', t)}
              placeholder="Enter shop address"
              placeholderTextColor="#bdc3c7"
              multiline
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <View style={styles.inputRow}>
            <Icon name="phone" size={18} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={t => handleUpdateField('phone', t)}
              placeholder="Enter phone number"
              placeholderTextColor="#bdc3c7"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputRow, styles.inputRowMulti]}>
            <Icon name="description" size={18} color="#7f8c8d" style={[styles.inputIcon, { marginTop: 2 }]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={t => handleUpdateField('description', t)}
              placeholder="Describe your shop and services"
              placeholderTextColor="#bdc3c7"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>

      {/* ── Opening Hours ────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opening Hours</Text>
        {Object.entries(formData.opening_hours).map(([day, hours]) => (
          <View key={day} style={styles.hoursRow}>
            <Text style={styles.dayLabel}>
              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
            </Text>
            <View style={styles.hoursInputs}>
              <TextInput
                style={styles.timeInput}
                value={hours.open}
                onChangeText={t => handleUpdateHours(day, 'open', t)}
                placeholder="Open"
                placeholderTextColor="#bdc3c7"
              />
              <Text style={styles.timeSeparator}>–</Text>
              <TextInput
                style={styles.timeInput}
                value={hours.close}
                onChangeText={t => handleUpdateHours(day, 'close', t)}
                placeholder="Close"
                placeholderTextColor="#bdc3c7"
              />
            </View>
          </View>
        ))}
      </View>

      {/* ── Save button ──────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="save" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent:   { paddingBottom: 30 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText:     { marginTop: 10, fontSize: 16, color: '#7f8c8d' },

  section: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 0,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 14,
  },

  inputGroup:   { marginBottom: 14 },
  label:        { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  required:     { color: '#e74c3c' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dde2e7',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    paddingHorizontal: 10,
  },
  inputRowMulti: { alignItems: 'flex-start', paddingTop: 10 },
  inputIcon:    { marginRight: 8 },
  input:        { flex: 1, height: 44, fontSize: 15, color: '#2c3e50' },
  inputMulti:   { height: 'auto' },
  textArea:     { minHeight: 90, paddingTop: 2 },

  // Opening hours
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayLabel: {
    width: 36,
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
  },
  hoursInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#dde2e7',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: '#fafafa',
    color: '#2c3e50',
  },
  timeSeparator: { marginHorizontal: 8, color: '#7f8c8d', fontSize: 16 },

  // Save button
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveButtonDisabled: { opacity: 0.65 },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
