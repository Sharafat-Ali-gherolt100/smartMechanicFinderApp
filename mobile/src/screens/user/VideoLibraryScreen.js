import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';
import { useNetworkStatus } from '../../utils/networkStatus';
import { cacheVideos, getCachedVideos, getCacheAge } from '../../utils/offlineCache';
import OfflineBanner from '../../components/common/OfflineBanner';

const VideoLibraryScreen = ({ navigation }) => {
  const { isOnline } = useNetworkStatus();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheAge, setCacheAge] = useState(null);

  useEffect(() => {
    loadCategories();
    loadVideos(1, selectedCategory);
  }, []);

  useEffect(() => {
    loadVideos(1, selectedCategory);
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      if (isOnline) {
        const res = await api.get('/videos/categories');
        setCategories(res.data.categories || []);
      }
    } catch (e) {
      console.warn('Could not load categories', e);
    }
  };

  const loadVideos = async (p = 1, cat = selectedCategory) => {
    if (p === 1) setLoading(true);
    try {
      if (!isOnline) {
        // Load from cache when offline
        const cached = await getCachedVideos();
        const age = await getCacheAge('cache_videos');
        if (cached && cached.length > 0) {
          setVideos(cached);
          setIsFromCache(true);
          setCacheAge(age);
          // Extract categories from cached data
          const cats = [...new Set(cached.map(v => v.category).filter(Boolean))];
          if (cats.length > 0) setCategories(cats);
        } else {
          setVideos([]);
        }
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const params = { page: p, limit: 20 };
      if (cat !== 'all') params.category = cat;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const res = await api.get('/videos', { params });
      const data = res.data;
      const newVideos = data.videos || [];

      if (p === 1) {
        setVideos(newVideos);
        // Cache the first-page full video list
        if (newVideos.length > 0) {
          await cacheVideos(newVideos);
        }
      } else {
        setVideos((prev) => [...prev, ...newVideos]);
      }
      setIsFromCache(false);
      setPage(p);
      setTotalPages(data.pages || 1);
    } catch (e) {
      // Network error: try cache fallback
      const cached = await getCachedVideos();
      const age = await getCacheAge('cache_videos');
      if (cached && cached.length > 0) {
        setVideos(cached);
        setIsFromCache(true);
        setCacheAge(age);
      } else {
        Alert.alert('Error', 'Could not load videos. Check your connection.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot refresh while offline. Showing cached videos.');
      return;
    }
    setRefreshing(true);
    loadVideos(1, selectedCategory);
  };

  const handleSearch = () => {
    if (!isOnline) {
      // Filter cached data locally
      return;
    }
    loadVideos(1, selectedCategory);
  };

  const handleLoadMore = () => {
    if (page < totalPages && isOnline) {
      loadVideos(page + 1, selectedCategory);
    }
  };

  const getCategoryTheme = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('battery')) return { icon: 'battery-charging-full', color: '#e74c3c' };
    if (c.includes('engine')) return { icon: 'build', color: '#3498db' };
    if (c.includes('diagnostic')) return { icon: 'warning', color: '#f39c12' };
    return { icon: 'play-circle-filled', color: '#2ecc71' };
  };

  const handleWatchVideo = async (video) => {
    // Silently increment view count in background
    try {
      if (isOnline && video._id && !String(video._id).startsWith('local_')) {
        api.post(`/videos/${video._id}/view`).catch(() => {});
      }
    } catch (_) {}

    // Navigate to full-screen player — uses bundled local assets
    navigation.navigate('VideoPlayer', { video });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Filter locally by search when offline
  const displayedVideos = searchQuery.trim()
    ? videos.filter(v =>
        (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : videos;

  // Filter by category locally when offline
  const categoryFiltered = selectedCategory === 'all'
    ? displayedVideos
    : displayedVideos.filter(v => v.category === selectedCategory);

  const renderVideo = ({ item }) => {
    const theme = getCategoryTheme(item.category);
    return (
      <TouchableOpacity
        style={styles.videoCard}
        onPress={() => handleWatchVideo(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.thumbnailContainer, { backgroundColor: theme.color }]}>
          <View style={styles.thumbnailPlaceholder}>
            <Icon name={theme.icon} size={48} color="rgba(255,255,255,0.9)" />
            <View style={styles.playOverlay}>
              <Icon name="play-arrow" size={28} color="#fff" />
              <Text style={styles.playOverlayText}>Play Guide</Text>
            </View>
          </View>
          {item.duration ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
            </View>
          ) : null}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          {item.is_offline_bundled && (
            <View style={styles.bundledBadge}>
              <Icon name="file-download-done" size={12} color="#fff" />
              <Text style={styles.bundledBadgeText}>Bundled</Text>
            </View>
          )}
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.videoDesc} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <View style={styles.videoMeta}>
            <View style={styles.metaItem}>
              <Icon name="visibility" size={14} color="#7f8c8d" />
              <Text style={styles.metaText}>{item.views || 250} views</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="play-circle-filled" size={16} color={theme.color} />
              <Text style={[styles.metaText, { color: theme.color, fontWeight: 'bold', marginLeft: 4 }]}>
                Play Video
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} cacheAge={cacheAge} />

      {/* Search bar */}
      <View style={[styles.searchRow, !isOnline && styles.offsetTop]}>
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos…"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color="#7f8c8d" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Icon name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cached notice */}
      {isFromCache && (
        <View style={styles.cachedNotice}>
          <Icon name="info-outline" size={14} color="#f39c12" />
          <Text style={styles.cachedNoticeText}>
            Showing cached videos{cacheAge !== null ? ` (${cacheAge}h ago)` : ''}
          </Text>
        </View>
      )}

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catBar}
        contentContainerStyle={styles.catContent}
      >
        {['all', ...categories.map((c) =>
          (typeof c === 'object' && c !== null ? c.name : c)
        ).filter(Boolean)].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
              {cat === 'all' ? 'All' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading videos…</Text>
        </View>
      ) : (
        <FlatList
          data={categoryFiltered}
          keyExtractor={(item) => item._id}
          renderItem={renderVideo}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="videocam-off" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>No videos found</Text>
              <Text style={styles.emptySubText}>
                {isOnline ? 'Try a different category or search term' : 'No cached videos available'}
              </Text>
            </View>
          }
          ListFooterComponent={
            page < totalPages && isOnline ? (
              <ActivityIndicator style={{ marginVertical: 16 }} size="small" color="#3498db" />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  offsetTop: { marginTop: 36 },
  searchRow: {
    flexDirection: 'row', padding: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 10, marginRight: 8,
  },
  searchInput: { flex: 1, height: 40, fontSize: 15, color: '#2c3e50', marginLeft: 6 },
  searchBtn: {
    width: 44, height: 40, borderRadius: 8, backgroundColor: '#3498db',
    justifyContent: 'center', alignItems: 'center',
  },
  cachedNotice: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef9e7',
    paddingVertical: 6, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: '#f39c12',
  },
  cachedNoticeText: { marginLeft: 6, fontSize: 12, color: '#f39c12' },
  catBar: {
    backgroundColor: '#fff', borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', maxHeight: 48,
  },
  catContent: { paddingHorizontal: 10, paddingVertical: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 16, backgroundColor: '#f0f0f0', marginHorizontal: 3,
  },
  catChipActive: { backgroundColor: '#3498db' },
  catChipText: { fontSize: 13, color: '#666' },
  catChipTextActive: { color: '#fff', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 10, color: '#7f8c8d', fontSize: 15 },
  list: { padding: 10, paddingBottom: 30 },
  videoCard: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  thumbnailContainer: { height: 180, position: 'relative' },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  playOverlayText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  durationBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  durationText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  categoryBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  categoryBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  bundledBadge: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#27ae60', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10,
  },
  bundledBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
  videoInfo: { padding: 12 },
  videoTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  videoDesc: { fontSize: 13, color: '#7f8c8d', marginBottom: 8, lineHeight: 18 },
  videoMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#7f8c8d', marginLeft: 4 },
  emptyText: { fontSize: 17, fontWeight: 'bold', color: '#2c3e50', marginTop: 16 },
  emptySubText: { fontSize: 13, color: '#7f8c8d', marginTop: 6 },
});

export default VideoLibraryScreen;
