import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

const ALERT_TYPES = {
  breakdown:      { label: 'Vehicle Breakdown', icon: 'car-repair',       color: '#e74c3c' },
  accident:       { label: 'Accident',          icon: 'report',           color: '#c0392b' },
  fuel_empty:     { label: 'Out of Fuel',       icon: 'local-gas-station', color: '#e67e22' },
  tyre_puncture:  { label: 'Tyre Puncture',     icon: 'tire-repair',      color: '#f39c12' },
  battery_dead:   { label: 'Dead Battery',      icon: 'battery-alert',    color: '#8e44ad' },
  engine_failure: { label: 'Engine Failure',    icon: 'engineering',      color: '#2c3e50' },
  other:          { label: 'Other Emergency',   icon: 'warning',          color: '#7f8c8d' },
};

const STATUS_META = {
  pending:      { label: 'Pending',      color: '#f39c12', bg: '#fef9e7', icon: 'schedule' },
  acknowledged: { label: 'Acknowledged', color: '#3498db', bg: '#eaf4fb', icon: 'visibility' },
  in_progress:  { label: 'In Progress',  color: '#9b59b6', bg: '#f5eef8', icon: 'autorenew' },
  resolved:     { label: 'Resolved',     color: '#2ecc71', bg: '#eafaf1', icon: 'check-circle' },
  dismissed:    { label: 'Dismissed',    color: '#95a5a6', bg: '#f2f3f4', icon: 'cancel' },
};

