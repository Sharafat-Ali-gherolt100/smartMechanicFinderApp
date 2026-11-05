import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RatingStars = ({ rating = 0, maxStars = 5, size = 18, color = '#f1c40f' }) => {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    let name = 'star-border';
    if (rating >= i) {
      name = 'star';
    } else if (rating >= i - 0.5) {
      name = 'star-half';
    }
    stars.push(<Icon key={i} name={name} size={size} color={color} style={styles.star} />);
  }

  return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default RatingStars;
