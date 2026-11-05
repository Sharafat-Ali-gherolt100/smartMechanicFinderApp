import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

const COMMON_SERVICES = [
  'Engine Repair',
  'Oil Change',
  'Tire Service',
  'Tire Replacement',
  'Battery Replacement',
  'Brake Service',
  'Wheel Alignment',
  'AC Service',
  'Radiator Flush',
  'Transmission Service',
  'Electrical Repair',
  'General Diagnostic',
];

const ServicesScreen = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mechanic/services');
      setServices(res.data.services || []);
    } catch (err) {
      Alert.alert('Error', 'Could not load services.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const addService = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (services.includes(trimmed)) {
      Alert.alert('Duplicate', `"${trimmed}" is already in your service list.`);
      return;
    }
    setSaving(true);
    try {
      const updated = [...services, trimmed];
      await api.put('/mechanic/services', { services: updated });
      setServices(updated);
      setNewService('');
    } catch (err) {
      Alert.alert('Error', 'Could not add service.');
    } finally {
      setSaving(false);
    }
  };

  const removeService = async (name) => {
    Alert.alert(
      'Remove Service',
      `Remove "${name}" from your service list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              const updated = services.filter((s) => s !== name);
              await api.put('/mechanic/services', { services: updated });
              setServices(updated);
            } catch (err) {
              Alert.alert('Error', 'Could not remove service.');
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading services…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Add custom service */}
      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>My Services</Text>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Add custom service…"
            value={newService}
            onChangeText={setNewService}
            returnKeyType="done"
            onSubmitEditing={() => addService(newService)}
          />
          <TouchableOpacity
            style={[styles.addBtn, (!newService.trim() || saving) && styles.addBtnDisabled]}
            onPress={() => addService(newService)}
            disabled={!newService.trim() || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="add" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Current services */}
      <FlatList
        data={services}
        keyExtractor={(item, i) => `${item}-${i}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="build" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>No services added yet</Text>
            <Text style={styles.emptySubText}>Add from the suggestions below or type a custom one</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.serviceRow}>
            <Icon name="check-circle" size={20} color="#2ecc71" />
            <Text style={styles.serviceName}>{item}</Text>
            <TouchableOpacity onPress={() => removeService(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <View style={styles.chips}>
              {COMMON_SERVICES.filter((s) => !services.includes(s)).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.chip}
                  onPress={() => addService(s)}
                  disabled={saving}
                >
                  <Icon name="add" size={14} color="#3498db" />
                  <Text style={styles.chipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#7f8c8d', fontSize: 15 },
  addSection: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  addRow: { flexDirection: 'row', alignItems: 'center' },
  addInput: {
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, height: 44, fontSize: 15, marginRight: 8, backgroundColor: '#fafafa',
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 8, backgroundColor: '#3498db',
    justifyContent: 'center', alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.5 },
  list: { padding: 12, paddingBottom: 30 },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, padding: 14, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
  },
  serviceName: { flex: 1, fontSize: 15, color: '#2c3e50', marginLeft: 10 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginTop: 14 },
  emptySubText: { fontSize: 13, color: '#7f8c8d', marginTop: 6, textAlign: 'center' },
  suggestionsSection: { marginTop: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8f4fd', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, margin: 4,
    borderWidth: 1, borderColor: '#b3d9f5',
  },
  chipText: { color: '#3498db', fontSize: 13, marginLeft: 4 },
});

export default ServicesScreen;
