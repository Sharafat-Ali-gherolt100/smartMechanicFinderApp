import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MechanicCard = ({ mechanic, onPress, showDistance, showRating, showStatus }) => {
  const {
    shop_name,
    address,
    distance,
    formattedDistance,
    formattedETA,
    rating_average,
    total_ratings,
    status,
    is_verified,
    services,
    phone,
  } = mechanic;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.shopName} numberOfLines={1}>
            {shop_name}
          </Text>
          {is_verified && (
            <Icon name="verified" size={18} color="#3498db" style={styles.verifiedIcon} />
          )}
        </View>
        {showStatus && (
          <View style={[
            styles.statusBadge,
            { backgroundColor: status === 'open' ? '#2ecc71' : '#e74c3c' }
          ]}>
            <View style={[styles.statusDot, { backgroundColor: status === 'open' ? '#fff' : '#fff' }]} />
            <Text style={styles.statusText}>
              {status === 'open' ? 'Open' : status === 'busy' ? 'Busy' : 'Closed'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color="#7f8c8d" />
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>
        </View>
        {phone && (
          <View style={styles.detailRow}>
            <Icon name="phone" size={16} color="#7f8c8d" />
            <Text style={styles.phone} numberOfLines={1}>{phone}</Text>
          </View>
        )}
        {services && services.length > 0 && (
          <View style={styles.servicesContainer}>
            {services.slice(0, 3).map((service, index) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>{service}</Text>
              </View>
            ))}
            {services.length > 3 && (
              <Text style={styles.moreServices}>+{services.length - 3} more</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {showDistance && (
          <View style={styles.footerItem}>
            <Icon name="navigation" size={16} color="#3498db" />
            <Text style={styles.footerText}>{formattedDistance || 'N/A'}</Text>
            {formattedETA && (
              <Text style={styles.footerSubText}>• {formattedETA}</Text>
            )}
          </View>
        )}
        {showRating && rating_average > 0 && (
          <View style={styles.footerItem}>
            <Icon name="star" size={16} color="#f1c40f" />
            <Text style={styles.footerText}>{rating_average.toFixed(1)}</Text>
            <Text style={styles.footerSubText}>({total_ratings})</Text>
          </View>
        )}
        <View style={styles.footerItem}>
          <Icon name="chevron-right" size={20} color="#bdc3c7" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  details: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 6,
    flex: 1,
  },
  phone: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 6,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  serviceTag: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#3498db',
  },
  moreServices: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#2c3e50',
    marginLeft: 4,
    fontWeight: '500',
  },
  footerSubText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 2,
  },
});

export default MechanicCard;