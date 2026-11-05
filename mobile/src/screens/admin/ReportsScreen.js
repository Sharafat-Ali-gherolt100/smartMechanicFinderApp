import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

const STATUS_COLORS = {
  pending: '#f39c12',
  resolved: '#2ecc71',
  dismissed: '#7f8c8d',
};

const STATUS_OPTIONS = ['pending', 'resolved', 'dismissed'];

const ReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const loadReports = useCallback(async (p = 1, sf = statusFilter) => {
    if (p === 1) setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (sf) params.status = sf;
      const res = await api.get('/admin/reports', { params });
      const data = res.data;
      if (p === 1) setReports(data.reports || []);
      else setReports((prev) => [...prev, ...(data.reports || [])]);
      setTotal(data.total || 0);
      setPage(p);
    } catch (e) {
      Alert.alert('Error', 'Could not load reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadReports(1); }, []);

  const handleRefresh = () => { setRefreshing(true); loadReports(1); };
  const handleLoadMore = () => { if (page * LIMIT < total) loadReports(page + 1); };

  const updateReport = (report) => {
    Alert.alert(
      'Update Report',
      `Current status: ${report.status.toUpperCase()}\nChoose new status:`,
      [
        ...STATUS_OPTIONS.filter((s) => s !== report.status).map((s) => ({
          text: s.charAt(0).toUpperCase() + s.slice(1),
          onPress: async () => {
            try {
              await api.put(`/admin/reports/${report._id}`, { status: s, resolution: `Marked as ${s} by admin` });
              setReports((prev) => prev.map((r) => r._id === report._id ? { ...r, status: s } : r));
            } catch (e) {
              Alert.alert('Error', 'Could not update report.');
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const banFromReport = (report) => {
    Alert.alert(
      'Ban Mechanic',
      `Ban mechanic "${report.mechanic_name}" based on this report?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban Mechanic',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/admin/reports/${report._id}`, {
                status: 'resolved',
                action: 'ban',
                resolution: 'Mechanic banned due to user report.',
              });
              setReports((prev) => prev.map((r) => r._id === report._id ? { ...r, status: 'resolved' } : r));
              Alert.alert('Done', 'Mechanic has been banned and report resolved.');
            } catch (e) {
              Alert.alert('Error', 'Could not complete action.');
            }
          },
        },
      ],
    );
  };

  const renderReport = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#7f8c8d' }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.dateText}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Reported Mechanic</Text>
        <Text style={styles.value} numberOfLines={1}>{item.mechanic_name || 'Unknown'}</Text>
        <Text style={styles.subValue} numberOfLines={1}>{item.mechanic_address || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Reported By</Text>
        <Text style={styles.value} numberOfLines={1}>{item.reporter_name || 'Unknown'}</Text>
        <Text style={styles.subValue} numberOfLines={1}>{item.reporter_email || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Reason</Text>
        <Text style={styles.reason} numberOfLines={5}>{item.reason}</Text>
      </View>

      {item.resolution ? (
        <View style={styles.section}>
          <Text style={styles.label}>Resolution</Text>
          <Text style={styles.value}>{item.resolution}</Text>
        </View>
      ) : null}

      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => updateReport(item)}>
            <Icon name="edit" size={16} color="#3498db" />
            <Text style={styles.actionBtnText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.banBtn]} onPress={() => banFromReport(item)}>
            <Icon name="block" size={16} color="#fff" />
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Ban Mechanic</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {[{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'resolved', label: 'Resolved' }, { key: 'dismissed', label: 'Dismissed' }].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterChip, statusFilter === key && styles.filterChipActive]}
            onPress={() => { setStatusFilter(key); loadReports(1, key); }}
          >
            <Text style={[styles.filterChipText, statusFilter === key && styles.filterChipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countText}>{total} total reports</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading reports…</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(r) => r._id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          keyboardShouldPersistTaps="handled"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="flag" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>No reports found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterRow: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#f0f0f0', marginRight: 6 },
  filterChipActive: { backgroundColor: '#3498db' },
  filterChipText: { fontSize: 12, color: '#666' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  countRow: { paddingHorizontal: 15, paddingVertical: 6, backgroundColor: '#f8f9fa' },
  countText: { fontSize: 12, color: '#7f8c8d' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 10, color: '#7f8c8d' },
  list: { padding: 10, paddingBottom: 30 },
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  dateText: { fontSize: 12, color: '#7f8c8d' },
  section: { marginBottom: 8 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#7f8c8d', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 14, color: '#2c3e50', fontWeight: '500' },
  subValue: { fontSize: 12, color: '#7f8c8d' },
  reason: { fontSize: 14, color: '#2c3e50', lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1, borderColor: '#3498db',
  },
  banBtn: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  actionBtnText: { fontSize: 13, color: '#3498db', fontWeight: '600', marginLeft: 4 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginTop: 14 },
});

export default ReportsScreen;
