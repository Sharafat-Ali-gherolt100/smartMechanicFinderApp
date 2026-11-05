import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

const StarRow = ({ label, value }) => (
  <View style={styles.subRatingRow}>
    <Text style={styles.subRatingLabel}>{label}</Text>
    <View style={styles.starsSmall}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name={s <= value ? 'star' : 'star-border'}
          size={14}
          color={s <= value ? '#f1c40f' : '#bdc3c7'}
        />
      ))}
    </View>
  </View>
);

const RatingCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {(item.user_name || 'A')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardHeaderRight}>
        <Text style={styles.reviewerName}>{item.user_name || 'Anonymous'}</Text>
        <Text style={styles.reviewDate}>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : ''}
        </Text>
      </View>
      <View style={styles.overallBadge}>
        <Icon name="star" size={14} color="#f1c40f" />
        <Text style={styles.overallBadgeText}>{item.rating}</Text>
      </View>
    </View>

    {item.review ? (
      <Text style={styles.reviewText}>{item.review}</Text>
    ) : (
      <Text style={styles.noReviewText}>No written review</Text>
    )}

    <View style={styles.subRatings}>
      {item.service_quality > 0 && (
        <StarRow label="Service Quality" value={item.service_quality} />
      )}
      {item.punctuality > 0 && (
        <StarRow label="Punctuality" value={item.punctuality} />
      )}
      {item.pricing > 0 && (
        <StarRow label="Pricing" value={item.pricing} />
      )}
      {item.communication > 0 && (
        <StarRow label="Communication" value={item.communication} />
      )}
    </View>
  </View>
);

const MechanicRatingsScreen = () => {
  const [ratings, setRatings] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    distribution_percent: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mechanic/ratings');
      setRatings(response.data.ratings || []);
      setStatistics(
        response.data.statistics || {
          total: 0,
          average: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          distribution_percent: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRatings();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <Text style={styles.avgScore}>{(statistics.average || 0).toFixed(1)}</Text>
        <View style={styles.summaryRight}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Icon
                key={s}
                name={s <= Math.round(statistics.average) ? 'star' : 'star-border'}
                size={22}
                color="#f1c40f"
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>
            {statistics.total} review{statistics.total !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.distributionBlock}>
        {[5, 4, 3, 2, 1].map((star) => {
          const pct = statistics.distribution_percent?.[star] || 0;
          return (
            <View key={star} style={styles.distRow}>
              <Text style={styles.distLabel}>{star}</Text>
              <Icon name="star" size={13} color="#f1c40f" />
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.distCount}>
                {statistics.distribution?.[star] || 0}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={ratings}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <RatingCard item={item} />}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Icon name="rate-review" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubText}>
            Ratings from customers will appear here
          </Text>
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { paddingBottom: 20 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#7f8c8d' },

  // Summary card
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 14,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avgScore: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 16,
  },
  summaryRight: { flex: 1 },
  starsRow: { flexDirection: 'row', marginBottom: 4 },
  totalReviews: { fontSize: 13, color: '#7f8c8d' },

  // Distribution bar
  distributionBlock: { gap: 5 },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distLabel: { width: 14, fontSize: 12, color: '#2c3e50', textAlign: 'center' },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#f1c40f',
    borderRadius: 4,
  },
  distCount: { width: 24, fontSize: 12, color: '#7f8c8d', textAlign: 'right' },

  // Review card
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardHeaderRight: { flex: 1 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#2c3e50' },
  reviewDate: { fontSize: 12, color: '#7f8c8d', marginTop: 1 },
  overallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9e7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  overallBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f1c40f',
    marginLeft: 3,
  },
  reviewText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 8,
  },
  noReviewText: {
    fontSize: 13,
    color: '#bdc3c7',
    fontStyle: 'italic',
    marginBottom: 8,
  },

  // Sub-ratings
  subRatings: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    gap: 4,
  },
  subRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  subRatingLabel: { fontSize: 12, color: '#7f8c8d' },
  starsSmall: { flexDirection: 'row' },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default MechanicRatingsScreen;
