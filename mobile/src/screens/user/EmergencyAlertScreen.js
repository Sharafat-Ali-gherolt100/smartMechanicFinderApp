import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';
import { useLocation } from '../../context/LocationContext';

const ALERT_TYPES = [
  { key: 'breakdown',      label: 'Vehicle Breakdown',  icon: 'car-repair',      color: '#e74c3c' },
  { key: 'accident',       label: 'Accident',           icon: 'report',          color: '#c0392b' },
  { key: 'fuel_empty',     label: 'Out of Fuel',        icon: 'local-gas-station', color: '#e67e22' },
  { key: 'tyre_puncture',  label: 'Tyre Puncture',      icon: 'tire-repair',     color: '#f39c12' },
  { key: 'battery_dead',   label: 'Dead Battery',       icon: 'battery-alert',   color: '#8e44ad' },
  { key: 'engine_failure', label: 'Engine Failure',     icon: 'engineering',     color: '#2c3e50' },
  { key: 'other',          label: 'Other Emergency',    icon: 'warning',         color: '#7f8c8d' },
];

const STATUS_META = {
  pending:      { label: 'Pending',     color: '#f39c12', icon: 'schedule' },
  acknowledged: { label: 'Acknowledged', color: '#3498db', icon: 'visibility' },
  in_progress:  { label: 'In Progress', color: '#9b59b6', icon: 'autorenew' },
  resolved:     { label: 'Resolved',    color: '#2ecc71', icon: 'check-circle' },
  dismissed:    { label: 'Dismissed',   color: '#95a5a6', icon: 'cancel' },
};

const TAB_SUBMIT = 'submit';
const TAB_HISTORY = 'history';

// ─── Sub-components ────────────────────────────────────────────────────────────

const AlertTypeButton = ({ item, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.typeBtn, selected && { backgroundColor: item.color, borderColor: item.color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon name={item.icon} size={22} color={selected ? '#fff' : item.color} />
    <Text style={[styles.typeBtnLabel, selected && { color: '#fff' }]}>{item.label}</Text>
  </TouchableOpacity>
);

const AlertHistoryCard = ({ item }) => {
  const meta = STATUS_META[item.status] || STATUS_META.pending;
  const typeInfo = ALERT_TYPES.find(t => t.key === item.alert_type) || ALERT_TYPES[ALERT_TYPES.length - 1];
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyCardHeader}>
        <View style={[styles.typeIconCircle, { backgroundColor: typeInfo.color + '22' }]}>
          <Icon name={typeInfo.icon} size={20} color={typeInfo.color} />
        </View>
        <View style={styles.historyCardMeta}>
          <Text style={styles.historyCardType}>{typeInfo.label}</Text>
          <Text style={styles.historyCardDate}>
            {item.created_at
              ? new Date(item.created_at).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })
              : ''}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: meta.color + '22' }]}>
          <Icon name={meta.icon} size={12} color={meta.color} />
          <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <Text style={styles.historyCardMessage} numberOfLines={3}>{item.message}</Text>

      {item.location_name ? (
        <View style={styles.historyCardLocation}>
          <Icon name="location-on" size={14} color="#7f8c8d" />
          <Text style={styles.historyCardLocationText}>{item.location_name}</Text>
        </View>
      ) : null}

      {item.admin_note ? (
        <View style={styles.adminNoteBox}>
          <Icon name="admin-panel-settings" size={14} color="#3498db" />
          <Text style={styles.adminNoteText}>{item.admin_note}</Text>
        </View>
      ) : null}
    </View>
  );
};

// ─── Main screen ───────────────────────────────────────────────────────────────

