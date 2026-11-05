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
  Switch,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

const ManageUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const loadUsers = useCallback(async (p = 1, q = search) => {
    if (p === 1) setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (q.trim()) params.search = q.trim();
      const res = await api.get('/admin/users', { params });
      const data = res.data;
      if (p === 1) setUsers(data.users || []);
      else setUsers((prev) => [...prev, ...(data.users || [])]);
      setTotal(data.total || 0);
      setPage(p);
    } catch (e) {
      Alert.alert('Error', 'Could not load users.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { loadUsers(1); }, []);

  const handleRefresh = () => { setRefreshing(true); loadUsers(1); };
  const handleLoadMore = () => { if (page * LIMIT < total) loadUsers(page + 1); };
  const handleSearch = () => loadUsers(1, search);

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}`, { is_active: !user.is_active });
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, is_active: !u.is_active } : u),
      );
    } catch (e) {
      Alert.alert('Error', 'Could not update user status.');
    }
  };

  const deleteUser = (user) => {
    Alert.alert(
      'Deactivate User',
      `Deactivate "${user.name}" (${user.email})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/users/${user._id}`);
              setUsers((prev) => prev.filter((u) => u._id !== user._id));
            } catch (e) {
              Alert.alert('Error', 'Could not deactivate user.');
            }
          },
        },
      ],
    );
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userAvatar}>
        <Icon
          name={item.is_admin ? 'admin-panel-settings' : item.is_mechanic ? 'build' : 'person'}
          size={22}
          color="#fff"
        />
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          <View style={[
            styles.roleBadge,
            { backgroundColor: item.is_admin ? '#9b59b6' : item.is_mechanic ? '#27ae60' : '#3498db' },
          ]}>
            <Text style={styles.roleBadgeText}>
              {item.is_admin ? 'Admin' : item.is_mechanic ? 'Mechanic' : 'User'}
            </Text>
          </View>
        </View>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        {item.phone ? <Text style={styles.userPhone}>{item.phone}</Text> : null}
        <Text style={styles.userDate}>
          Joined: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
      <View style={styles.userActions}>
        <Switch
          value={item.is_active}
          onValueChange={() => toggleActive(item)}
          trackColor={{ false: '#e74c3c', true: '#2ecc71' }}
          thumbColor="#fff"
        />
        {!item.is_admin && (
          <TouchableOpacity onPress={() => deleteUser(item)} style={styles.deleteBtn}>
            <Icon name="delete" size={20} color="#e74c3c" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email…"
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

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{total} total users</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading users…</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="people" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
          ListFooterComponent={
            page * LIMIT < total ? (
              <ActivityIndicator style={{ marginVertical: 16 }} size="small" color="#3498db" />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchRow: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 10, marginRight: 8,
  },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: '#2c3e50', marginLeft: 6 },
  searchBtn: { width: 44, height: 40, borderRadius: 8, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' },
  countRow: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#f8f9fa' },
  countText: { fontSize: 13, color: '#7f8c8d' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 10, color: '#7f8c8d' },
  list: { padding: 10, paddingBottom: 30 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, padding: 12, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
  },
  userAvatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#3498db',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  userName: { fontSize: 15, fontWeight: '600', color: '#2c3e50', flex: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 6 },
  roleBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  userEmail: { fontSize: 13, color: '#7f8c8d' },
  userPhone: { fontSize: 12, color: '#7f8c8d' },
  userDate: { fontSize: 11, color: '#bdc3c7', marginTop: 2 },
  userActions: { alignItems: 'center' },
  deleteBtn: { marginTop: 6, padding: 4 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginTop: 14 },
});

export default ManageUsersScreen;
