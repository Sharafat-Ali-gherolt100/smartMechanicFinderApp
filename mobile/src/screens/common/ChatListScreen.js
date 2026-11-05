import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

const ChatListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchConversations();
    });
    return unsubscribe;
  }, [fetchConversations, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const renderItem = ({ item }) => {
    const partner = item.partner || {};
    const title = partner.shop_name || partner.partner_name || 'Chat Partner';
    const subTitle = partner.partner_role === 'mechanic' ? 'Mechanic Shop' : 'Customer';
    const isUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() =>
          navigation.navigate('ChatDetail', {
            conversationId: item._id,
            partnerName: title,
            partnerRole: partner.partner_role,
          })
        }
      >
        <View style={styles.avatarContainer}>
          <Icon
            name={partner.partner_role === 'mechanic' ? 'build' : 'person'}
            size={24}
            color="#ffffff"
          />
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {title}
            </Text>
            {item.last_message_at && (
              <Text style={styles.timeText}>
                {new Date(item.last_message_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </View>

          <View style={styles.chatFooter}>
            <Text
              style={[styles.lastMessage, isUnread && styles.unreadMessageText]}
              numberOfLines={1}
            >
              {item.last_message || 'Tap to send a message...'}
            </Text>

            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading Messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3498db']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chat-bubble-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>No Conversations Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your chats with mechanics and users will appear here.
            </Text>
          </View>
        }
        contentContainerStyle={conversations.length === 0 ? styles.emptyList : styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#7f8c8d',
  },
  listContent: {
    padding: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
    marginRight: 8,
  },
  unreadMessageText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  unreadBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default ChatListScreen;
