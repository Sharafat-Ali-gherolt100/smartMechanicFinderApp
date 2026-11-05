from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from app.models.message import MessageModel
from bson import ObjectId
from datetime import datetime

message_bp = Blueprint('messages', __name__)

def _get_participant_info(conv, current_user_id):
    """Resolve partner name/shop name for a conversation."""
    db = get_db()
    current_user_str = str(current_user_id)

    # Determine if current user is viewing as user or mechanic in this conversation
    if current_user_str == conv['user_id']:
        # Current identity is the user; partner is the mechanic
        partner_shop_name = 'Mechanic'
        partner_user_name = 'Mechanic'
        mech = db.mechanics.find_one({'_id': ObjectId(conv['mechanic_id'])}) if ObjectId.is_valid(conv.get('mechanic_id', '')) else None
        if mech:
            partner_shop_name = mech.get('shop_name', 'Mechanic')
            partner_user = db.users.find_one({'_id': ObjectId(mech['user_id'])}) if ObjectId.is_valid(mech.get('user_id', '')) else None
            if partner_user:
                partner_user_name = partner_user.get('name', partner_shop_name)
        return {
            'partner_id': conv['mechanic_id'],
            'partner_name': partner_shop_name,
            'partner_role': 'mechanic',
            'shop_name': partner_shop_name
        }
    else:
        # Current identity is mechanic; partner is the user
        partner_name = 'User'
        user = db.users.find_one({'_id': ObjectId(conv['user_id'])}) if ObjectId.is_valid(conv.get('user_id', '')) else None
        if user:
            partner_name = user.get('name', 'User')
        return {
            'partner_id': conv['user_id'],
            'partner_name': partner_name,
            'partner_role': 'user',
            'shop_name': None
        }

