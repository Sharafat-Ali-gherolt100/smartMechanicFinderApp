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
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api  from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    statistics: {
      users: { total: 0, new_today: 0, new_week: 0, new_month: 0 },
      mechanics: { total: 0, verified: 0, banned: 0, open: 0 },
      services: { total: 0, completed: 0, pending: 0, in_progress: 0 },
      reports: { total: 0, pending: 0, resolved: 0, dismissed: 0 },
      sos: { total: 0, active: 0, resolved: 0 },
      emergency_alerts: { total: 0, pending: 0, in_progress: 0, resolved: 0 },
    },
    recent_reports: [],
    recent_users: [],
    recent_sos: [],
    recent_emergency_alerts: [],
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const { statistics, recent_reports, recent_users, recent_sos, recent_emergency_alerts } = dashboardData;

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Overview of system activity</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={26} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statCard, styles.statCardBlue]}
            onPress={() => handleNavigate('ManageUsers')}
          >
            <Icon name="people" size={32} color="#3498db" />
            <Text style={styles.statNumber}>{statistics.users.total}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statChange}>+{statistics.users.new_today} today</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, styles.statCardGreen]}
            onPress={() => handleNavigate('ManageMechanics')}
          >
            <Icon name="build" size={32} color="#2ecc71" />
            <Text style={styles.statNumber}>{statistics.mechanics.total}</Text>
            <Text style={styles.statLabel}>Total Mechanics</Text>
            <Text style={styles.statChange}>{statistics.mechanics.verified} verified</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statCard, styles.statCardOrange]}
            onPress={() => handleNavigate('Reports')}
          >
            <Icon name="flag" size={32} color="#f39c12" />
            <Text style={styles.statNumber}>{statistics.reports.pending}</Text>
            <Text style={styles.statLabel}>Pending Reports</Text>
            <Text style={styles.statChange}>{statistics.reports.total} total</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, styles.statCardPurple]}
            onPress={() => handleNavigate('Analytics')}
          >
            <Icon name="assignment" size={32} color="#9b59b6" />
            <Text style={styles.statNumber}>{statistics.services.total}</Text>
            <Text style={styles.statLabel}>Total Services</Text>
            <Text style={styles.statChange}>{statistics.services.completed} completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => handleNavigate('ManageUsers')}
          >
            <Icon name="people" size={28} color="#3498db" />
            <Text style={styles.actionLabel}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => handleNavigate('ManageMechanics')}
          >
            <Icon name="build" size={28} color="#2ecc71" />
            <Text style={styles.actionLabel}>Mechanics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => handleNavigate('Reports')}
          >
            <Icon name="flag" size={28} color="#f39c12" />
            <Text style={styles.actionLabel}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => handleNavigate('Analytics')}
          >
            <Icon name="analytics" size={28} color="#9b59b6" />
            <Text style={styles.actionLabel}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleNavigate('EmergencyAlerts')}
          >
            <Icon name="campaign" size={28} color="#e74c3c" />
            <Text style={styles.actionLabel}>Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Reports */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Reports</Text>
        {recent_reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reports</Text>
          </View>
        ) : (
          recent_reports.map((report) => (
            <View key={report._id} style={styles.recentItem}>
              <View style={styles.recentItemLeft}>
                <Text style={styles.recentItemTitle} numberOfLines={1}>{report.reason}</Text>
                <Text style={styles.recentItemDate}>
                  {new Date(report.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: report.status === 'pending' ? '#f39c12' : 
                                  report.status === 'resolved' ? '#2ecc71' : '#e74c3c' 
                }
              ]}>
                <Text style={styles.statusBadgeText} numberOfLines={1}>{report.status.toUpperCase()}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent Users */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Users</Text>
        {recent_users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users</Text>
          </View>
        ) : (
          recent_users.map((user) => (
            <View key={user._id} style={styles.recentItem}>
              <View style={styles.recentItemLeft}>
                <Text style={styles.recentItemTitle} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.recentItemDate} numberOfLines={1}>{user.email}</Text>
              </View>
              <Text style={styles.recentItemTime}>
                {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* SOS Status */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>SOS Status</Text>
        <View style={styles.sosStats}>
          <View style={styles.sosStat}>
            <Text style={styles.sosStatNumber}>{statistics.sos.active}</Text>
            <Text style={styles.sosStatLabel}>Active</Text>
          </View>
          <View style={styles.sosStat}>
            <Text style={styles.sosStatNumber}>{statistics.sos.resolved}</Text>
            <Text style={styles.sosStatLabel}>Resolved</Text>
          </View>
          <View style={styles.sosStat}>
            <Text style={styles.sosStatNumber}>{statistics.sos.total}</Text>
            <Text style={styles.sosStatLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Emergency Alerts */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Service Alerts</Text>
          <TouchableOpacity onPress={() => handleNavigate('EmergencyAlerts')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sosStats}>
          <View style={styles.sosStat}>
            <Text style={[styles.sosStatNumber, { color: '#f39c12' }]}>
              {statistics.emergency_alerts?.pending ?? 0}
            </Text>
            <Text style={styles.sosStatLabel}>Pending</Text>
          </View>
          <View style={styles.sosStat}>
            <Text style={[styles.sosStatNumber, { color: '#9b59b6' }]}>
              {statistics.emergency_alerts?.in_progress ?? 0}
            </Text>
            <Text style={styles.sosStatLabel}>In Progress</Text>
          </View>
          <View style={styles.sosStat}>
            <Text style={[styles.sosStatNumber, { color: '#2ecc71' }]}>
              {statistics.emergency_alerts?.resolved ?? 0}
            </Text>
            <Text style={styles.sosStatLabel}>Resolved</Text>
          </View>
          <View style={styles.sosStat}>
            <Text style={styles.sosStatNumber}>
              {statistics.emergency_alerts?.total ?? 0}
            </Text>
            <Text style={styles.sosStatLabel}>Total</Text>
          </View>
        </View>

        {(recent_emergency_alerts || []).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No emergency alerts</Text>
          </View>
        ) : (
          (recent_emergency_alerts || []).map(alert => (
            <View key={alert._id} style={styles.recentItem}>
              <View style={styles.recentItemLeft}>
                <Text style={styles.recentItemTitle} numberOfLines={1}>
                  {alert.user_name}: {alert.message}
                </Text>
                <Text style={styles.recentItemDate}>
                  {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : ''}
                  {alert.location_name ? ` • ${alert.location_name}` : ''}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    alert.status === 'pending'     ? '#f39c12' :
                    alert.status === 'in_progress' ? '#9b59b6' :
                    alert.status === 'resolved'    ? '#2ecc71' : '#95a5a6',
                }
              ]}>
                <Text style={styles.statusBadgeText}>{alert.status.toUpperCase()}</Text>
              </View>
            </View>
          ))
        )}

        {(recent_emergency_alerts || []).length > 0 && (
          <TouchableOpacity
            style={styles.manageAlertsBtn}
            onPress={() => handleNavigate('EmergencyAlerts')}
          >
            <Icon name="campaign" size={16} color="#e74c3c" />
            <Text style={styles.manageAlertsBtnText}>Manage All Alerts</Text>
            <Icon name="chevron-right" size={16} color="#e74c3c" />
          </TouchableOpacity>
        )}
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  statsGrid: {
    padding: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardBlue: {
    borderTopWidth: 3,
    borderTopColor: '#3498db',
  },
  statCardGreen: {
    borderTopWidth: 3,
    borderTopColor: '#2ecc71',
  },
  statCardOrange: {
    borderTopWidth: 3,
    borderTopColor: '#f39c12',
  },
  statCardPurple: {
    borderTopWidth: 3,
    borderTopColor: '#9b59b6',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  statChange: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
  quickActions: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 4,
  },
  recentSection: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentItemLeft: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  recentItemDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  recentItemTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  sosStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  sosStat: {
    alignItems: 'center',
  },
  sosStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sosStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 13,
    color: '#3498db',
    fontWeight: '600',
  },
  manageAlertsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 8,
    gap: 6,
  },
  manageAlertsBtnText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default AdminDashboardScreen;