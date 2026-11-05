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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { MechanicService } from '../../components/services/mechanicService';
import { api } from '../../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [needsStatusUpdate, setNeedsStatusUpdate] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    mechanic: null,
    statistics: {
      total_services: 0,
      pending_services: 0,
      in_progress_services: 0,
      average_rating: 0,
      total_ratings: 0,
      active_sos_requests: 0,
      response_time: 0,
    },
    recent_services: [],
  });

  const [status, setStatus] = useState('closed');
  const [walkInModalVisible, setWalkInModalVisible] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    customer_name: '',
    customer_phone: '',
    service_type: '',
    vehicle_type: 'Car',
    vehicle_number: '',
    cost: '',
    description: '',
    status: 'completed',
  });

  const QUICK_SERVICES = [
    'Oil Change',
    'Brake Service',
    'Tire Replacement',
    'Battery Service',
    'Engine Tuning',
    'AC Service',
    'Wheel Alignment',
  ];

  const handleAddWalkInService = async () => {
    if (!walkInForm.customer_name.trim()) {
      Alert.alert('Required Field', 'Please enter customer name.');
      return;
    }
    if (!walkInForm.customer_phone.trim()) {
      Alert.alert('Required Field', 'Please enter customer phone number.');
      return;
    }
    if (!walkInForm.service_type.trim()) {
      Alert.alert('Required Field', 'Please enter or select a service type.');
      return;
    }

    setWalkInLoading(true);
    try {
      const payload = {
        customer_name: walkInForm.customer_name.trim(),
        customer_phone: walkInForm.customer_phone.trim(),
        service_type: walkInForm.service_type.trim(),
        vehicle_type: walkInForm.vehicle_type || 'Car',
        vehicle_number: walkInForm.vehicle_number ? walkInForm.vehicle_number.trim().toUpperCase() : '',
        cost: walkInForm.cost ? parseFloat(walkInForm.cost) : null,
        description: walkInForm.description ? walkInForm.description.trim() : '',
        status: walkInForm.status || 'completed',
      };

      await api.post('/history/mechanic/add', payload);
      Alert.alert('Success', 'Walk-in service record added successfully!');
      setWalkInModalVisible(false);
      setWalkInForm({
        customer_name: '',
        customer_phone: '',
        service_type: '',
        vehicle_type: 'Car',
        vehicle_number: '',
        cost: '',
        description: '',
        status: 'completed',
      });
      loadDashboard();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add service record.';
      Alert.alert('Error', msg);
    } finally {
      setWalkInLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    checkOfflineReminder();
    const interval = setInterval(() => {
      checkOfflineReminder();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkOfflineReminder = async () => {
    try {
      const res = await api.get('/mechanic/offline-status-check');
      const isDue = Boolean(res.data?.offline_reminder_due || res.data?.needs_status_update);
      const currentShopStatus = res.data?.status || status;
      const formattedStatus =
        currentShopStatus && typeof currentShopStatus === 'string'
          ? currentShopStatus.charAt(0).toUpperCase() + currentShopStatus.slice(1).toLowerCase()
          : 'Closed';

      if (isDue) {
        setNeedsStatusUpdate(true);
        await AsyncStorage.setItem('mechanic_needs_status_update', 'true');

        Alert.alert(
          'Shop Status Alert',
          `Your shop is still ${formattedStatus}. Tap to update your status.`,
          [
            {
              text: `Keep ${formattedStatus}`,
              style: 'cancel',
              onPress: async () => {
                try {
                  await api.post('/mechanic/offline-status-dismiss');
                } catch (e) {}
              },
            },
            {
              text: 'Turn Shop OPEN',
              onPress: () => handleStatusToggle('open'),
            },
          ],
          { cancelable: false }
        );
      } else {
        if (currentShopStatus === 'open') {
          setNeedsStatusUpdate(false);
          await AsyncStorage.removeItem('mechanic_needs_status_update');
        }
      }
    } catch (e) {
      console.warn('Offline status check error:', e);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mechanic/dashboard');
      setDashboardData(response.data);
      const currentStatus = response.data.mechanic?.status || 'closed';
      setStatus(currentStatus);

      if (response.data.mechanic?.needs_status_update) {
        setNeedsStatusUpdate(true);
        await AsyncStorage.setItem('mechanic_needs_status_update', 'true');
      } else if (currentStatus === 'open') {
        setNeedsStatusUpdate(false);
        await AsyncStorage.removeItem('mechanic_needs_status_update');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    await checkOfflineReminder();
    setRefreshing(false);
  };

  const handleStatusToggle = async (newStatus) => {
    try {
      const response = await MechanicService.updateStatus(newStatus);
      setStatus(newStatus);
      if (newStatus === 'open') {
        setNeedsStatusUpdate(false);
        await AsyncStorage.removeItem('mechanic_needs_status_update');
      }
      Alert.alert('Success', `Status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleViewRequests = () => {
    navigation.navigate('MechanicRequests');
  };

  const handleViewMessages = () => {
    // ChatTab is the tab that owns ChatListScreen.
    navigation.navigate('ChatTab');
  };

  const handleViewServices = () => {
    navigation.navigate('MechanicServices');
  };

  const handleViewHistory = () => {
    navigation.navigate('MechanicHistory');
  };

  const handleViewRatings = () => {
    navigation.navigate('MechanicRatings');
  };

  const handleViewProfile = () => {
    navigation.navigate('MechanicProfile');
  };

  const handleViewSOS = () => {
    navigation.navigate('MechanicSOS');
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

  const { statistics, mechanic } = dashboardData;

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
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.shopName} numberOfLines={1}>{mechanic?.shop_name || 'Mechanic'}</Text>
          <Text style={styles.verificationStatus}>
            {mechanic?.is_verified ? (
              <Text style={styles.verifiedText}>✅ Verified</Text>
            ) : (
              <Text style={styles.unverifiedText}>⏳ Pending Verification</Text>
            )}
          </Text>
        </View>
        <TouchableOpacity onPress={handleViewProfile} style={styles.profileButton}>
          <Icon name="person" size={30} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutIconButton}>
          <Icon name="logout" size={26} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      {/* Status Control */}
      <View style={[styles.statusSection, needsStatusUpdate && styles.statusSectionAlert]}>
        <View style={styles.statusHeaderRow}>
          <View style={styles.titleWithDotRow}>
            <Text style={styles.sectionTitle}>Shop Status</Text>
            {needsStatusUpdate && <View style={styles.statusRedDot} />}
          </View>
          {needsStatusUpdate && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>ACTION REQUIRED</Text>
            </View>
          )}
        </View>

        {needsStatusUpdate && (
          <View style={styles.statusWarningCard}>
            <View style={styles.warningHeaderRow}>
              <Icon name="warning" size={18} color="#e74c3c" />
              <Text style={styles.warningCardTitle}>
                Shop is {status.toUpperCase()} for &gt; 3 mins
              </Text>
            </View>
            <Text style={styles.warningCardDesc}>
              Your shop is still {status}. Tap below to update status and receive customer requests.
            </Text>
            <TouchableOpacity
              style={styles.reopenButton}
              onPress={() => handleStatusToggle('open')}
            >
              <Icon name="check-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.reopenButtonText}>Tap to Open Shop Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              status === 'open' && styles.statusButtonActive,
              { backgroundColor: status === 'open' ? '#2ecc71' : '#f0f0f0' },
            ]}
            onPress={() => handleStatusToggle('open')}
          >
            <Icon name="check-circle" size={20} color={status === 'open' ? '#fff' : '#666'} />
            <Text style={[styles.statusButtonText, status === 'open' && styles.statusButtonTextActive]}>
              Open
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              status === 'busy' && styles.statusButtonActive,
              { backgroundColor: status === 'busy' ? '#f39c12' : '#f0f0f0' },
            ]}
            onPress={() => handleStatusToggle('busy')}
          >
            <Icon name="timer" size={20} color={status === 'busy' ? '#fff' : '#666'} />
            <Text style={[styles.statusButtonText, status === 'busy' && styles.statusButtonTextActive]}>
              Busy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              status === 'closed' && styles.statusButtonActive,
              { backgroundColor: status === 'closed' ? '#e74c3c' : '#f0f0f0' },
            ]}
            onPress={() => handleStatusToggle('closed')}
          >
            <Icon name="close" size={20} color={status === 'closed' ? '#fff' : '#666'} />
            <Text style={[styles.statusButtonText, status === 'closed' && styles.statusButtonTextActive]}>
              Closed
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.currentStatusText}>
          Current Status: <Text style={{ fontWeight: 'bold', color: status === 'open' ? '#2ecc71' : status === 'busy' ? '#f39c12' : '#e74c3c' }}>
            {status.toUpperCase()}
          </Text>
        </Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Icon name="assignment" size={24} color="#3498db" />
            <Text style={styles.statNumber}>{statistics.total_services || 0}</Text>
            <Text style={styles.statLabel}>Total Services</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Icon name="star" size={24} color="#2ecc71" />
            <Text style={styles.statNumber}>{statistics.average_rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Icon name="pending" size={24} color="#f39c12" />
            <Text style={styles.statNumber}>{statistics.pending_services || 0}</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleViewRequests}>
            <Icon name="assignment-ind" size={32} color="#9b59b6" />
            <Text style={styles.actionLabel}>Job Board</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => setWalkInModalVisible(true)}>
            <Icon name="post-add" size={32} color="#27ae60" />
            <Text style={styles.actionLabel}>Add Walk-in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleViewServices}>
            <Icon name="build" size={32} color="#3498db" />
            <Text style={styles.actionLabel}>Services</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleViewHistory}>
            <Icon name="history" size={32} color="#2ecc71" />
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleViewRatings}>
            <Icon name="rate-review" size={32} color="#f1c40f" />
            <Text style={styles.actionLabel}>Reviews</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleViewMessages}>
            <Icon name="chat" size={32} color="#1abc9c" />
            <Text style={styles.actionLabel}>Messages</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Services */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Services</Text>
          <TouchableOpacity
            style={styles.addWalkInBtn}
            onPress={() => setWalkInModalVisible(true)}
          >
            <Icon name="add-circle" size={18} color="#fff" />
            <Text style={styles.addWalkInBtnText}>+ Add Walk-in</Text>
          </TouchableOpacity>
        </View>
        {dashboardData.recent_services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent services</Text>
          </View>
        ) : (
          dashboardData.recent_services.map((service) => (
            <View key={service.service_id} style={styles.recentItem}>
              <View style={styles.recentItemLeft}>
                <Text style={styles.recentItemTitle} numberOfLines={1}>{service.service_type}</Text>
                <Text style={styles.recentItemDate}>
                  {new Date(service.created_at).toLocaleDateString()}
                  {service.cost ? ` • Rs. ${service.cost}` : ''}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: service.status === 'completed' ? '#2ecc71' : '#f39c12' }
              ]}>
                <Text style={styles.statusBadgeText} numberOfLines={1}>
                  {service.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>

    {/* Walk-in Service Modal */}
    <Modal
      visible={walkInModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setWalkInModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Icon name="person-add" size={24} color="#27ae60" />
              <Text style={styles.modalTitle}>Add Walk-in Service</Text>
            </View>
            <TouchableOpacity
              onPress={() => setWalkInModalVisible(false)}
              style={styles.closeBtn}
            >
              <Icon name="close" size={24} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text style={styles.inputLabel}>
              Customer Name <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g. Ali Khan"
              placeholderTextColor="#95a5a6"
              value={walkInForm.customer_name}
              onChangeText={(text) =>
                setWalkInForm((prev) => ({ ...prev, customer_name: text }))
              }
            />

            <Text style={styles.inputLabel}>
              Customer Phone <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 03001234567"
              placeholderTextColor="#95a5a6"
              keyboardType="phone-pad"
              value={walkInForm.customer_phone}
              onChangeText={(text) =>
                setWalkInForm((prev) => ({ ...prev, customer_phone: text }))
              }
            />

            <Text style={styles.inputLabel}>
              Service Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g. Oil Change, Brake Service"
              placeholderTextColor="#95a5a6"
              value={walkInForm.service_type}
              onChangeText={(text) =>
                setWalkInForm((prev) => ({ ...prev, service_type: text }))
              }
            />

            {/* Quick Service Chips */}
            <View style={styles.chipContainer}>
              {QUICK_SERVICES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    walkInForm.service_type === item && styles.chipSelected,
                  ]}
                  onPress={() =>
                    setWalkInForm((prev) => ({ ...prev, service_type: item }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      walkInForm.service_type === item && styles.chipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Vehicle Type</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Car / Bike"
                  placeholderTextColor="#95a5a6"
                  value={walkInForm.vehicle_type}
                  onChangeText={(text) =>
                    setWalkInForm((prev) => ({ ...prev, vehicle_type: text }))
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Vehicle No.</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="LEA-1234"
                  placeholderTextColor="#95a5a6"
                  autoCapitalize="characters"
                  value={walkInForm.vehicle_number}
                  onChangeText={(text) =>
                    setWalkInForm((prev) => ({ ...prev, vehicle_number: text }))
                  }
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Cost / Charges (Rs.)</Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 2500"
              placeholderTextColor="#95a5a6"
              keyboardType="numeric"
              value={walkInForm.cost}
              onChangeText={(text) =>
                setWalkInForm((prev) => ({ ...prev, cost: text }))
              }
            />

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.inputField, styles.textArea]}
              placeholder="Work details, parts replaced, remarks..."
              placeholderTextColor="#95a5a6"
              multiline={true}
              numberOfLines={3}
              value={walkInForm.description}
              onChangeText={(text) =>
                setWalkInForm((prev) => ({ ...prev, description: text }))
              }
            />

            <Text style={styles.inputLabel}>Job Status</Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  walkInForm.status === 'completed' && styles.statusOptionActive,
                ]}
                onPress={() =>
                  setWalkInForm((prev) => ({ ...prev, status: 'completed' }))
                }
              >
                <Icon
                  name="check-circle"
                  size={16}
                  color={walkInForm.status === 'completed' ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.statusOptionText,
                    walkInForm.status === 'completed' && styles.statusOptionTextActive,
                  ]}
                >
                  Completed
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  walkInForm.status === 'in_progress' && styles.statusOptionActiveOrange,
                ]}
                onPress={() =>
                  setWalkInForm((prev) => ({ ...prev, status: 'in_progress' }))
                }
              >
                <Icon
                  name="hourglass-empty"
                  size={16}
                  color={walkInForm.status === 'in_progress' ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.statusOptionText,
                    walkInForm.status === 'in_progress' && styles.statusOptionTextActive,
                  ]}
                >
                  In Progress
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setWalkInModalVisible(false)}
                disabled={walkInLoading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAddWalkInService}
                disabled={walkInLoading}
              >
                {walkInLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="check" size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>Save Service Record</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  verificationStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  verifiedText: {
    color: '#2ecc71',
  },
  unverifiedText: {
    color: '#f39c12',
  },
  profileButton: {
    padding: 5,
    marginRight: 8,
  },
  logoutIconButton: {
    padding: 5,
  },
  statusSection: {
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusSectionAlert: {
    borderWidth: 1.5,
    borderColor: '#e74c3c',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
    marginLeft: 8,
  },
  urgentBadge: {
    backgroundColor: '#fadbd8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  urgentBadgeText: {
    color: '#c0392b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusWarningCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warningCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991b1b',
    marginLeft: 6,
  },
  warningCardDesc: {
    fontSize: 12,
    color: '#7f1d1d',
    marginBottom: 10,
    lineHeight: 16,
  },
  reopenButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  reopenButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statusButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  currentStatusText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  statsSection: {
    paddingHorizontal: 15,
    marginTop: 15,
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
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginHorizontal: 3,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 4,
    textAlign: 'center',
  },
  recentSection: {
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addWalkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addWalkInBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 4,
    marginTop: 10,
  },
  requiredStar: {
    color: '#e74c3c',
  },
  inputField: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2c3e50',
  },
  textArea: {
    height: 65,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#edf2f7',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    marginRight: 6,
    marginBottom: 6,
  },
  chipSelected: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  chipText: {
    fontSize: 12,
    color: '#4a5568',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusToggleRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  statusOptionActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  statusOptionActiveOrange: {
    backgroundColor: '#f39c12',
    borderColor: '#f39c12',
  },
  statusOptionText: {
    fontSize: 13,
    color: '#4a5568',
    marginLeft: 4,
  },
  statusOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#edf2f7',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#27ae60',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
});

export default DashboardScreen;