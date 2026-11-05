import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';

const SearchBar = ({ value, onChangeText, placeholder, onSearch, style }) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleClear = () => {
    onChangeText('');
    if (onSearch) onSearch('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: isFocused ? colors.primary : colors.border,
          borderWidth: isFocused ? 2 : 1,
        },
        style,
      ]}
    >
      <Icon name="search" size={20} color={colors.textSecondary} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={() => onSearch && onSearch(value)}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity onPress={handleClear}>
            <Icon name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export default SearchBar;