const EmergencyAlertScreen = ({ navigation }) => {
  const { location } = useLocation();
  const [activeTab, setActiveTab] = useState(TAB_SUBMIT);

  // Form state
  const [alertType, setAlertType]       = useState('breakdown');
  const [message, setMessage]           = useState('');
  const [vehicleType, setVehicleType]   = useState('');
  const [locationName, setLocationName] = useState('');
  const [submitting, setSubmitting]     = useState(false);

  // History state
  const [history, setHistory]         = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (activeTab === TAB_HISTORY) loadHistory();
  }, [activeTab]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/alerts/my');
      setHistory(res.data?.alerts || []);
    } catch (e) {
      console.warn('Failed to load alert history:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Please describe your emergency before submitting.');
      return;
    }
    if (trimmed.length < 10) {
      Alert.alert('Too Short', 'Please provide a bit more detail (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/alerts/create', {
        alert_type:    alertType,
        message:       trimmed,
        vehicle_type:  vehicleType.trim() || undefined,
        location_name: locationName.trim() || undefined,
        latitude:      location?.latitude,
        longitude:     location?.longitude,
      });

      Alert.alert(
        '🚨 Alert Sent',
        'Your emergency alert has been submitted. Our admin team has been notified and will respond shortly.',
        [{
          text: 'View My Alerts',
          onPress: () => {
            setMessage('');
            setVehicleType('');
            setLocationName('');
            setAlertType('breakdown');
            setActiveTab(TAB_HISTORY);
          },
        }, { text: 'OK' }],
      );
    } catch (error) {
      const msg = error?.error || error?.message || 'Failed to submit alert. Please try again.';
      Alert.alert('Submission Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render submit tab ──────────────────────────────────────────────────────
  const renderSubmit = () => (
    <ScrollView
      style={styles.tabContent}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Banner */}
      <View style={styles.banner}>
        <Icon name="campaign" size={32} color="#fff" />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Emergency Service Alert</Text>
          <Text style={styles.bannerSub}>
            Submit an alert and our team will respond as fast as possible.
          </Text>
        </View>
      </View>

      {/* Type selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Icon name="category" size={16} color="#2c3e50" /> Emergency Type
        </Text>
        <View style={styles.typeGrid}>
          {ALERT_TYPES.map(item => (
            <AlertTypeButton
              key={item.key}
              item={item}
              selected={alertType === item.key}
              onPress={() => setAlertType(item.key)}
            />
          ))}
        </View>
      </View>

      {/* Message */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Icon name="message" size={16} color="#2c3e50" /> Describe Your Emergency
          <Text style={styles.required}> *</Text>
        </Text>
        <TextInput
          style={styles.textArea}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your situation in detail — location landmarks, what happened, what help you need…"
          placeholderTextColor="#bdc3c7"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{message.length}/500</Text>
      </View>

      {/* Vehicle type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Icon name="directions-car" size={16} color="#2c3e50" /> Vehicle Type (Optional)
        </Text>
        <View style={styles.inputRow}>
          <Icon name="directions-car" size={18} color="#7f8c8d" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={vehicleType}
            onChangeText={setVehicleType}
            placeholder="e.g. Toyota Corolla, Honda Civic, Motorcycle…"
            placeholderTextColor="#bdc3c7"
          />
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Icon name="location-on" size={16} color="#2c3e50" /> Location (Optional)
        </Text>
        <View style={styles.inputRow}>
          <Icon name="location-on" size={18} color="#7f8c8d" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="e.g. Near Skardu Bazaar, Main Highway KKH…"
            placeholderTextColor="#bdc3c7"
          />
        </View>
        {location && (
          <Text style={styles.gpsHint}>
            <Icon name="gps-fixed" size={12} color="#2ecc71" /> GPS coordinates will be attached automatically
          </Text>
        )}
      </View>

      {/* Submit button */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Icon name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>Submit Emergency Alert</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        This alert is for non-life-threatening vehicle emergencies. For serious medical/fire emergencies,
        call emergency services (1122) immediately.
      </Text>
    </ScrollView>
  );

  // ── Render history tab ─────────────────────────────────────────────────────
  const renderHistory = () => {
    if (historyLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text style={styles.loadingText}>Loading your alerts…</Text>
        </View>
      );
    }
    if (history.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-none" size={64} color="#bdc3c7" />
          <Text style={styles.emptyTitle}>No Alerts Yet</Text>
          <Text style={styles.emptySubTitle}>
            Alerts you submit will appear here with their current status.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setActiveTab(TAB_SUBMIT)}>
            <Text style={styles.emptyBtnText}>Submit an Alert</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={history}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <AlertHistoryCard item={item} />}
        contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
        onRefresh={loadHistory}
        refreshing={historyLoading}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === TAB_SUBMIT && styles.tabItemActive]}
          onPress={() => setActiveTab(TAB_SUBMIT)}
        >
          <Icon
            name="add-alert"
            size={20}
            color={activeTab === TAB_SUBMIT ? '#e74c3c' : '#7f8c8d'}
          />
          <Text style={[styles.tabLabel, activeTab === TAB_SUBMIT && styles.tabLabelActive]}>
            New Alert
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === TAB_HISTORY && styles.tabItemActive]}
          onPress={() => setActiveTab(TAB_HISTORY)}
        >
          <Icon
            name="history"
            size={20}
            color={activeTab === TAB_HISTORY ? '#e74c3c' : '#7f8c8d'}
          />
          <Text style={[styles.tabLabel, activeTab === TAB_HISTORY && styles.tabLabelActive]}>
            My Alerts
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === TAB_SUBMIT ? renderSubmit() : renderHistory()}
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  tabContent:   { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  loadingText:  { marginTop: 12, fontSize: 15, color: '#7f8c8d' },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive:  { borderBottomColor: '#e74c3c' },
  tabLabel:       { fontSize: 14, fontWeight: '500', color: '#7f8c8d' },
  tabLabelActive: { color: '#e74c3c', fontWeight: '700' },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    padding: 18,
    gap: 14,
  },
  bannerText:  { flex: 1 },
  bannerTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  bannerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 },

  // Section
  section: {
    backgroundColor: '#fff',
    margin: 12,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  required: { color: '#e74c3c' },

  // Type grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#dde2e7',
    backgroundColor: '#fafafa',
    gap: 6,
    marginBottom: 2,
  },
  typeBtnLabel: { fontSize: 12, fontWeight: '600', color: '#555' },

  // Text area
  textArea: {
    borderWidth: 1.5,
    borderColor: '#dde2e7',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#2c3e50',
    minHeight: 120,
    backgroundColor: '#fafafa',
  },
  charCount: { fontSize: 11, color: '#bdc3c7', textAlign: 'right', marginTop: 4 },

  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dde2e7',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 8 },
  input:     { flex: 1, height: 44, fontSize: 14, color: '#2c3e50' },

  gpsHint: { fontSize: 11, color: '#27ae60', marginTop: 6 },

  // Submit button
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    marginHorizontal: 12,
    marginTop: 18,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  disclaimer: {
    fontSize: 11,
    color: '#95a5a6',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    lineHeight: 16,
  },

  // History card
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  historyCardMeta:     { flex: 1 },
  historyCardType:     { fontSize: 14, fontWeight: '700', color: '#2c3e50' },
  historyCardDate:     { fontSize: 11, color: '#7f8c8d', marginTop: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  statusPillText: { fontSize: 11, fontWeight: '700' },

  historyCardMessage: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 8 },

  historyCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  historyCardLocationText: { fontSize: 12, color: '#7f8c8d' },

  adminNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eaf4fb',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  adminNoteText: { flex: 1, fontSize: 12, color: '#2980b9', lineHeight: 17 },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#7f8c8d', marginTop: 16 },
  emptySubTitle: { fontSize: 13, color: '#bdc3c7', textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default EmergencyAlertScreen;