@message_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Get all active conversations for the authenticated user/mechanic."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        # Search conversations as user
        user_convs = MessageModel.find_conversations_by_user(user_id)

        # Search conversations as mechanic if user is a mechanic
        mech = db.mechanics.find_one({'user_id': str(user_id)})
        mech_convs = []
        if mech:
            mech_convs = MessageModel.find_conversations_by_mechanic(mech['_id'])

        # Combine and deduplicate
        all_convs_map = {}
        for c in user_convs + mech_convs:
            all_convs_map[str(c['_id'])] = c

        combined = list(all_convs_map.values())
        combined.sort(key=lambda x: x.get('updated_at', datetime.min), reverse=True)

        result = []
        for c in combined:
            partner = _get_participant_info(c, user_id)
            unread_count = db.messages.count_documents({
                'conversation_id': str(c['_id']),
                'sender_id': {'$ne': str(user_id)},
                'read': False
            })
            result.append({
                '_id': str(c['_id']),
                'user_id': c['user_id'],
                'mechanic_id': c['mechanic_id'],
                'last_message': c.get('last_message', ''),
                'last_message_at': c['last_message_at'].isoformat() if c.get('last_message_at') else None,
                'updated_at': c['updated_at'].isoformat() if c.get('updated_at') else None,
                'partner': partner,
                'unread_count': unread_count
            })

        return jsonify({'conversations': result, 'count': len(result)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@message_bp.route('/conversations', methods=['POST'])
@jwt_required()
def start_conversation():
    """Start or retrieve existing conversation with a mechanic or user."""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        db = get_db()

        target_mechanic_id = data.get('mechanic_id')
        target_user_id = data.get('user_id')

        # If mechanic_id passed directly
        if target_mechanic_id:
            mech = db.mechanics.find_one({'_id': ObjectId(target_mechanic_id)}) if ObjectId.is_valid(target_mechanic_id) else None
            if not mech:
                return jsonify({'error': 'Mechanic not found'}), 404
            conv = MessageModel.get_or_create_conversation(current_user_id, target_mechanic_id)
        elif target_user_id:
            mech = db.mechanics.find_one({'user_id': str(current_user_id)})
            if not mech:
                return jsonify({'error': 'Only mechanics can initiate chat with a user ID'}), 400
            conv = MessageModel.get_or_create_conversation(target_user_id, mech['_id'])
        else:
            return jsonify({'error': 'mechanic_id or user_id is required'}), 400

        partner = _get_participant_info(conv, current_user_id)
        return jsonify({
            'conversation': {
                '_id': str(conv['_id']),
                'user_id': conv['user_id'],
                'mechanic_id': conv['mechanic_id'],
                'last_message': conv.get('last_message', ''),
                'last_message_at': conv['last_message_at'].isoformat() if conv.get('last_message_at') else None,
                'partner': partner
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@message_bp.route('/conversations/<conv_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conv_id):
    """Get message history for a conversation with security check and clear-chat filter."""
    try:
        user_id = get_jwt_identity()
        conv = MessageModel.find_conversation_by_id(conv_id)
        if not conv:
            return jsonify({'error': 'Conversation not found'}), 404

        # Security check: must be a participant
        if not MessageModel.is_participant(conv, user_id):
            return jsonify({'error': 'Unauthorized access to this conversation'}), 403

        # Mark messages sent to user as read
        MessageModel.mark_as_read(conv_id, user_id)

        # Check if caller cleared chat
        cleared_by = conv.get('cleared_by', {})
        since_time = cleared_by.get(str(user_id))

        msgs = MessageModel.get_messages(conv_id, since=since_time, limit=200)

        partner = _get_participant_info(conv, user_id)

        formatted_msgs = [{
            '_id': str(m['_id']),
            'conversation_id': m['conversation_id'],
            'sender_id': m['sender_id'],
            'sender_role': m.get('sender_role', 'user'),
            'text': m['text'],
            'read': m.get('read', False),
            'is_edited': m.get('is_edited', False),
            'edited_at': m['edited_at'].isoformat() if m.get('edited_at') else None,
            'is_deleted': m.get('is_deleted', False),
            'created_at': m['created_at'].isoformat() if m.get('created_at') else None,
            'is_mine': m['sender_id'] == str(user_id)
        } for m in msgs]

        return jsonify({
            'conversation_id': conv_id,
            'messages': formatted_msgs,
            'partner': partner,
            'count': len(formatted_msgs)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@message_bp.route('/conversations/<conv_id>/messages', methods=['POST'])
@jwt_required()
def send_message(conv_id):
    """Send a message in a conversation (Create)."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        text = (data.get('text') or '').strip()

        if not text:
            return jsonify({'error': 'Message text cannot be empty'}), 400

        conv = MessageModel.find_conversation_by_id(conv_id)
        if not conv:
            return jsonify({'error': 'Conversation not found'}), 404

        # Security check: must be a participant
        if not MessageModel.is_participant(conv, user_id):
            return jsonify({'error': 'Unauthorized to send message in this conversation'}), 403

        db = get_db()
        mech = db.mechanics.find_one({'user_id': str(user_id)})
        sender_role = 'mechanic' if mech and str(mech['_id']) == conv['mechanic_id'] else 'user'

        msg = MessageModel.create_message(
            conversation_id=conv_id,
            sender_id=user_id,
            sender_role=sender_role,
            text=text
        )

        return jsonify({
            'message': {
                '_id': str(msg['_id']),
                'conversation_id': str(conv_id),
                'sender_id': str(user_id),
                'sender_role': sender_role,
                'text': text,
                'read': False,
                'is_edited': False,
                'is_deleted': False,
                'created_at': msg['created_at'].isoformat(),
                'is_mine': True
            }
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@message_bp.route('/conversations/<conv_id>/messages/<msg_id>', methods=['PUT'])
@jwt_required()
def edit_message(conv_id, msg_id):
    """Edit sender's own message (Update)."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        new_text = (data.get('text') or '').strip()

        if not new_text:
            return jsonify({'error': 'Message text cannot be empty'}), 400

        conv = MessageModel.find_conversation_by_id(conv_id)
        if not conv:
            return jsonify({'error': 'Conversation not found'}), 404

        if not MessageModel.is_participant(conv, user_id):
            return jsonify({'error': 'Unauthorized to access this conversation'}), 403

        updated_msg, err = MessageModel.edit_message(msg_id, user_id, new_text)
        if err:
            return jsonify({'error': err}), 400 if 'deleted' in err or 'not found' in err else 403

        return jsonify({
            'message': 'Message updated successfully',
            'updated_message': {
                '_id': str(updated_msg['_id']),
                'conversation_id': conv_id,
                'sender_id': updated_msg['sender_id'],
                'text': updated_msg['text'],
                'is_edited': True,
                'edited_at': updated_msg['edited_at'].isoformat() if updated_msg.get('edited_at') else None,
                'is_deleted': updated_msg.get('is_deleted', False),
                'created_at': updated_msg['created_at'].isoformat(),
                'is_mine': True
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@message_bp.route('/conversations/<conv_id>/messages/<msg_id>', methods=['DELETE'])
@jwt_required()
def delete_message(conv_id, msg_id):
    """Delete sender's own message (Delete)."""
    try:
        user_id = get_jwt_identity()

        conv = MessageModel.find_conversation_by_id(conv_id)
        if not conv:
            return jsonify({'error': 'Conversation not found'}), 404

        if not MessageModel.is_participant(conv, user_id):
            return jsonify({'error': 'Unauthorized to access this conversation'}), 403

        success, err = MessageModel.delete_message(msg_id, user_id)
        if not success:
            return jsonify({'error': err or 'Failed to delete message'}), 403 if 'Unauthorized' in (err or '') else 400

        return jsonify({
            'message': 'Message deleted successfully',
            'message_id': msg_id,
            'is_deleted': True
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@message_bp.route('/conversations/<conv_id>/clear', methods=['DELETE'])
@jwt_required()
def clear_conversation(conv_id):
    """
    Clear chat for the current user ("Clear for me").
    Messages disappear for this user while remaining available for the other participant
    and without touching service history.
    """
    try:
        user_id = get_jwt_identity()

        conv = MessageModel.find_conversation_by_id(conv_id)
        if not conv:
            return jsonify({'error': 'Conversation not found'}), 404

        if not MessageModel.is_participant(conv, user_id):
            return jsonify({'error': 'Unauthorized to access this conversation'}), 403

        MessageModel.clear_conversation(conv_id, user_id)

        return jsonify({
            'message': 'Chat cleared for you successfully',
            'conversation_id': conv_id
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
