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
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

const PERCENTAGE_OPTIONS = [10, 20, 30, 40];

const MechanicRequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingOfferId, setSubmittingOfferId] = useState(null);
  const [selectedIncreases, setSelectedIncreases] = useState({}); // reqId -> selected percent

  // Service item modal state
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemPrice, setItemPrice] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  const fetchAvailableRequests = useCallback(async () => {
    try {
      const res = await api.get('/service-requests/mechanic/available');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching available requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableRequests();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAvailableRequests();
    });
    return unsubscribe;
  }, [fetchAvailableRequests, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAvailableRequests();
  };

  const handleSelectPercentage = (reqId, percent) => {
    setSelectedIncreases((prev) => ({
      ...prev,
      [reqId]: prev[reqId] === percent ? 0 : percent,
    }));
  };

  const handleSubmitOffer = async (item, percent = 0) => {
    setSubmittingOfferId(item._id);
    try {
      const res = await api.post(`/service-requests/${item._id}/offer`, {
        percentage_increase: percent,
      });

      const off = res.data.offer;
      Alert.alert(
        'Offer Submitted!',
        `Your offer of PKR ${off.total_amount.toLocaleString()} (Service: PKR ${off.proposed_amount.toLocaleString()} + Travel: PKR ${off.travel_charge.toLocaleString()}) has been sent to the customer.`
      );
      fetchAvailableRequests();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit offer';
      Alert.alert('Offer Failed', errMsg);
      fetchAvailableRequests();
    } finally {
      setSubmittingOfferId(null);
    }
  };

  const handleAcceptBudgetDirect = (item) => {
    handleSubmitOffer(item, 0);
  };

  const openAddItemModal = (requestId) => {
    setActiveRequestId(requestId);
    setItemName('');
    setItemDesc('');
    setItemQty('1');
    setItemPrice('');
    setItemNotes('');
    setItemModalVisible(true);
  };

  const handleSaveServiceItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Required', 'Please enter a service/item name.');
      return;
    }
    const priceVal = parseFloat(itemPrice);
    if (isNaN(priceVal) || priceVal < 0) {
      Alert.alert('Price Required', 'Please enter a valid price/cost.');
      return;
    }

    setSavingItem(true);
    try {
      await api.post(`/service-requests/${activeRequestId}/items`, {
        item_name: itemName.trim(),
        description: itemDesc.trim(),
        quantity: parseInt(itemQty, 10) || 1,
        price: priceVal,
        notes: itemNotes.trim(),
      });

      Alert.alert('Item Added', 'Service detail logged and customer + admin notified.');
      setItemModalVisible(false);
      fetchAvailableRequests();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add service item');
    } finally {
      setSavingItem(false);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    Alert.alert(
      'Complete Service',
      'Are you sure you want to mark this service request as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await api.post(`/service-requests/${requestId}/complete`);
              Alert.alert('Completed', 'Service request marked completed.');
              fetchAvailableRequests();
            } catch (err) {
              Alert.alert('Error', 'Failed to complete request');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isAcceptedByMe = item.is_accepted_by_me;
    const isPending = item.status === 'pending';
    const chosenPercent = selectedIncreases[item._id] || 0;

    const baseBudget = item.proposed_budget || 0;
    const travelCharge = item.travel_charge || 0;
    const distanceKm = item.distance_km || 0;

    const previewServiceAmount = chosenPercent > 0
      ? Math.round(baseBudget * (1 + chosenPercent / 100))
      : baseBudget;
    const previewTotal = previewServiceAmount + travelCharge;

    const hasMyOffer = item.has_submitted_offer;
    const myOffer = item.my_offer;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfoRow}>
            <Icon name="person" size={20} color="#3498db" />
            <Text style={styles.userName}>{item.user_name || 'Customer'}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isPending ? styles.pendingBadge : styles.acceptedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isPending ? styles.pendingStatusText : styles.acceptedStatusText,
              ]}
            >
              {isPending ? 'AVAILABLE' : 'ACCEPTED BY YOU'}
            </Text>
          </View>
        </View>

        <Text style={styles.serviceType}>{item.service_type}</Text>
        <Text style={styles.vehicleType}>Vehicle: {item.vehicle_type}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.locationRow}>
          <Icon name="place" size={16} color="#e74c3c" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location_name || 'Skardu Breakdown Area'} ({distanceKm} km away)
          </Text>
        </View>

        {/* Pricing Breakdown Card */}
        <View style={styles.priceSummaryBox}>
          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Customer's Proposed Budget:</Text>
            <Text style={styles.priceBudgetVal}>PKR {baseBudget.toLocaleString()}</Text>
          </View>
          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Travel Charge ({distanceKm} km @ PKR 400/km):</Text>
            <Text style={styles.priceTravelVal}>+ PKR {travelCharge.toLocaleString()}</Text>
          </View>
          <View style={[styles.priceLine, styles.totalLine]}>
            <Text style={styles.totalLabel}>Estimated Total:</Text>
            <Text style={styles.totalVal}>PKR {(baseBudget + travelCharge).toLocaleString()}</Text>
          </View>
        </View>

        {/* Existing Offer Status if already submitted */}
        {hasMyOffer && isPending && (
          <View style={styles.myOfferBox}>
            <Icon name="local-offer" size={16} color="#27ae60" />
            <Text style={styles.myOfferText}>
              Your current offer: PKR {myOffer.total_amount?.toLocaleString()} ({myOffer.percentage_increase > 0 ? `+${myOffer.percentage_increase}%` : 'Accepted Budget'})
            </Text>
          </View>
        )}

        {/* Actions for Pending Requests */}
        {isPending && (
          <View style={styles.offerSection}>
            <Text style={styles.offerSectionTitle}>Respond with Offer:</Text>

            {/* Price Increase Slider Buttons */}
            <Text style={styles.sliderLabel}>Increase Service Price (Slider):</Text>
            <View style={styles.sliderRow}>
              {PERCENTAGE_OPTIONS.map((pct) => (
                <TouchableOpacity
                  key={pct}
                  style={[
                    styles.sliderChip,
                    chosenPercent === pct && styles.sliderChipActive,
                  ]}
                  onPress={() => handleSelectPercentage(item._id, pct)}
                >
                  <Text
                    style={[
                      styles.sliderChipText,
                      chosenPercent === pct && styles.sliderChipTextActive,
                    ]}
                  >
                    +{pct}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dynamic preview if increased */}
            {chosenPercent > 0 && (
              <View style={styles.counterPreviewCard}>
                <Text style={styles.counterPreviewText}>
                  Offer: PKR {previewServiceAmount.toLocaleString()} (+{chosenPercent}%) + PKR {travelCharge.toLocaleString()} Travel ={' '}
                  <Text style={{ fontWeight: 'bold', color: '#27ae60' }}>
                    PKR {previewTotal.toLocaleString()}
                  </Text>
                </Text>
              </View>
            )}

            <View style={styles.actionButtonRow}>
              <TouchableOpacity
                style={[styles.btnAcceptBudget, submittingOfferId === item._id && styles.btnDisabled]}
                onPress={() => handleAcceptBudgetDirect(item)}
                disabled={submittingOfferId === item._id}
              >
                <Text style={styles.btnAcceptBudgetText}>Accept Budget (PKR {baseBudget.toLocaleString()})</Text>
              </TouchableOpacity>

              {chosenPercent > 0 && (
                <TouchableOpacity
                  style={[styles.btnSendOffer, submittingOfferId === item._id && styles.btnDisabled]}
                  onPress={() => handleSubmitOffer(item, chosenPercent)}
                  disabled={submittingOfferId === item._id}
                >
                  <Text style={styles.btnSendOfferText}>Send +{chosenPercent}% Offer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Accepted Job Actions */}
        {isAcceptedByMe && (
          <View style={styles.acceptedActionSection}>
            <View style={styles.agreedBox}>
              <Text style={styles.agreedText}>
                Agreed Service: PKR {(item.agreed_service_amount || baseBudget).toLocaleString()} | Travel: PKR {travelCharge.toLocaleString()}
              </Text>
            </View>

            {/* Added Service Items Display */}
            {item.service_items && item.service_items.length > 0 && (
              <View style={styles.serviceItemsContainer}>
                <Text style={styles.serviceItemsHeader}>Service Items Performed:</Text>
                {item.service_items.map((it, idx) => (
                  <View key={it.item_id || idx} style={styles.serviceItemRow}>
                    <Text style={styles.serviceItemName}>• {it.item_name} (x{it.quantity || 1})</Text>
                    <Text style={styles.serviceItemPrice}>PKR {((it.price || 0) * (it.quantity || 1)).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.acceptedBtnRow}>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() =>
                  navigation.navigate('ChatDetail', {
                    conversationId: item.conversation_id,
                    partnerName: item.user_name || 'Customer',
                  })
                }
              >
                <Icon name="chat" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={() => openAddItemModal(item._id)}
              >
                <Icon name="playlist-add" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.addItemBtnText}>+ Add Service Details</Text>
              </TouchableOpacity>
            </View>

            {item.status !== 'completed' && (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => handleCompleteRequest(item._id)}
              >
                <Icon name="check-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.completeBtnText}>Mark Job Completed</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Fetching Service Requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2ecc71']} />}
        contentContainerStyle={requests.length === 0 ? styles.emptyList : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off" size={60} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>No Available Requests</Text>
            <Text style={styles.emptySubtitle}>
              New broadcasted service requests with customer budgets will appear here automatically.
            </Text>
          </View>
        }
      />

      {/* Add Service Item Modal */}
      <Modal
        visible={itemModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Performed Service Details</Text>
              <TouchableOpacity onPress={() => setItemModalVisible(false)}>
                <Icon name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalNotice}>
                Customer and Admin will be notified of newly added service details.
              </Text>

              <Text style={styles.fieldLabel}>Service / Part Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Brake Pad Replacement, Oil Filter"
                value={itemName}
                onChangeText={setItemName}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Details of work done..."
                value={itemDesc}
                onChangeText={setItemDesc}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Quantity</Text>
                  <TextInput
                    style={styles.textInput}
                    value={itemQty}
                    onChangeText={setItemQty}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={styles.fieldLabel}>Price / Cost (PKR) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 3500"
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Additional Notes / Warranty</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 6 Months Warranty, Original part"
                value={itemNotes}
                onChangeText={setItemNotes}
              />

              <TouchableOpacity
                style={styles.saveItemBtn}
                onPress={handleSaveServiceItem}
                disabled={savingItem}
              >
                {savingItem ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveItemBtnText}>Save & Notify Customer / Admin</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 15, color: '#7f8c8d' },
  listContent: { padding: 12, paddingBottom: 30 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginLeft: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pendingBadge: { backgroundColor: '#e8f8f5' },
  acceptedBadge: { backgroundColor: '#ebf5fb' },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  pendingStatusText: { color: '#2ecc71' },
  acceptedStatusText: { color: '#3498db' },
  serviceType: { fontSize: 17, fontWeight: 'bold', color: '#2c3e50', marginBottom: 2 },
  vehicleType: { fontSize: 13, color: '#7f8c8d', marginBottom: 6 },
  description: { fontSize: 14, color: '#34495e', lineHeight: 20, marginBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  locationText: { fontSize: 13, color: '#7f8c8d', marginLeft: 4 },
  priceSummaryBox: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#edf2f7' },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel: { fontSize: 12, color: '#7f8c8d' },
  priceBudgetVal: { fontSize: 12, fontWeight: 'bold', color: '#2c3e50' },
  priceTravelVal: { fontSize: 12, fontWeight: '600', color: '#2980b9' },
  totalLine: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 4, marginTop: 4 },
  totalLabel: { fontSize: 13, fontWeight: 'bold', color: '#2c3e50' },
  totalVal: { fontSize: 14, fontWeight: 'bold', color: '#27ae60' },
  myOfferBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eafaf1', padding: 8, borderRadius: 6, marginBottom: 10 },
  myOfferText: { fontSize: 12, color: '#27ae60', fontWeight: 'bold', marginLeft: 6 },
  offerSection: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  offerSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#34495e', marginBottom: 6 },
  sliderLabel: { fontSize: 12, color: '#7f8c8d', marginBottom: 6 },
  sliderRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  sliderChip: { flex: 1, paddingVertical: 8, backgroundColor: '#f1f2f6', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#dfe4ea' },
  sliderChipActive: { backgroundColor: '#3498db', borderColor: '#2980b9' },
  sliderChipText: { fontSize: 13, fontWeight: 'bold', color: '#2c3e50' },
  sliderChipTextActive: { color: '#ffffff' },
  counterPreviewCard: { backgroundColor: '#fefde8', padding: 8, borderRadius: 6, marginBottom: 10, borderWidth: 1, borderColor: '#fef08a' },
  counterPreviewText: { fontSize: 12, color: '#854d0e', textAlign: 'center' },
  actionButtonRow: { flexDirection: 'row', gap: 8 },
  btnAcceptBudget: { flex: 1, backgroundColor: '#2ecc71', paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  btnAcceptBudgetText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  btnSendOffer: { flex: 1, backgroundColor: '#3498db', paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  btnSendOfferText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.6 },
  acceptedActionSection: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  agreedBox: { backgroundColor: '#ebf5fb', padding: 8, borderRadius: 6, marginBottom: 10 },
  agreedText: { fontSize: 12, color: '#2980b9', fontWeight: '600', textAlign: 'center' },
  serviceItemsContainer: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  serviceItemsHeader: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 6 },
  serviceItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  serviceItemName: { fontSize: 12, color: '#475569' },
  serviceItemPrice: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  acceptedBtnRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chatButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#3498db', paddingVertical: 11, borderRadius: 8 },
  chatButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  addItemBtn: { flex: 1.3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#8e44ad', paddingVertical: 11, borderRadius: 8 },
  addItemBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  completeBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#27ae60', paddingVertical: 11, borderRadius: 8 },
  completeBtnText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: '#7f8c8d', textAlign: 'center', marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 12, maxHeight: '85%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  modalBody: { padding: 16 },
  modalNotice: { fontSize: 12, color: '#7f8c8d', marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: 'bold', color: '#34495e', marginTop: 8, marginBottom: 4 },
  textInput: { borderWidth: 1, borderColor: '#dfe4ea', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#2c3e50', backgroundColor: '#f9fafb' },
  saveItemBtn: { backgroundColor: '#8e44ad', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 20 },
  saveItemBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default MechanicRequestsScreen;
