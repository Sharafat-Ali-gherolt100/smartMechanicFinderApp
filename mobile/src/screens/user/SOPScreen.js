import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';
import { useNetworkStatus } from '../../utils/networkStatus';
import { cacheSOPPricing, getCachedSOPPricing, getCacheAge } from '../../utils/offlineCache';
import OfflineBanner from '../../components/common/OfflineBanner';

const SOPScreen = ({ navigation }) => {
  const { isOnline } = useNetworkStatus();
  const [sopData, setSopData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheAge, setCacheAge] = useState(null);

  // Load categories once on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Re-load SOP whenever selectedCategory changes
  useEffect(() => {
    loadSOP(selectedCategory);
  }, [selectedCategory]);

  const loadSOP = useCallback(async (category = 'all') => {
    setLoading(true);
    try {
      if (!isOnline) {
        // Offline: load from cache
        const cached = await getCachedSOPPricing();
        const age = await getCacheAge('cache_sop_pricing');
        if (cached && cached.length > 0) {
          setSopData(cached);
          setIsFromCache(true);
          setCacheAge(age);
          const cats = [...new Set(cached.map(s => s.category).filter(Boolean))];
          if (cats.length > 0) setCategories(cats);
        } else {
          setSopData([]);
        }
        setLoading(false);
        return;
      }

      const params = {};
      if (category !== 'all') params.category = category;
      const response = await api.get('/sop', { params });
      const items = response.data.sop || [];
      setSopData(items);
      setIsFromCache(false);
      // Cache all SOP data on first full load
      if (category === 'all' && items.length > 0) {
        await cacheSOPPricing(items);
      }
    } catch (error) {
      // Try cache fallback on error
      const cached = await getCachedSOPPricing();
      const age = await getCacheAge('cache_sop_pricing');
      if (cached && cached.length > 0) {
        setSopData(cached);
        setIsFromCache(true);
        setCacheAge(age);
      } else {
        Alert.alert('Error', 'Could not load pricing. No cached data available.');
      }
      console.error('Error loading SOP:', error);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/sop/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleRefresh = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot refresh while offline. Showing cached data.');
      return;
    }
    setRefreshing(true);
    await loadSOP(selectedCategory);
    setRefreshing(false);
  };

  const formatPrice = (price) => {
    if (price == null) return 'N/A';
    return `PKR ${Number(price).toLocaleString()}`;
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'Varies';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // All icon names are valid MaterialIcons names
  const getServiceIcon = (serviceType) => {
    if (!serviceType) return 'build';
    const type = serviceType.toLowerCase();
    if (type.includes('engine')) return 'settings';
    if (type.includes('oil')) return 'opacity';
    if (type.includes('tire') || type.includes('tyre')) return 'trip-origin';
    if (type.includes('battery')) return 'battery-full';
    if (type.includes('brake')) return 'pan-tool';
    if (type.includes('transmission') || type.includes('gear')) return 'tune';
    if (type.includes('ac') || type.includes('air')) return 'ac-unit';
    if (type.includes('electrical') || type.includes('electric')) return 'flash-on';
    if (type.includes('wash')) return 'local-car-wash';
    if (type.includes('paint')) return 'brush';
    if (type.includes('glass') || type.includes('window')) return 'sensor-window';
    return 'build';
  };

  const filteredSOP = sopData.filter(item =>
    (item.service_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.outerContainer}>
      <OfflineBanner visible={!isOnline} cacheAge={cacheAge} />
      <View style={[styles.container, !isOnline && styles.offsetTop]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Standard Pricing Guide</Text>
        <Text style={styles.headerSubtitle}>
          Fair and transparent pricing for common services
        </Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === 'all' && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === 'all' && styles.categoryChipTextActive,
          ]}>
            All Services
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === cat && styles.categoryChipTextActive,
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading pricing guide...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.sopList}
          contentContainerStyle={styles.sopListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {filteredSOP.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="receipt" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>No services found</Text>
              <Text style={styles.emptySubText}>
                Try adjusting your search or category filter
              </Text>
            </View>
          ) : (
            filteredSOP.map((item) => (
              <View key={item._id} style={styles.sopCard}>
                <View style={styles.sopHeader}>
                  <View style={styles.sopIconContainer}>
                    <Icon name={getServiceIcon(item.service_type)} size={24} color="#fff" />
                  </View>
                  <View style={styles.sopHeaderContent}>
                    <Text style={styles.sopTitle}>{item.service_type}</Text>
                    <View style={styles.sopMeta}>
                      <View style={styles.sopMetaItem}>
                        <Icon name="schedule" size={14} color="#7f8c8d" />
                        <Text style={styles.sopMetaText}>{formatTime(item.estimated_time)}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.sopBody}>
                  <View style={styles.priceRange}>
                    <Text style={styles.priceLabel}>Price Range</Text>
                    <Text style={styles.priceValue}>
                      {formatPrice(item.price_range_min)} – {formatPrice(item.price_range_max)}
                    </Text>
                  </View>

                  {item.description && (
                    <Text style={styles.sopDescription}>{item.description}</Text>
                  )}

                  <View style={styles.sopFooter}>
                    <View style={styles.sopInfoBox}>
                      <Icon name="info" size={16} color="#3498db" />
                      <Text style={styles.sopInfoText}>
                        Prices may vary based on vehicle model and service complexity
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      </View>
    </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 52,
  },
  categoriesContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  categoryChipActive: {
    backgroundColor: '#3498db',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '500',
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
  sopList: {
    flex: 1,
  },
  sopListContent: {
    padding: 10,
    paddingBottom: 30,
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
  sopCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sopIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sopHeaderContent: {
    flex: 1,
  },
  sopTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  sopMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  sopMetaText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  sopBody: {
    padding: 15,
  },
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  sopDescription: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 10,
  },
  sopFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  sopInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    padding: 10,
    borderRadius: 8,
  },
  sopInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#3498db',
    marginLeft: 8,
  },
});

export default SOPScreen;