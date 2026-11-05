import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

const UserServiceRequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingOfferId, setProcessingOfferId] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get('/service-requests/user/my');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching user service requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRequests();
    });
    return unsubscribe;
  }, [fetchRequests, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAcceptOffer = async (requestId, mechanicId, mechanicName, totalAmount) => {
    Alert.alert(
      'Accept Offer',
      `Are you sure you want to accept the offer from ${mechanicName} for a total of PKR ${totalAmount?.toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setProcessingOfferId(`${requestId}-${mechanicId}`);
            try {
              const res = await api.post(`/service-requests/${requestId}/offers/${mechanicId}/accept`);
              Alert.alert(
                'Offer Accepted!',
                'The mechanic has been selected for your service request. You can now chat directly.',
                [
                  {
                    text: 'Open Chat',
                    onPress: () =>
                      navigation.navigate('ChatDetail', {
                        conversationId: res.data.conversation_id,
                        mechanicId: mechanicId,
                        partnerName: mechanicName,
                      }),
                  },
                  { text: 'OK', onPress: () => fetchRequests() },
                ]
              );
              fetchRequests();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to accept offer');
            } finally {
              setProcessingOfferId(null);
            }
          },
        },
      ]
    );
  };

  const handleRejectOffer = async (requestId, mechanicId) => {
    try {
      await api.post(`/service-requests/${requestId}/offers/${mechanicId}/reject`);
      fetchRequests();
    } catch (err) {
      Alert.alert('Error', 'Failed to reject offer');
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'accepted':
        return { bg: '#e8f8f5', text: '#2ecc71', label: 'ACCEPTED' };
      case 'in_progress':
        return { bg: '#fef9e7', text: '#f39c12', label: 'IN PROGRESS' };
      case 'completed':
        return { bg: '#ebf5fb', text: '#3498db', label: 'COMPLETED' };
      default:
        return { bg: '#fef9e7', text: '#e67e22', label: 'WAITING FOR OFFERS' };
    }
  };

  const renderOfferCard = (req, off) => {
    const isPending = off.status === 'pending';
    const isProcessing = processingOfferId === `${req._id}-${off.mechanic_id}`;

    return (
      <View key={off.offer_id} style={styles.offerCard}>
        <View style={styles.offerHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.offerShopName}>{off.shop_name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Icon name="star" size={13} color="#f1c40f" />
              <Text style={styles.offerRating}>{(off.rating_average || 0).toFixed(1)}</Text>
              <Text style={styles.offerDistance}> · {off.distance_km || 0} km away</Text>
            </View>
          </View>
          {off.percentage_increase > 0 ? (
            <View style={styles.increaseBadge}>
              <Text style={styles.increaseBadgeText}>+{off.percentage_increase}%</Text>
            </View>
          ) : (
            <View style={styles.acceptedBudgetBadge}>
              <Text style={styles.acceptedBudgetBadgeText}>Accepted Budget</Text>
            </View>
          )}
        </View>

        {/* Pricing Comparison */}
        <View style={styles.offerPricingTable}>
          <View style={styles.offerPriceRow}>
            <Text style={styles.offerPriceLabel}>Your Budget:</Text>
            <Text style={styles.offerPriceVal}>PKR {req.proposed_budget?.toLocaleString()}</Text>
          </View>
          <View style={styles.offerPriceRow}>
            <Text style={styles.offerPriceLabel}>Mechanic's Service Offer:</Text>
            <Text style={[styles.offerPriceVal, off.percentage_increase > 0 && { color: '#e67e22' }]}>
              PKR {off.proposed_amount?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.offerPriceRow}>
            <Text style={styles.offerPriceLabel}>Travel Charge ({off.distance_km || 0} km @ PKR 400/km):</Text>
            <Text style={styles.offerPriceVal}>+ PKR {off.travel_charge?.toLocaleString()}</Text>
          </View>
          <View style={[styles.offerPriceRow, styles.offerTotalRow]}>
            <Text style={styles.offerTotalLabel}>Total Amount:</Text>
            <Text style={styles.offerTotalVal}>PKR {off.total_amount?.toLocaleString()}</Text>
          </View>
        </View>

        {isPending && req.status === 'pending' && (
          <View style={styles.offerActionRow}>
            <TouchableOpacity
              style={styles.btnAcceptOffer}
              onPress={() => handleAcceptOffer(req._id, off.mechanic_id, off.shop_name, off.total_amount)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnAcceptOfferText}>Accept Offer</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnRejectOffer}
              onPress={() => handleRejectOffer(req._id, off.mechanic_id)}
              disabled={isProcessing}
            >
              <Text style={styles.btnRejectOfferText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    const mech = item.accepted_mechanic;
    const offers = item.offers || [];
    const isPending = item.status === 'pending';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceType}>{item.service_type}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>

        <Text style={styles.vehicleType}>Vehicle: {item.vehicle_type}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Your Proposed Budget:</Text>
          <Text style={styles.budgetValue}>PKR {item.proposed_budget?.toLocaleString()}</Text>
        </View>

        <View style={styles.locationRow}>
          <Icon name="place" size={16} color="#7f8c8d" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location_name || 'Skardu'}
          </Text>
        </View>

        {/* Accepted Mechanic Details */}
        {item.status !== 'pending' && mech && (
          <View style={styles.mechanicSection}>
            <View style={styles.mechanicRow}>
              <Icon name="verified-user" size={20} color="#2ecc71" />
              <View style={styles.mechanicInfo}>
                <Text style={styles.mechanicShopName}>{mech.shop_name}</Text>
                <Text style={styles.mechanicPhone}>Phone: {mech.phone}</Text>
              </View>
            </View>

            <View style={styles.acceptedCostBox}>
              <Text style={styles.acceptedCostText}>
                Service: PKR {item.agreed_service_amount?.toLocaleString()} | Travel: PKR {item.travel_charge?.toLocaleString()} | Total: PKR {item.total_amount?.toLocaleString()}
              </Text>
            </View>

            {/* Added Service Items Display */}
            {item.service_items && item.service_items.length > 0 && (
              <View style={styles.serviceItemsBox}>
                <Text style={styles.serviceItemsTitle}>Performed Service Details:</Text>
                {item.service_items.map((it, idx) => (
                  <View key={it.item_id || idx} style={styles.serviceItemRow}>
                    <Text style={styles.serviceItemName}>• {it.item_name} (x{it.quantity || 1})</Text>
                    <Text style={styles.serviceItemPrice}>PKR {((it.price || 0) * (it.quantity || 1)).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.chatButton}
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  conversationId: item.conversation_id,
                  mechanicId: mech._id,
                  partnerName: mech.shop_name,
                })
              }
            >
              <Icon name="chat" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.chatButtonText}>Chat with Accepted Mechanic</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Offers list when pending */}
        {isPending && (
          <View style={styles.offersContainer}>
            <Text style={styles.offersHeading}>
              Mechanic Offers ({offers.length}):
            </Text>

            {offers.length === 0 ? (
              <View style={styles.waitingBox}>
                <ActivityIndicator size="small" color="#e67e22" style={{ marginRight: 8 }} />
                <Text style={styles.waitingText}>
                  Broadcasting to mechanics. You will see offers here as mechanics respond.
                </Text>
              </View>
            ) : (
              offers.map((off) => renderOfferCard(item, off))
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading Your Requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newRequestBtn}
        onPress={() => navigation.navigate('CreateServiceRequest')}
      >
        <Icon name="add-circle" size={22} color="#ffffff" style={{ marginRight: 6 }} />
        <Text style={styles.newRequestBtnText}>Request New Service</Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3498db']} />}
        contentContainerStyle={requests.length === 0 ? styles.emptyList : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={60} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>No Service Requests</Text>
            <Text style={styles.emptySubtitle}>
              Create a service request with your budget when your vehicle needs repairs.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 15, color: '#7f8c8d' },
  newRequestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2ecc71', marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    paddingVertical: 12, borderRadius: 10, elevation: 2,
  },
  newRequestBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  listContent: { padding: 16, paddingBottom: 30 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  serviceType: { fontSize: 17, fontWeight: 'bold', color: '#2c3e50', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  vehicleType: { fontSize: 13, color: '#7f8c8d', marginBottom: 6 },
  description: { fontSize: 14, color: '#34495e', lineHeight: 20, marginBottom: 8 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f4fbf7', padding: 8, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#e2f5ec' },
  budgetLabel: { fontSize: 13, color: '#27ae60', fontWeight: '500' },
  budgetValue: { fontSize: 13, fontWeight: 'bold', color: '#27ae60' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  locationText: { fontSize: 13, color: '#7f8c8d', marginLeft: 4 },
  offersContainer: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  offersHeading: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  waitingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fefde8', padding: 10, borderRadius: 8 },
  waitingText: { fontSize: 12, color: '#854d0e', flex: 1 },
  offerCard: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#edf2f7' },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  offerShopName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
  offerRating: { fontSize: 12, color: '#7f8c8d', marginLeft: 3 },
  offerDistance: { fontSize: 12, color: '#7f8c8d' },
  increaseBadge: { backgroundColor: '#fdeed9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  increaseBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#e67e22' },
  acceptedBudgetBadge: { backgroundColor: '#e8f8f5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  acceptedBudgetBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#27ae60' },
  offerPricingTable: { backgroundColor: '#ffffff', borderRadius: 6, padding: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  offerPriceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  offerPriceLabel: { fontSize: 12, color: '#7f8c8d' },
  offerPriceVal: { fontSize: 12, fontWeight: '600', color: '#2c3e50' },
  offerTotalRow: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 4, marginTop: 4 },
  offerTotalLabel: { fontSize: 13, fontWeight: 'bold', color: '#2c3e50' },
  offerTotalVal: { fontSize: 14, fontWeight: 'bold', color: '#27ae60' },
  offerActionRow: { flexDirection: 'row', gap: 8 },
  btnAcceptOffer: { flex: 2, backgroundColor: '#2ecc71', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnAcceptOfferText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  btnRejectOffer: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e74c3c', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnRejectOfferText: { color: '#e74c3c', fontSize: 13, fontWeight: '600' },
  mechanicSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  mechanicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mechanicInfo: { marginLeft: 8 },
  mechanicShopName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
  mechanicPhone: { fontSize: 12, color: '#7f8c8d' },
  acceptedCostBox: { backgroundColor: '#ebf5fb', padding: 8, borderRadius: 6, marginBottom: 8 },
  acceptedCostText: { fontSize: 12, color: '#2980b9', fontWeight: 'bold', textAlign: 'center' },
  serviceItemsBox: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  serviceItemsTitle: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
  serviceItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  serviceItemName: { fontSize: 12, color: '#475569' },
  serviceItemPrice: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  chatButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#3498db', paddingVertical: 11, borderRadius: 8,
  },
  chatButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: '#7f8c8d', textAlign: 'center', marginTop: 6 },
});

export default UserServiceRequestsScreen;
