import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';
import { useNetworkStatus } from '../../utils/networkStatus';
import { cacheServiceHistory, getCachedServiceHistory, getCacheAge } from '../../utils/offlineCache';
import OfflineBanner from '../../components/common/OfflineBanner';

const HistoryScreen = ({ navigation }) => {
  const { isOnline } = useNetworkStatus();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheAge, setCacheAge] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (!isOnline) {
        // Offline: load from cache
        const cached = await getCachedServiceHistory();
        const age = await getCacheAge('cache_service_history');
        if (cached && cached.length > 0) {
          const filtered = filter === 'all' ? cached : cached.filter(i => i.status === filter);
          setHistory(filtered);
          setIsFromCache(true);
          setCacheAge(age);
        } else {
          setHistory([]);
        }
        setLoading(false);
        return;
      }

      const response = await api.get('/history/user');
      let data = response.data.history || [];
      // Cache unfiltered history
      if (data.length > 0) await cacheServiceHistory(data);
      setIsFromCache(false);
      if (filter !== 'all') data = data.filter(item => item.status === filter);
      setHistory(data);
    } catch (error) {
      const cached = await getCachedServiceHistory();
      const age = await getCacheAge('cache_service_history');
      if (cached && cached.length > 0) {
        const filtered = filter === 'all' ? cached : cached.filter(i => i.status === filter);
        setHistory(filtered);
        setIsFromCache(true);
        setCacheAge(age);
      }
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot refresh while offline. Showing cached history.');
      return;
    }
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#2ecc71';
      case 'in_progress': return '#f39c12';
      case 'requested': return '#3498db';
      case 'cancelled': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'in_progress': return 'timer';
      case 'requested': return 'pending';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyTitle}>
          <Text style={styles.serviceType}>{item.service_type}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Icon name={getStatusIcon(item.status)} size={12} color="#fff" />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.historyDate}>
          {new Date(item.service_date).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.mechanicName}>{item.mechanic_name}</Text>
      
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
      
      <View style={styles.historyFooter}>
        {item.cost && (
          <Text style={styles.cost}>PKR {item.cost.toLocaleString()}</Text>
        )}
        {item.rating_given ? (
          <View style={styles.ratedBadge}>
            <Icon name="star" size={16} color="#f1c40f" />
            <Text style={styles.ratedText}>Rated</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.rateButton}
            onPress={() => navigation.navigate('Rating', { mechanicId: item.mechanic_id })}
          >
            <Text style={styles.rateButtonText}>Rate Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.outerContainer}>
      <OfflineBanner visible={!isOnline} cacheAge={cacheAge} />
      <View style={[styles.container, !isOnline && styles.offsetTop]}>
      {/* Filter Tabs — wrapped in horizontal ScrollView to prevent overflow on narrow screens */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {['all', 'requested', 'in_progress', 'completed', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterTab, filter === status && styles.filterTabActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
              {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="history" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>No service history</Text>
            <Text style={styles.emptySubText}>
              {isOnline ? 'Your service history will appear here' : 'No cached history available'}
            </Text>
          </View>
        )}
      />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offsetTop: {
    marginTop: 36,
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
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 52,
  },
  filterContent: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 3,
    minHeight: 32,
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3498db',
  },
  filterText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    padding: 10,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: 8,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 8,
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#7f8c8d',
    flexShrink: 0,
  },
  mechanicName: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 4,
  },
  cost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  ratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minHeight: 32,
  },
  ratedText: {
    fontSize: 12,
    color: '#3498db',
    marginLeft: 4,
  },
  rateButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    minHeight: 36,
    justifyContent: 'center',
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
});

export default HistoryScreen;