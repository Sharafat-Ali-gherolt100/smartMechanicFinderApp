import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

const ManageMechanicsScreen = () => {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingStatus, setProcessingStatus] = useState(false);
  const LIMIT = 20;

  const loadMechanics = useCallback(async (p = 1, q = search, sf = statusFilter, vf = verificationFilter) => {
    if (p === 1) setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (q.trim()) params.search = q.trim();
      if (sf) params.status = sf;
      if (vf) params.verification_status = vf;
      const res = await api.get('/admin/mechanics', { params });
      const data = res.data;
      if (p === 1) setMechanics(data.mechanics || []);
      else setMechanics((prev) => [...prev, ...(data.mechanics || [])]);
      setTotal(data.total || 0);
      setPage(p);
    } catch (e) {
      Alert.alert('Error', 'Could not load mechanics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, verificationFilter]);

  useEffect(() => { loadMechanics(1); }, []);

  const handleRefresh = () => { setRefreshing(true); loadMechanics(1); };
  const handleLoadMore = () => { if (page * LIMIT < total) loadMechanics(page + 1); };
  const handleSearch = () => loadMechanics(1, search, statusFilter, verificationFilter);

  const handleUpdateVerification = async (newStatus) => {
    if (!selectedMechanic) return;
    if (newStatus === 'rejected' && !rejectReason.trim()) {
      Alert.alert('Reason Required', 'Please enter a reason for rejecting this mechanic.');
      return;
    }

    setProcessingStatus(true);
    try {
      const res = await api.put(`/admin/mechanics/${selectedMechanic._id}/verification-status`, {
        status: newStatus,
        rejection_reason: newStatus === 'rejected' ? rejectReason.trim() : null,
      });

      const updated = res.data;
      setMechanics((prev) =>
        prev.map((x) =>
          x._id === selectedMechanic._id
            ? {
                ...x,
                verification_status: updated.verification_status,
                is_verified: updated.is_verified,
                verification_rejection_reason: updated.rejection_reason,
              }
            : x
        )
      );

      Alert.alert(
        'Success',
        `Mechanic has been marked as ${newStatus.toUpperCase()}`
      );
      setReviewModalVisible(false);
      setRejectReason('');
      setSelectedMechanic(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to update verification status.');
    } finally {
      setProcessingStatus(false);
    }
  };

  const toggleBan = async (m) => {
    const action = m.is_banned ? 'Unban' : 'Ban';
    Alert.alert(
      `${action} Mechanic`,
      `Are you sure you want to ${action.toLowerCase()} "${m.shop_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: m.is_banned ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await api.put(`/admin/mechanics/${m._id}/ban`, {
                is_banned: !m.is_banned,
                reason: m.is_banned ? '' : 'Banned by admin',
              });
              setMechanics((prev) =>
                prev.map((x) => x._id === m._id ? { ...x, is_banned: !x.is_banned } : x),
              );
            } catch (e) {
              Alert.alert('Error', `Could not ${action.toLowerCase()} mechanic.`);
            }
          },
        },
      ],
    );
  };

  const openReviewModal = (m) => {
    setSelectedMechanic(m);
    setRejectReason(m.verification_rejection_reason || '');
    setReviewModalVisible(true);
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return { bg: '#e8f8f5', text: '#27ae60', label: 'VERIFIED', icon: 'verified' };
      case 'rejected':
        return { bg: '#fdeed9', text: '#e74c3c', label: 'REJECTED', icon: 'highlight-off' };
      default:
        return { bg: '#fef9e7', text: '#f39c12', label: 'PENDING VERIFICATION', icon: 'hourglass-empty' };
    }
  };

  const renderMechanic = ({ item }) => {
    const vBadge = getVerificationBadge(item.verification_status);

    return (
      <View style={[styles.card, item.is_banned && styles.cardBanned]}>
        <View style={styles.cardHeader}>
          <View style={styles.shopIcon}>
            <Icon name="build" size={20} color="#fff" />
          </View>
          <View style={styles.shopInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.shopName} numberOfLines={1}>{item.shop_name}</Text>
              {item.is_verified && <Icon name="verified" size={16} color="#3498db" style={{ marginLeft: 4 }} />}
              {item.is_banned && <Icon name="block" size={16} color="#e74c3c" style={{ marginLeft: 4 }} />}
            </View>
            <Text style={styles.shopAddress} numberOfLines={1}>{item.address}</Text>
            <Text style={styles.ownerName}>{item.user_name} · {item.phone || item.user_email}</Text>
          </View>
          <View style={[styles.statusDot, {
            backgroundColor: item.status === 'open' ? '#2ecc71' : item.status === 'busy' ? '#f39c12' : '#e74c3c',
          }]} />
        </View>

        {/* Verification Status Pill */}
        <View style={styles.verificationRow}>
          <View style={[styles.verificationPill, { backgroundColor: vBadge.bg }]}>
            <Icon name={vBadge.icon} size={14} color={vBadge.text} style={{ marginRight: 4 }} />
            <Text style={[styles.verificationPillText, { color: vBadge.text }]}>{vBadge.label}</Text>
          </View>
          {item.cnic_number && (
            <Text style={styles.cnicText}>CNIC: {item.cnic_number}</Text>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon name="star" size={14} color="#f1c40f" />
            <Text style={styles.statText}>{(item.rating_average || 0).toFixed(1)} ({item.total_ratings || 0})</Text>
          </View>
          <Text style={styles.statDivider}>·</Text>
          <Text style={styles.statText}>{item.status?.toUpperCase() || 'CLOSED'}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnBlue]}
            onPress={() => openReviewModal(item)}
          >
            <Icon name="assignment-turned-in" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Review Verification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, item.is_banned ? styles.btnGreen : styles.btnOutlineRed]}
            onPress={() => toggleBan(item)}
          >
            <Icon name={item.is_banned ? 'check-circle' : 'block'} size={16} color={item.is_banned ? '#fff' : '#e74c3c'} />
            <Text style={[styles.actionBtnText, !item.is_banned && { color: '#e74c3c' }]}>
              {item.is_banned ? 'Unban' : 'Ban'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mechanics…"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Icon name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Verification Filter chips */}
      <View style={styles.filterRow}>
        {[
          { label: 'All Mechanics', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Verified', value: 'verified' },
          { label: 'Rejected', value: 'rejected' },
        ].map((f) => (
          <TouchableOpacity
            key={f.value || 'all-v'}
            style={[styles.filterChip, verificationFilter === f.value && styles.filterChipActive]}
            onPress={() => {
              setVerificationFilter(f.value);
              loadMechanics(1, search, statusFilter, f.value);
            }}
          >
            <Text style={[styles.filterChipText, verificationFilter === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countText}>{total} mechanics found</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading mechanics…</Text>
        </View>
      ) : (
        <FlatList
          data={mechanics}
          keyExtractor={(m) => m._id}
          renderItem={renderMechanic}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          keyboardShouldPersistTaps="handled"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="build" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>No mechanics found</Text>
            </View>
          }
        />
      )}

      {/* Mechanic Verification Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mechanic Verification</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Icon name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            {selectedMechanic && (
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="person" size={36} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.reviewName}>{selectedMechanic.user_name}</Text>
                    <Text style={styles.reviewShop}>{selectedMechanic.shop_name}</Text>
                    <Text style={styles.reviewSub}>{selectedMechanic.phone || 'Phone not provided'}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CNIC Number:</Text>
                  <Text style={styles.infoVal}>{selectedMechanic.cnic_number || 'Not Submitted'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Certificate Title:</Text>
                  <Text style={styles.infoVal}>{selectedMechanic.certificate_title || 'General Mechanic'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Shop Address:</Text>
                  <Text style={styles.infoVal}>{selectedMechanic.address || 'Skardu'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Verification Status:</Text>
                  <Text style={[styles.infoVal, { fontWeight: 'bold', textTransform: 'uppercase' }]}>
                    {selectedMechanic.verification_status || 'Pending'}
                  </Text>
                </View>

                {/* Document Verification Cards */}
                <Text style={styles.sectionHeader}>Verification Documents</Text>

                <View style={styles.docCard}>
                  <Icon name="badge" size={22} color="#3498db" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.docTitle}>CNIC Document / Photo</Text>
                    <Text style={styles.docStatus}>
                      {selectedMechanic.cnic_document_url ? 'Document uploaded' : 'Pending upload'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewDocBtn}
                    onPress={() => Alert.alert('CNIC Document', `Location: ${selectedMechanic.cnic_document_url || 'File attached at registration'}`)}
                  >
                    <Text style={styles.viewDocText}>View</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.docCard}>
                  <Icon name="card-membership" size={22} color="#9b59b6" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.docTitle}>Professional Certificate</Text>
                    <Text style={styles.docStatus}>
                      {selectedMechanic.certificate_document_url ? 'Certificate attached' : 'Pending upload'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewDocBtn}
                    onPress={() => Alert.alert('Certificate Document', `Location: ${selectedMechanic.certificate_document_url || 'Certificate attached at registration'}`)}
                  >
                    <Text style={styles.viewDocText}>View</Text>
                  </TouchableOpacity>
                </View>

                {/* Rejection reason box */}
                <Text style={styles.sectionHeader}>Rejection Reason (If Rejecting):</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="e.g. Blurred CNIC photo or invalid certificate..."
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  numberOfLines={3}
                />

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionConfirmBtn, { backgroundColor: '#2ecc71' }]}
                    onPress={() => handleUpdateVerification('verified')}
                    disabled={processingStatus}
                  >
                    {processingStatus ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon name="check-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.confirmBtnText}>Approve Mechanic</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionConfirmBtn, { backgroundColor: '#e74c3c' }]}
                    onPress={() => handleUpdateVerification('rejected')}
                    disabled={processingStatus}
                  >
                    <Icon name="highlight-off" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmBtnText}>Reject Mechanic</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchRow: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 10, marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: '#2c3e50', marginLeft: 6 },
  searchBtn: { width: 44, height: 40, borderRadius: 8, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: '#f0f0f0', marginRight: 6 },
  filterChipActive: { backgroundColor: '#3498db' },
  filterChipText: { fontSize: 12, color: '#666' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  countRow: { paddingHorizontal: 15, paddingVertical: 6, backgroundColor: '#f8f9fa' },
  countText: { fontSize: 12, color: '#7f8c8d' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 10, color: '#7f8c8d' },
  list: { padding: 10, paddingBottom: 30 },
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardBanned: { borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  shopIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  shopInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  shopName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', flex: 1 },
  shopAddress: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  ownerName: { fontSize: 11, color: '#7f8c8d', marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  verificationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
  verificationPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  verificationPillText: { fontSize: 11, fontWeight: 'bold' },
  cnicText: { fontSize: 11, color: '#7f8c8d' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 12, color: '#7f8c8d', marginLeft: 3 },
  statDivider: { marginHorizontal: 8, color: '#bdc3c7' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1, borderColor: 'transparent',
  },
  btnBlue: { backgroundColor: '#3498db' },
  btnGreen: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  btnOutlineRed: { backgroundColor: '#fff', borderColor: '#e74c3c' },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#fff', marginLeft: 4 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginTop: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 12, maxHeight: '85%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  modalContent: { padding: 16 },
  profileSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' },
  reviewName: { fontSize: 17, fontWeight: 'bold', color: '#2c3e50' },
  reviewShop: { fontSize: 14, color: '#27ae60', fontWeight: '600' },
  reviewSub: { fontSize: 12, color: '#7f8c8d' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontSize: 13, color: '#7f8c8d' },
  infoVal: { fontSize: 13, color: '#2c3e50', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginTop: 14, marginBottom: 8 },
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  docTitle: { fontSize: 13, fontWeight: '600', color: '#2c3e50' },
  docStatus: { fontSize: 11, color: '#7f8c8d' },
  viewDocBtn: { backgroundColor: '#e8f4fd', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  viewDocText: { fontSize: 12, color: '#3498db', fontWeight: 'bold' },
  reasonInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 13, color: '#2c3e50', textAlignVertical: 'top', minHeight: 60, marginBottom: 16 },
  modalActions: { flexDirection: 'column', gap: 10, paddingBottom: 20 },
  actionConfirmBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default ManageMechanicsScreen;
