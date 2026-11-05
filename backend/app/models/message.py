from datetime import datetime
from bson import ObjectId
from app.utils.database import get_db

class MessageModel:
    @staticmethod
    def get_or_create_conversation(user_id, mechanic_id):
        """Find an existing conversation between user and mechanic or create a new one."""
        db = get_db()
        user_id_str = str(user_id)
        mechanic_id_str = str(mechanic_id)

        conv = db.conversations.find_one({
            'user_id': user_id_str,
            'mechanic_id': mechanic_id_str
        })

        if conv:
            return conv

        conv_doc = {
            'user_id': user_id_str,
            'mechanic_id': mechanic_id_str,
            'last_message': '',
            'last_message_at': datetime.utcnow(),
            'cleared_by': {},  # user_id_str -> timestamp
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        res = db.conversations.insert_one(conv_doc)
        conv_doc['_id'] = res.inserted_id
        return conv_doc

    @staticmethod
    def find_conversations_by_user(user_id):
        """Fetch all conversations for a user."""
        db = get_db()
        return list(db.conversations.find({'user_id': str(user_id)}).sort('updated_at', -1))

    @staticmethod
    def find_conversations_by_mechanic(mechanic_id):
        """Fetch all conversations for a mechanic profile."""
        db = get_db()
        return list(db.conversations.find({'mechanic_id': str(mechanic_id)}).sort('updated_at', -1))

    @staticmethod
    def find_conversation_by_id(conv_id):
        """Find conversation by ID."""
        db = get_db()
        try:
            return db.conversations.find_one({'_id': ObjectId(conv_id)})
        except Exception:
            return None

    @staticmethod
    def is_participant(conv, current_user_id):
        """Check if the given user is either the customer or the mechanic in the conversation."""
        if not conv:
            return False
        db = get_db()
        user_id_str = str(current_user_id)
        if conv.get('user_id') == user_id_str:
            return True
        # Check if current_user_id is the mechanic's user_id
        mech = db.mechanics.find_one({'_id': ObjectId(conv['mechanic_id'])}) if ObjectId.is_valid(conv.get('mechanic_id', '')) else None
        if mech and mech.get('user_id') == user_id_str:
            return True
        return False

    @staticmethod
    def create_message(conversation_id, sender_id, sender_role, text):
        """Insert a message and update last_message on conversation."""
        db = get_db()
        now = datetime.utcnow()
        msg_doc = {
            'conversation_id': str(conversation_id),
            'sender_id': str(sender_id),
            'sender_role': sender_role,  # 'user' or 'mechanic'
            'text': text,
            'read': False,
            'is_edited': False,
            'edited_at': None,
            'is_deleted': False,
            'deleted_at': None,
            'created_at': now
        }
        res = db.messages.insert_one(msg_doc)
        msg_doc['_id'] = res.inserted_id

        db.conversations.update_one(
            {'_id': ObjectId(conversation_id)},
            {'$set': {
                'last_message': text,
                'last_message_at': now,
                'updated_at': now
            }}
        )
        return msg_doc

    @staticmethod
    def get_messages(conversation_id, since=None, limit=200):
        """Get messages for a conversation ordered chronologically."""
        db = get_db()
        query = {'conversation_id': str(conversation_id)}
        if since:
            query['created_at'] = {'$gt': since}

        msgs = list(db.messages.find(query).sort('created_at', 1).limit(limit))
        return msgs

    @staticmethod
    def edit_message(msg_id, sender_id, new_text):
        """Edit sender's own message."""
        db = get_db()
        now = datetime.utcnow()
        msg = db.messages.find_one({'_id': ObjectId(msg_id)})
        if not msg:
            return None, 'Message not found'
        if msg.get('sender_id') != str(sender_id):
            return None, 'Unauthorized: you can only edit your own messages'
        if msg.get('is_deleted'):
            return None, 'Cannot edit a deleted message'

        db.messages.update_one(
            {'_id': ObjectId(msg_id)},
            {'$set': {
                'text': new_text,
                'is_edited': True,
                'edited_at': now
            }}
        )
        updated_msg = db.messages.find_one({'_id': ObjectId(msg_id)})
        return updated_msg, None

    @staticmethod
    def delete_message(msg_id, sender_id):
        """Soft delete sender's own message."""
        db = get_db()
        now = datetime.utcnow()
        msg = db.messages.find_one({'_id': ObjectId(msg_id)})
        if not msg:
            return False, 'Message not found'
        if msg.get('sender_id') != str(sender_id):
            return False, 'Unauthorized: you can only delete your own messages'

        db.messages.update_one(
            {'_id': ObjectId(msg_id)},
            {'$set': {
                'is_deleted': True,
                'text': 'This message was deleted',
                'deleted_at': now
            }}
        )
        return True, None

    @staticmethod
    def clear_conversation(conversation_id, user_id):
        """Clear conversation for the current user without deleting for partner or affecting history."""
        db = get_db()
        user_id_str = str(user_id)
        now = datetime.utcnow()
        db.conversations.update_one(
            {'_id': ObjectId(conversation_id)},
            {'$set': {f'cleared_by.{user_id_str}': now}}
        )
        return True

    @staticmethod
    def mark_as_read(conversation_id, current_user_id):
        """Mark unread messages as read where sender_id != current_user_id."""
        db = get_db()
        db.messages.update_many(
            {
                'conversation_id': str(conversation_id),
                'sender_id': {'$ne': str(current_user_id)},
                'read': False
            },
            {'$set': {'read': True}}
        )
