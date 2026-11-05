import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  FlatList,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import SmartMapView from '../../components/common/SmartMapView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocation } from '../../context/LocationContext';
import { MechanicService } from '../../components/services/mechanicService';
import { LocationService } from '../../services/location';
import MechanicCard from '../../components/mechanic/MechanicCard';
import { useNetworkStatus } from '../../utils/networkStatus';
import { cacheMechanicList, getCachedMechanicList, getCacheAge } from '../../utils/offlineCache';
import OfflineBanner from '../../components/common/OfflineBanner';

const MechanicSearchScreen = ({ navigation }) => {
  const { location, refreshLocation } = useLocation();
  const { isOnline } = useNetworkStatus();
  const [mechanics, setMechanics] = useState([]);
  const [filteredMechanics, setFilteredMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    maxDistance: 50,
    minRating: 0,
    service: '',
    status: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [cacheAge, setCacheAge] = useState(null);
  
  const mapRef = useRef(null);

  useEffect(() => {
    if (location) {
      loadMechanics();
    }
  }, [location]);

  useEffect(() => {
    applyFilters();
  }, [mechanics, searchQuery, filters]);

  const loadMechanics = async () => {
    if (!location) return;

    setLoading(true);
    try {
      if (!isOnline) {
        // Offline: load from cache
        const cached = await getCachedMechanicList();
        const age = await getCacheAge('cache_mechanic_list');
        if (cached && cached.length > 0) {
          setMechanics(cached);
          setIsCached(true);
          setCacheAge(age);
        } else {
          setMechanics([]);
        }
        setLoading(false);
        return;
      }

      const response = await MechanicService.getNearbyMechanics(
        location.latitude,
        location.longitude,
        filters.maxDistance
      );

      const mechanicsWithDistance = response.mechanics.map(m => ({
        ...m,
        distance: m.distance || LocationService.calculateDistance(
          location.latitude,
          location.longitude,
          m.latitude,
          m.longitude
        ),
        eta: LocationService.calculateETA(m.distance || 0),
        formattedDistance: LocationService.formatDistance(m.distance || 0),
        formattedETA: LocationService.formatETA(
          LocationService.calculateETA(m.distance || 0)
        ),
      }));

      setMechanics(mechanicsWithDistance);
      setIsCached(false);
      setCacheAge(null);
      // Cache for offline use
      if (mechanicsWithDistance.length > 0) {
        await cacheMechanicList(mechanicsWithDistance);
      }
    } catch (error) {
      // Try cache fallback
      const cached = await getCachedMechanicList();
      const age = await getCacheAge('cache_mechanic_list');
      if (cached && cached.length > 0) {
        setMechanics(cached);
        setIsCached(true);
        setCacheAge(age);
      } else {
        Alert.alert('Error', 'Failed to load mechanics. Please try again.');
      }
      console.error('Error loading mechanics:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...mechanics];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.shop_name.toLowerCase().includes(query) ||
        m.address.toLowerCase().includes(query) ||
        (m.services && m.services.some(s => s.toLowerCase().includes(query)))
      );
    }

    // Apply filters
    if (filters.service) {
      filtered = filtered.filter(m =>
        m.services && m.services.some(s =>
          s.toLowerCase().includes(filters.service.toLowerCase())
        )
      );
    }

    if (filters.maxDistance < 50) {
      filtered = filtered.filter(m => m.distance <= filters.maxDistance);
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(m => m.rating_average >= filters.minRating);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    // Sort by distance by default
    const sorted = MechanicService.sortMechanics(filtered, 'distance');
    setFilteredMechanics(sorted);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    await loadMechanics();
    setRefreshing(false);
  };

  const handleMechanicPress = (mechanic) => {
    navigation.navigate('MechanicDetail', { mechanicId: mechanic._id });
  };

  const handleViewOnMap = (mechanic) => {
    setSelectedMechanic(mechanic);
    setViewMode('map');
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: mechanic.latitude,
        longitude: mechanic.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleFilterApply = () => {
    setShowFilters(false);
    loadMechanics();
  };

  const renderMap = () => (
    <View style={styles.mapContainer}>
      <SmartMapView
        mapRef={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 35.2973,
          longitude: location?.longitude || 75.6333,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        markers={filteredMechanics}
        onMarkerPress={(mechanic) => handleViewOnMap(mechanic)}
      />
      
      {selectedMechanic && (
        <View style={styles.selectedMechanicInfo}>
          <View style={styles.selectedMechanicContent}>
            <Text style={styles.selectedMechanicName}>{selectedMechanic.shop_name}</Text>
            <Text style={styles.selectedMechanicDistance}>
              {selectedMechanic.formattedDistance} • {selectedMechanic.formattedETA}
            </Text>
            <View style={styles.selectedMechanicStatus}>
              <View style={[
                styles.statusDot,
                { backgroundColor: selectedMechanic.status === 'open' ? '#2ecc71' : '#e74c3c' }
              ]} />
              <Text style={styles.selectedMechanicStatusText}>
                {selectedMechanic.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => handleMechanicPress(selectedMechanic)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderListItem = ({ item }) => (
    <MechanicCard
      mechanic={item}
      onPress={() => handleMechanicPress(item)}
      showDistance
      showRating
      showStatus
    />
  );

  const renderFilters = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Mechanics</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Max Distance (km)</Text>
              <View style={styles.filterRow}>
                <Text style={styles.filterValue}>{filters.maxDistance}</Text>
                <View style={styles.sliderContainer}>
                  <TouchableOpacity
                    style={styles.sliderButton}
                    onPress={() => handleFilterChange('maxDistance', Math.max(5, filters.maxDistance - 5))}
                  >
                    <Icon name="remove" size={20} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.sliderTrack}>
                    <View style={[styles.sliderFill, { width: `${(filters.maxDistance / 50) * 100}%` }]} />
                  </View>
                  <TouchableOpacity
                    style={styles.sliderButton}
                    onPress={() => handleFilterChange('maxDistance', Math.min(50, filters.maxDistance + 5))}
                  >
                    <Icon name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.ratingFilter}>
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      filters.minRating === rating && styles.ratingButtonActive,
                    ]}
                    onPress={() => handleFilterChange('minRating', rating)}
                  >
                    <Text style={[
                      styles.ratingButtonText,
                      filters.minRating === rating && styles.ratingButtonTextActive,
                    ]}>
                      {rating === 0 ? 'All' : `${rating}★`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.statusFilter}>
                {['all', 'open', 'closed', 'busy'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      filters.status === status && styles.statusButtonActive,
                    ]}
                    onPress={() => handleFilterChange('status', status)}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      filters.status === status && styles.statusButtonTextActive,
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Service Type</Text>
              <TextInput
                style={styles.serviceInput}
                placeholder="e.g., Engine Repair, Oil Change"
                value={filters.service}
                onChangeText={(text) => handleFilterChange('service', text)}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.resetButton]}
              onPress={() => {
                setFilters({
                  maxDistance: 50,
                  minRating: 0,
                  service: '',
                  status: 'all',
                });
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.applyButton]}
              onPress={handleFilterApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.centerText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} cacheAge={cacheAge} />
      <View style={[styles.searchHeader, !isOnline && styles.offsetTop]}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mechanics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, viewMode === 'list' && styles.headerButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Icon name="list" size={24} color={viewMode === 'list' ? '#3498db' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, viewMode === 'map' && styles.headerButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Icon name="map" size={24} color={viewMode === 'map' ? '#3498db' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilters(true)}
          >
            <Icon name="filter-list" size={24} color="#666" />
            {Object.values(filters).some(v => v !== 0 && v !== '' && v !== 'all' && v !== 50) && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'map' ? (
        renderMap()
      ) : (
        <>
          {isCached && (
            <View style={styles.cachedIndicator}>
              <Icon name="cloud-off" size={16} color="#f39c12" />
              <Text style={styles.cachedText}>
                Offline — cached data{cacheAge !== null ? ` (${cacheAge}h ago)` : ''}
              </Text>
            </View>
          )}
          
          <FlatList
            data={filteredMechanics}
            renderItem={renderListItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={60} color="#bdc3c7" />
                <Text style={styles.emptyText}>No mechanics found</Text>
                <Text style={styles.emptySubText}>
                  Try adjusting your filters or search area
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={loadMechanics}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={() => (
              loading && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color="#3498db" />
                </View>
              )
            )}
          />
        </>
      )}

      {renderFilters()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offsetTop: {
    marginTop: 36,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 5,
    borderRadius: 8,
  },
  headerButtonActive: {
    backgroundColor: '#e8f4fd',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  selectedMechanicInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedMechanicContent: {
    flex: 1,
  },
  selectedMechanicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  selectedMechanicDistance: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  selectedMechanicStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  selectedMechanicStatusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  viewDetailsButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  refreshButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingMore: {
    padding: 20,
  },
  cachedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9e7',
    padding: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f39c12',
  },
  cachedText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#f39c12',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    width: 40,
  },
  sliderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  sliderButton: {
    backgroundColor: '#3498db',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  ratingFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  ratingButtonActive: {
    backgroundColor: '#3498db',
  },
  ratingButtonText: {
    fontSize: 14,
    color: '#666',
  },
  ratingButtonTextActive: {
    color: '#fff',
  },
  statusFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonActive: {
    backgroundColor: '#3498db',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  serviceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#3498db',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MechanicSearchScreen;