const STATUS_FILTERS = [
  { key: null,          label: 'All' },
  { key: 'pending',     label: 'Pending' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved',    label: 'Resolved' },
  { key: 'dismissed',   label: 'Dismissed' },
];

const NEXT_STATUSES = {
  pending:      ['acknowledged', 'in_progress', 'resolved', 'dismissed'],
  acknowledged: ['in_progress', 'resolved', 'dismissed'],
  in_progress:  ['resolved', 'dismissed'],
  resolved:     [],
  dismissed:    [],
};

// ─── Alert card ────────────────────────────────────────────────────────────────
const AlertCard = ({ item, onManage }) => {
  const typeInfo  = ALERT_TYPES[item.alert_type]  || ALERT_TYPES.other;
  const statusMeta = STATUS_META[item.status] || STATUS_META.pending;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.typeIconCircle, { backgroundColor: typeInfo.color + '22' }]}>
          <Icon name={typeInfo.icon} size={22} color={typeInfo.color} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardType}>{typeInfo.label}</Text>
          <Text style={styles.cardDate}>
            {item.created_at
              ? new Date(item.created_at).toLocaleString('en-US', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              : '—'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
          <Icon name={statusMeta.icon} size={13} color={statusMeta.color} />
          <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
            {statusMeta.label}
          </Text>
        </View>
      </View>

      {/* User info */}
      <View style={styles.userRow}>
        <Icon name="person" size={14} color="#7f8c8d" />
        <Text style={styles.userText}>
          {item.user_name || 'Unknown'} {item.user_email ? `• ${item.user_email}` : ''}
        </Text>
      </View>

      {/* Message */}
      <Text style={styles.cardMessage} numberOfLines={3}>{item.message}</Text>

      {/* Location */}
      {item.location_name ? (
        <View style={styles.locationRow}>
          <Icon name="location-on" size={13} color="#7f8c8d" />
          <Text style={styles.locationText}>{item.location_name}</Text>
        </View>
      ) : null}

      {/* Vehicle type */}
      {item.vehicle_type ? (
        <View style={styles.locationRow}>
          <Icon name="directions-car" size={13} color="#7f8c8d" />
          <Text style={styles.locationText}>{item.vehicle_type}</Text>
        </View>
      ) : null}

      {/* Admin note */}
      {item.admin_note ? (
        <View style={styles.adminNoteBox}>
          <Icon name="rate-review" size={13} color="#3498db" />
          <Text style={styles.adminNoteText}>{item.admin_note}</Text>
        </View>
      ) : null}

      {/* Action button */}
      {NEXT_STATUSES[item.status]?.length > 0 && (
        <TouchableOpacity style={styles.manageBtn} onPress={() => onManage(item)}>
          <Icon name="manage-accounts" size={16} color="#fff" />
          <Text style={styles.manageBtnText}>Manage Alert</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Main screen ───────────────────────────────────────────────────────────────
const EmergencyAlertsScreen = () => {
  const [alerts, setAlerts]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [statusFilter, setStatusFilter]   = useState(null);
  const [stats, setStats]                 = useState({});

  // Modal state
  const [modalVisible, setModalVisible]   = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [newStatus, setNewStatus]         = useState('');
  const [adminNote, setAdminNote]         = useState('');
  const [updating, setUpdating]           = useState(false);

  const loadData = useCallback(async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const [alertsRes, statsRes] = await Promise.all([
        api.get(`/alerts/admin/all${params}`),
        api.get('/alerts/admin/stats'),
      ]);
      setAlerts(alertsRes.data?.alerts || []);
      setStats(statsRes.data?.stats || {});
    } catch (e) {
      Alert.alert('Error', 'Failed to load emergency alerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleManage = (alert) => {
    setSelectedAlert(alert);
    setNewStatus(NEXT_STATUSES[alert.status]?.[0] || '');
    setAdminNote(alert.admin_note || '');
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!newStatus) {
      Alert.alert('Required', 'Please select a status.');
      return;
    }
    setUpdating(true);
    try {
      await api.put(`/alerts/admin/${selectedAlert._id}/status`, {
        status:     newStatus,
        admin_note: adminNote.trim() || undefined,
      });
      setModalVisible(false);
      Alert.alert('Updated', `Alert marked as "${STATUS_META[newStatus]?.label}".`);
      loadData();
    } catch (e) {
      const msg = e?.error || e?.message || 'Update failed';
      Alert.alert('Error', msg);
    } finally {
      setUpdating(false);
    }
  };

  // ── Stats bar ──────────────────────────────────────────────────────────────
  const renderStats = () => (
    <View style={styles.statsRow}>
      {[
        { key: 'total',      label: 'Total',       color: '#2c3e50', icon: 'list' },
        { key: 'pending',    label: 'Pending',     color: '#f39c12', icon: 'schedule' },
        { key: 'in_progress', label: 'In Progress', color: '#9b59b6', icon: 'autorenew' },
        { key: 'resolved',   label: 'Resolved',    color: '#2ecc71', icon: 'check-circle' },
      ].map(s => (
        <View key={s.key} style={[styles.statCard, { borderTopColor: s.color }]}>
          <Icon name={s.icon} size={18} color={s.color} />
          <Text style={[styles.statNum, { color: s.color }]}>{stats[s.key] ?? 0}</Text>
          <Text style={styles.statLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  );

  // ── Filter chips ───────────────────────────────────────────────────────────
  const renderFilters = () => (
    <FlatList
      data={STATUS_FILTERS}
      keyExtractor={f => String(f.key)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterList}
      renderItem={({ item: f }) => {
        const active  = statusFilter === f.key;
        const sm      = f.key ? STATUS_META[f.key] : null;
        const color   = sm ? sm.color : '#2c3e50';
        return (
          <TouchableOpacity
            style={[styles.filterChip, active && { backgroundColor: color, borderColor: color }]}
            onPress={() => setStatusFilter(f.key)}
          >
            <Text style={[styles.filterChipText, active && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Loading emergency alerts…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStats()}
      {renderFilters()}

      <FlatList
        data={alerts}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <AlertCard item={item} onManage={handleManage} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>No emergency alerts</Text>
          </View>
        }
      />

      {/* ── Manage modal ──────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Alert</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            {selectedAlert && (
              <Text style={styles.modalSub} numberOfLines={2}>
                {selectedAlert.user_name}: {selectedAlert.message}
              </Text>
            )}

            <Text style={styles.modalLabel}>Update Status</Text>
            <View style={styles.statusOptions}>
              {(NEXT_STATUSES[selectedAlert?.status] || []).map(s => {
                const sm = STATUS_META[s];
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusOption,
                      { borderColor: sm.color },
                      newStatus === s && { backgroundColor: sm.color },
                    ]}
                    onPress={() => setNewStatus(s)}
                  >
                    <Icon name={sm.icon} size={16} color={newStatus === s ? '#fff' : sm.color} />
                    <Text style={[styles.statusOptionText, newStatus === s && { color: '#fff' }]}>
                      {sm.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.modalLabel}>Admin Note (Optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="Add a note for the user (visible to them)…"
              placeholderTextColor="#bdc3c7"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.updateBtn, updating && { opacity: 0.6 }]}
              onPress={handleUpdate}
              disabled={updating}
            >
              {updating
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.updateBtnText}>Update Alert</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:     { marginTop: 10, fontSize: 15, color: '#7f8c8d' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderTopWidth: 3,
  },
  statNum:   { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginTop: 4 },
  statLabel: { fontSize: 10, color: '#7f8c8d', marginTop: 2 },

  // Filter chips
  filterList: { paddingHorizontal: 10, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#dde2e7',
    backgroundColor: '#fafafa',
  },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#555' },

  // List
  list: { padding: 12, paddingBottom: 30 },

  // Card
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardMeta:    { flex: 1 },
  cardType:    { fontSize: 14, fontWeight: '700', color: '#2c3e50' },
  cardDate:    { fontSize: 11, color: '#7f8c8d', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 6,
  },
  userText: { fontSize: 12, color: '#555', flex: 1 },

  cardMessage: { fontSize: 13, color: '#2c3e50', lineHeight: 19, marginBottom: 6 },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  locationText: { fontSize: 12, color: '#7f8c8d', flex: 1 },

  adminNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eaf4fb',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  adminNoteText: { flex: 1, fontSize: 12, color: '#2980b9', lineHeight: 17 },

  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 9,
    marginTop: 10,
    gap: 6,
  },
  manageBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: { fontSize: 16, color: '#bdc3c7', marginTop: 14, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle:  { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  modalSub:    { fontSize: 13, color: '#7f8c8d', marginBottom: 16, lineHeight: 18 },
  modalLabel:  { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 4 },

  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 5,
  },
  statusOptionText: { fontSize: 13, fontWeight: '600', color: '#555' },

  noteInput: {
    borderWidth: 1.5,
    borderColor: '#dde2e7',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: '#2c3e50',
    minHeight: 70,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },

  updateBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  updateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default EmergencyAlertsScreen;
