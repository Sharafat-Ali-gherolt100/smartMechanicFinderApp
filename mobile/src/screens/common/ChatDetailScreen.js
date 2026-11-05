import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

const ChatDetailScreen = ({ route, navigation }) => {
  const { conversationId: initialConvId, mechanicId, userId, partnerName } = route.params || {};

  const [conversationId, setConversationId] = useState(initialConvId || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [headerTitle, setHeaderTitle] = useState(partnerName || 'Chat');

  // Edit / Delete modal states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageActionModalVisible, setMessageActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const flatListRef = useRef(null);

  // Clear Chat confirmation handler
  const handleClearChat = useCallback(() => {
    if (!conversationId) return;

    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear your conversation history? The messages will disappear from your screen while remaining intact for your service history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Chat',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/messages/conversations/${conversationId}/clear`);
              setMessages([]);
              Alert.alert('Chat Cleared', 'Your conversation messages have been cleared.');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear chat.');
            }
          },
        },
      ]
    );
  }, [conversationId]);

  // Set header title & clear chat icon
  useEffect(() => {
    navigation.setOptions({
      title: headerTitle,
      headerRight: () => (
        <TouchableOpacity
          onPress={handleClearChat}
          style={{ marginRight: 12, padding: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="delete-sweep" size={24} color="#e74c3c" />
        </TouchableOpacity>
      ),
    });
  }, [headerTitle, navigation, handleClearChat]);

  // Ensure active conversation ID exists
  const initConversation = useCallback(async () => {
    try {
      if (conversationId) return conversationId;

      let payload = {};
      if (mechanicId) payload.mechanic_id = mechanicId;
      else if (userId) payload.user_id = userId;

      if (!payload.mechanic_id && !payload.user_id) return null;

      const res = await api.post('/messages/conversations', payload);
      const conv = res.data.conversation;
      if (conv) {
        setConversationId(conv._id);
        if (conv.partner && conv.partner.partner_name) {
          setHeaderTitle(conv.partner.shop_name || conv.partner.partner_name);
        }
        return conv._id;
      }
    } catch (err) {
      console.error('Error initializing conversation:', err);
    }
    return null;
  }, [conversationId, mechanicId, userId]);

  // Fetch messages for conversation
  const fetchMessages = useCallback(async (activeId) => {
    const targetId = activeId || conversationId;
    if (!targetId) return;

    try {
      const res = await api.get(`/messages/conversations/${targetId}/messages`);
      setMessages(res.data.messages || []);
      if (res.data.partner && res.data.partner.partner_name) {
        setHeaderTitle(res.data.partner.shop_name || res.data.partner.partner_name);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    let interval = null;
    const setup = async () => {
      const activeId = await initConversation();
      if (activeId) {
        await fetchMessages(activeId);
        // Live polling every 3 seconds for smooth real-time feel
        interval = setInterval(() => {
          fetchMessages(activeId);
        }, 3000);
      } else {
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [initConversation, fetchMessages]);

  // Create message (Send)
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    let activeId = conversationId;
    if (!activeId) {
      activeId = await initConversation();
    }
    if (!activeId) return;

    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/messages/conversations/${activeId}/messages`, { text });
      if (res.data && res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setInputText(text); // restore text on failure
    } finally {
      setSending(false);
    }
  };

  // Open action modal on long press
  const handleMessageLongPress = (msg) => {
    if (!msg.is_mine || msg.is_deleted) return;
    setSelectedMessage(msg);
    setMessageActionModalVisible(true);
  };

  // Open Edit Modal
  const handleStartEdit = () => {
    if (!selectedMessage) return;
    setMessageActionModalVisible(false);
    setEditText(selectedMessage.text);
    setEditModalVisible(true);
  };

  // Submit Edited message (Update)
  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || isUpdating || !selectedMessage) return;

    setIsUpdating(true);
    try {
      const res = await api.put(
        `/messages/conversations/${conversationId}/messages/${selectedMessage._id}`,
        { text: trimmed }
      );

      const updated = res.data.updated_message;
      setMessages((prev) =>
        prev.map((m) => (m._id === selectedMessage._id ? { ...m, ...updated } : m))
      );
      setEditModalVisible(false);
      setSelectedMessage(null);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to edit message');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete message (Delete)
  const handleDeleteMessage = () => {
    if (!selectedMessage) return;
    setMessageActionModalVisible(false);

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(
                `/messages/conversations/${conversationId}/messages/${selectedMessage._id}`
              );
              setMessages((prev) =>
                prev.map((m) =>
                  m._id === selectedMessage._id
                    ? { ...m, is_deleted: true, text: 'This message was deleted' }
                    : m
                )
              );
              setSelectedMessage(null);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete message.');
            }
          },
        },
      ]
    );
  };

  const renderMessageItem = ({ item }) => {
    const isMine = item.is_mine;
    const isDeleted = item.is_deleted;
    const isEdited = item.is_edited;
    const timeStr = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={[styles.bubbleContainer, isMine ? styles.myBubbleContainer : styles.theirBubbleContainer]}>
        <TouchableOpacity
          activeOpacity={isMine && !isDeleted ? 0.8 : 1}
          onLongPress={() => handleMessageLongPress(item)}
          style={[
            styles.bubble,
            isMine ? styles.myBubble : styles.theirBubble,
            isDeleted && styles.deletedBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine ? styles.myMessageText : styles.theirMessageText,
              isDeleted && styles.deletedMessageText,
            ]}
          >
            {item.text}
          </Text>

          <View style={styles.footerRow}>
            {isEdited && !isDeleted && (
              <Text style={[styles.editedTag, isMine ? styles.myEditedTag : styles.theirEditedTag]}>
                (edited)
              </Text>
            )}
            <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.theirTimeText]}>
              {timeStr}
            </Text>
            {isMine && !isDeleted && (
              <Icon
                name={item.read ? 'done-all' : 'done'}
                size={14}
                color={item.read ? '#3498db' : '#95a5a6'}
                style={{ marginLeft: 3 }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading Messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="chat-bubble-outline" size={48} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptySubtitle}>
                Send a message to start communicating with your service partner.
              </Text>
            </View>
          }
        />
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#95a5a6"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Icon name="send" size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Message Action Sheet Modal (Edit / Delete) */}
      <Modal
        visible={messageActionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMessageActionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMessageActionModalVisible(false)}
        >
          <View style={styles.actionSheetContainer}>
            <Text style={styles.actionSheetTitle}>Message Options</Text>

            <TouchableOpacity style={styles.actionSheetBtn} onPress={handleStartEdit}>
              <Icon name="edit" size={20} color="#3498db" />
              <Text style={styles.actionSheetBtnText}>Edit Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionSheetBtn} onPress={handleDeleteMessage}>
              <Icon name="delete" size={20} color="#e74c3c" />
              <Text style={[styles.actionSheetBtnText, { color: '#e74c3c' }]}>Delete Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionSheetBtn, { borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 4 }]}
              onPress={() => setMessageActionModalVisible(false)}
            >
              <Text style={[styles.actionSheetBtnText, { color: '#7f8c8d', textAlign: 'center', width: '100%' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Message Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Message</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Icon name="close" size={22} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.editTextInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />

            <View style={styles.editBtnRow}>
              <TouchableOpacity
                style={styles.editCancelBtn}
                onPress={() => setEditModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={styles.editCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editSaveBtn}
                onPress={handleSaveEdit}
                disabled={isUpdating || !editText.trim()}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.editSaveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#7f8c8d',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bubbleContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  myBubbleContainer: {
    justifyContent: 'flex-end',
  },
  theirBubbleContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: '#2ecc71',
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  deletedBubble: {
    backgroundColor: '#f0f3f4',
    borderWidth: 1,
    borderColor: '#e5e8e8',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#ffffff',
  },
  theirMessageText: {
    color: '#2c3e50',
  },
  deletedMessageText: {
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  editedTag: {
    fontSize: 10,
    fontStyle: 'italic',
    marginRight: 4,
  },
  myEditedTag: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirEditedTag: {
    color: '#95a5a6',
  },
  timeText: {
    fontSize: 11,
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTimeText: {
    color: '#95a5a6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    color: '#2c3e50',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2ecc71',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionSheetContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    padding: 16,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  actionSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionSheetBtnText: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  editModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    padding: 16,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  editTextInput: {
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#2c3e50',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  editCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editCancelBtnText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '600',
  },
  editSaveBtn: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editSaveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatDetailScreen;
