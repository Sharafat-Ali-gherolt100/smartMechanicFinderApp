import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

const PERIODS = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

const BarChart = ({ data, color = '#3498db', maxVal }) => {
  const max = maxVal || Math.max(...data.map((d) => d.count), 1);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={barStyles.container}>
        {data.map((d, i) => (
          <View key={i} style={barStyles.barWrapper}>
            <View style={[barStyles.bar, { height: Math.max(4, (d.count / max) * 100), backgroundColor: color }]} />
            <Text style={barStyles.barLabel} numberOfLines={1}>{d.date ? d.date.slice(5) : d.status || ''}</Text>
            <Text style={barStyles.barVal}>{d.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 8, minHeight: 130 },
  barWrapper: { alignItems: 'center', marginHorizontal: 4, width: 36 },
  bar: { width: 20, borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 9, color: '#7f8c8d', marginTop: 4, textAlign: 'center', maxWidth: 36 },
  barVal: { fontSize: 9, color: '#2c3e50', fontWeight: '600' },
});

const AnalyticsScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState(30);

  const loadAnalytics = async (d = days) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics', { params: { days: d } });
      setData(res.data);
    } catch (e) {
      Alert.alert('Error', 'Could not load analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadAnalytics(days); }, []);

  const handleRefresh = () => { setRefreshing(true); loadAnalytics(days); };

  const handlePeriodChange = (d) => {
    setDays(d);
    loadAnalytics(d);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading analytics…</Text>
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.periodBtn, days === p.value && styles.periodBtnActive]}
            onPress={() => handlePeriodChange(p.value)}
          >
            <Text style={[styles.periodBtnText, days === p.value && styles.periodBtnTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User Registrations */}
      <View style={styles.card}>
        <View style={styles.cardTitle}>
          <Icon name="people" size={20} color="#3498db" />
          <Text style={styles.cardTitleText}>New Registrations</Text>
        </View>
        {data.user_registrations?.length > 0 ? (
          <BarChart data={data.user_registrations} color="#3498db" />
        ) : (
          <Text style={styles.noData}>No registration data</Text>
        )}
      </View>

      {/* Service Completions */}
      <View style={styles.card}>
        <View style={styles.cardTitle}>
          <Icon name="build" size={20} color="#2ecc71" />
          <Text style={styles.cardTitleText}>Service Completions</Text>
        </View>
        {data.service_completions?.length > 0 ? (
          <BarChart data={data.service_completions} color="#2ecc71" />
        ) : (
          <Text style={styles.noData}>No service data</Text>
        )}
      </View>

      {/* SOS Requests */}
      <View style={styles.card}>
        <View style={styles.cardTitle}>
          <Icon name="warning" size={20} color="#e74c3c" />
          <Text style={styles.cardTitleText}>SOS Requests</Text>
        </View>
        {data.sos_requests?.length > 0 ? (
          <BarChart data={data.sos_requests} color="#e74c3c" />
        ) : (
          <Text style={styles.noData}>No SOS data</Text>
        )}
      </View>

      {/* Reports by Status */}
      <View style={styles.card}>
        <View style={styles.cardTitle}>
          <Icon name="flag" size={20} color="#f39c12" />
          <Text style={styles.cardTitleText}>Reports by Status</Text>
        </View>
        {data.reports_by_status?.length > 0 ? (
          <View style={styles.pieRow}>
            {data.reports_by_status.map((r, i) => (
              <View key={i} style={styles.pieItem}>
                <View style={[styles.pieDot, { backgroundColor: ['#f39c12', '#2ecc71', '#7f8c8d'][i % 3] }]} />
                <Text style={styles.pieLabel}>{r.status}</Text>
                <Text style={styles.pieVal}>{r.count}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noData}>No report data</Text>
        )}
      </View>

      {/* Mechanics by Status */}
      <View style={styles.card}>
        <View style={styles.cardTitle}>
          <Icon name="directions-car" size={20} color="#9b59b6" />
          <Text style={styles.cardTitleText}>Mechanics by Status</Text>
        </View>
        {data.mechanics_by_status?.length > 0 ? (
          <View style={styles.pieRow}>
            {data.mechanics_by_status.map((m, i) => (
              <View key={i} style={styles.pieItem}>
                <View style={[styles.pieDot, {
                  backgroundColor: m.status === 'open' ? '#2ecc71' : m.status === 'busy' ? '#f39c12' : '#e74c3c',
                }]} />
                <Text style={styles.pieLabel}>{m.status}</Text>
                <Text style={styles.pieVal}>{m.count}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noData}>No mechanic data</Text>
        )}
      </View>

      {/* Top Mechanics */}
      {data.top_mechanics?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardTitle}>
            <Icon name="star" size={20} color="#f1c40f" />
            <Text style={styles.cardTitleText}>Top Rated Mechanics</Text>
          </View>
          {data.top_mechanics.map((m, i) => (
            <View key={m._id} style={styles.topMechRow}>
              <Text style={styles.topMechRank}>#{i + 1}</Text>
              <View style={styles.topMechInfo}>
                <Text style={styles.topMechName}>{m.shop_name}</Text>
                <Text style={styles.topMechStats}>{m.total_ratings} ratings · {m.status}</Text>
              </View>
              <View style={styles.topMechRating}>
                <Icon name="star" size={14} color="#f1c40f" />
                <Text style={styles.topMechRatingText}>{(m.rating_average || 0).toFixed(1)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#7f8c8d' },
  periodRow: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  periodBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0f0f0', marginHorizontal: 4 },
  periodBtnActive: { backgroundColor: '#3498db' },
  periodBtnText: { fontSize: 13, color: '#666', fontWeight: '500' },
  periodBtnTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', margin: 10, marginBottom: 0, padding: 15, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitleText: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginLeft: 8 },
  noData: { fontSize: 13, color: '#bdc3c7', textAlign: 'center', paddingVertical: 20 },
  pieRow: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8 },
  pieItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  pieDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  pieLabel: { fontSize: 13, color: '#2c3e50', marginRight: 4, textTransform: 'capitalize' },
  pieVal: { fontSize: 13, fontWeight: 'bold', color: '#2c3e50' },
  topMechRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  topMechRank: { fontSize: 16, fontWeight: 'bold', color: '#bdc3c7', width: 28 },
  topMechInfo: { flex: 1 },
  topMechName: { fontSize: 14, fontWeight: '600', color: '#2c3e50' },
  topMechStats: { fontSize: 11, color: '#7f8c8d', marginTop: 2 },
  topMechRating: { flexDirection: 'row', alignItems: 'center' },
  topMechRatingText: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginLeft: 3 },
});

export default AnalyticsScreen;
