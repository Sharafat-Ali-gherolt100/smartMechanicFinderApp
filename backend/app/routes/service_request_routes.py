from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from app.models.message import MessageModel
from app.utils.haversine import calculate_distance
from bson import ObjectId
from datetime import datetime
import uuid

service_request_bp = Blueprint('service_requests', __name__)

TRAVEL_RATE_PER_KM = 400.0  # PKR 400 per kilometer


@service_request_bp.route('/create', methods=['POST'])
@jwt_required()
def create_service_request():
    """Submit a service request with proposed budget broadcasted to ALL registered mechanics."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        service_type = (data.get('service_type') or 'General Maintenance').strip()
        vehicle_type = (data.get('vehicle_type') or 'Car').strip()
        description = (data.get('description') or '').strip()
        proposed_budget = float(data.get('proposed_budget') or 0.0)

        if not description:
            return jsonify({'error': 'Description of the repair/issue is required'}), 400

        db = get_db()
        req_doc = {
            'user_id': str(user_id),
            'service_type': service_type,
            'vehicle_type': vehicle_type,
            'description': description,
            'proposed_budget': proposed_budget,
            'location_name': data.get('location_name', 'Current Location'),
            'latitude': float(data.get('latitude', 35.2973)),
            'longitude': float(data.get('longitude', 75.6333)),
            'status': 'pending',  # 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
            'accepted_by_mechanic_id': None,
            'agreed_service_amount': None,
            'travel_charge': None,
            'distance_km': None,
            'travel_rate': TRAVEL_RATE_PER_KM,
            'total_amount': None,
            'offers': [],
            'service_items': [],
            'accepted_at': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        res = db.service_requests.insert_one(req_doc)
        request_id = str(res.inserted_id)

        # Notify ALL registered & non-banned mechanics via in-app notifications
        try:
            from app.utils.notifications import send_in_app_notification
            all_mechanics = list(db.mechanics.find({'is_banned': False}))
            for mech in all_mechanics:
                mech_user_id = mech.get('user_id')
                if mech_user_id:
                    budget_str = f" (Budget: PKR {proposed_budget:,.0f})" if proposed_budget > 0 else ""
                    send_in_app_notification(
                        mech_user_id,
                        'new_service_request',
                        'New Service Request Available!',
                        f'New job request for {service_type}{budget_str}: {description[:60]}',
                        {'request_id': request_id, 'proposed_budget': proposed_budget}
                    )
        except Exception:
            pass

        return jsonify({
            'message': 'Service request broadcasted to all mechanics successfully',
            'request_id': request_id,
            'proposed_budget': proposed_budget,
            'status': 'pending'
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_request_bp.route('/user/my', methods=['GET'])
@jwt_required()
def get_user_service_requests():
    """Get the current user's submitted service requests along with offers and service details."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        reqs = list(db.service_requests.find({'user_id': str(user_id)}).sort('created_at', -1))

        formatted = []
        for r in reqs:
            accepted_mechanic = None
            conversation_id = None
            if r.get('accepted_by_mechanic_id'):
                mech_id = r['accepted_by_mechanic_id']
                try:
                    mech = db.mechanics.find_one({'_id': ObjectId(mech_id)})
                    if mech:
                        accepted_mechanic = {
                            '_id': str(mech['_id']),
                            'shop_name': mech.get('shop_name', 'Mechanic'),
                            'phone': mech.get('phone', 'N/A'),
                            'address': mech.get('address', ''),
                            'rating_average': mech.get('rating_average', 0.0)
                        }
                        conv = MessageModel.get_or_create_conversation(user_id, str(mech['_id']))
                        conversation_id = str(conv['_id'])
                except Exception:
                    pass

            # Format offers
            formatted_offers = []
            for off in r.get('offers', []):
                formatted_offers.append({
                    'offer_id': off.get('offer_id'),
                    'mechanic_id': off.get('mechanic_id'),
                    'shop_name': off.get('shop_name', 'Mechanic'),
                    'phone': off.get('phone', ''),
                    'rating_average': off.get('rating_average', 0.0),
                    'proposed_amount': off.get('proposed_amount', 0.0),
                    'percentage_increase': off.get('percentage_increase', 0),
                    'distance_km': off.get('distance_km', 0.0),
                    'travel_rate': off.get('travel_rate', TRAVEL_RATE_PER_KM),
                    'travel_charge': off.get('travel_charge', 0.0),
                    'total_amount': off.get('total_amount', 0.0),
                    'status': off.get('status', 'pending'),
                    'created_at': off['created_at'].isoformat() if off.get('created_at') else None
                })

            formatted.append({
                '_id': str(r['_id']),
                'service_type': r['service_type'],
                'vehicle_type': r.get('vehicle_type', 'Vehicle'),
                'description': r['description'],
                'proposed_budget': r.get('proposed_budget', 0.0),
                'agreed_service_amount': r.get('agreed_service_amount'),
                'travel_charge': r.get('travel_charge'),
                'distance_km': r.get('distance_km'),
                'travel_rate': r.get('travel_rate', TRAVEL_RATE_PER_KM),
                'total_amount': r.get('total_amount'),
                'location_name': r.get('location_name'),
                'latitude': r.get('latitude'),
                'longitude': r.get('longitude'),
                'status': r['status'],
                'accepted_mechanic': accepted_mechanic,
                'conversation_id': conversation_id,
                'offers': formatted_offers,
                'offers_count': len(formatted_offers),
                'service_items': r.get('service_items', []),
                'accepted_at': r['accepted_at'].isoformat() if r.get('accepted_at') else None,
                'created_at': r['created_at'].isoformat() if r.get('created_at') else None
            })

        return jsonify({'requests': formatted, 'count': len(formatted)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_request_bp.route('/mechanic/available', methods=['GET'])
@jwt_required()
def get_available_requests_for_mechanic():
    """
    Mechanic: view ALL pending service requests broadcasted to mechanics,
    with distance, travel charges (PKR 400/km), and existing offers.
    """
    try:
        user_id = get_jwt_identity()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        mechanic_id = str(mechanic['_id'])
        mech_lat = float(mechanic.get('latitude') or 35.2973)
        mech_lng = float(mechanic.get('longitude') or 75.6333)

        # Find all pending requests, plus any requests accepted by THIS mechanic
        reqs = list(db.service_requests.find({
            '$or': [
                {'status': 'pending'},
                {'accepted_by_mechanic_id': mechanic_id}
            ]
        }).sort('created_at', -1))

        formatted = []
        for r in reqs:
            user_name = 'User'
            try:
                user = db.users.find_one({'_id': ObjectId(r['user_id'])})
                if user:
                    user_name = user.get('name', 'User')
            except Exception:
                pass

            # Calculate distance from mechanic to user
            req_lat = float(r.get('latitude') or 35.2973)
            req_lng = float(r.get('longitude') or 75.6333)
            dist_km = round(calculate_distance(mech_lat, mech_lng, req_lat, req_lng), 2)
            travel_charge = round(dist_km * TRAVEL_RATE_PER_KM, 2)

            # Check if this mechanic already has an offer
            my_offer = None
            for off in r.get('offers', []):
                if off.get('mechanic_id') == mechanic_id:
                    my_offer = {
                        'offer_id': off.get('offer_id'),
                        'proposed_amount': off.get('proposed_amount'),
                        'percentage_increase': off.get('percentage_increase', 0),
                        'distance_km': off.get('distance_km', dist_km),
                        'travel_charge': off.get('travel_charge', travel_charge),
                        'total_amount': off.get('total_amount'),
                        'status': off.get('status', 'pending'),
                        'created_at': off['created_at'].isoformat() if off.get('created_at') else None
                    }
                    break

            conversation_id = None
            if r.get('accepted_by_mechanic_id') == mechanic_id:
                conv = MessageModel.get_or_create_conversation(r['user_id'], mechanic_id)
                conversation_id = str(conv['_id'])

            user_budget = float(r.get('proposed_budget') or 0.0)
            total_est = round(user_budget + travel_charge, 2)

            formatted.append({
                '_id': str(r['_id']),
                'user_id': r['user_id'],
                'user_name': user_name,
                'service_type': r['service_type'],
                'vehicle_type': r.get('vehicle_type', 'Vehicle'),
                'description': r['description'],
                'location_name': r.get('location_name'),
                'latitude': req_lat,
                'longitude': req_lng,
                'status': r['status'],
                'proposed_budget': user_budget,
                'distance_km': dist_km,
                'travel_rate': TRAVEL_RATE_PER_KM,
                'travel_charge': travel_charge,
                'total_estimated_amount': total_est,
                'agreed_service_amount': r.get('agreed_service_amount'),
                'my_offer': my_offer,
                'has_submitted_offer': my_offer is not None,
                'is_accepted_by_me': r.get('accepted_by_mechanic_id') == mechanic_id,
                'conversation_id': conversation_id,
                'service_items': r.get('service_items', []),
                'created_at': r['created_at'].isoformat() if r.get('created_at') else None
            })

        return jsonify({'requests': formatted, 'count': len(formatted)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_request_bp.route('/<request_id>/offer', methods=['POST'])
@jwt_required()
def submit_mechanic_offer(request_id):
    """
    Mechanic submits offer / counter-offer on a pending service request:
    Accept original budget (percentage_increase = 0) OR increase by 10%, 20%, 30%, 40%.
    Travel charge calculated separately at PKR 400/km.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        mechanic_id = str(mechanic['_id'])

        req = db.service_requests.find_one({'_id': ObjectId(request_id)})
        if not req:
            return jsonify({'error': 'Service request not found'}), 404

        if req.get('status') != 'pending':
            return jsonify({'error': 'This request is no longer accepting offers.'}), 400

        percentage_increase = int(data.get('percentage_increase', 0))
        if percentage_increase not in [0, 10, 20, 30, 40]:
            return jsonify({'error': 'Invalid percentage increase. Allowed: 0, 10, 20, 30, 40'}), 400

        user_budget = float(req.get('proposed_budget') or 0.0)

        # Calculate service amount based on percentage increase
        if percentage_increase > 0:
            proposed_service_amount = round(user_budget * (1 + (percentage_increase / 100.0)), 2)
        else:
            proposed_service_amount = user_budget

        # Calculate distance and travel charge (PKR 400/km)
        mech_lat = float(mechanic.get('latitude') or 35.2973)
        mech_lng = float(mechanic.get('longitude') or 75.6333)
        req_lat = float(req.get('latitude') or 35.2973)
        req_lng = float(req.get('longitude') or 75.6333)
        distance_km = round(calculate_distance(mech_lat, mech_lng, req_lat, req_lng), 2)
        travel_charge = round(distance_km * TRAVEL_RATE_PER_KM, 2)
        total_amount = round(proposed_service_amount + travel_charge, 2)

        offer_id = str(uuid.uuid4())
        offer_doc = {
            'offer_id': offer_id,
            'mechanic_id': mechanic_id,
            'shop_name': mechanic.get('shop_name', 'Mechanic'),
            'phone': mechanic.get('phone', ''),
            'rating_average': mechanic.get('rating_average', 0.0),
            'proposed_amount': proposed_service_amount,
            'percentage_increase': percentage_increase,
            'distance_km': distance_km,
            'travel_rate': TRAVEL_RATE_PER_KM,
            'travel_charge': travel_charge,
            'total_amount': total_amount,
            'status': 'pending',
            'created_at': datetime.utcnow()
        }

        # Remove existing offer from this mechanic if any, then add new offer
        db.service_requests.update_one(
            {'_id': ObjectId(request_id)},
            {
                '$pull': {'offers': {'mechanic_id': mechanic_id}},
            }
        )
        db.service_requests.update_one(
            {'_id': ObjectId(request_id)},
            {
                '$push': {'offers': offer_doc},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )

        # Notify user
        try:
            from app.utils.notifications import send_in_app_notification
            incr_text = f" (+{percentage_increase}%)" if percentage_increase > 0 else " (Accepted budget)"
            send_in_app_notification(
                req['user_id'],
                'new_mechanic_offer',
                'New Offer Received for Your Service Request!',
                f"{mechanic.get('shop_name', 'A mechanic')} offered PKR {proposed_service_amount:,.0f}{incr_text}. Travel: PKR {travel_charge:,.0f}. Total: PKR {total_amount:,.0f}.",
                {
                    'request_id': request_id,
                    'offer_id': offer_id,
                    'mechanic_id': mechanic_id,
                    'proposed_amount': proposed_service_amount,
                    'percentage_increase': percentage_increase,
                    'travel_charge': travel_charge,
                    'total_amount': total_amount
                }
            )
        except Exception:
            pass

        return jsonify({
            'message': 'Offer submitted successfully',
            'offer': {
                'offer_id': offer_id,
                'mechanic_id': mechanic_id,
                'shop_name': mechanic.get('shop_name'),
                'proposed_amount': proposed_service_amount,
                'percentage_increase': percentage_increase,
                'distance_km': distance_km,
                'travel_charge': travel_charge,
                'total_amount': total_amount
            }
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_request_bp.route('/<request_id>/offers/<mechanic_id>/accept', methods=['POST'])
@jwt_required()
def accept_mechanic_offer(request_id, mechanic_id):
    """
    User accepts a specific mechanic's offer.
    Locks the request to this mechanic, closes other offers, and activates chat.
    """
    try:
        user_id = get_jwt_identity()
        db = get_db()

        req = db.service_requests.find_one({'_id': ObjectId(request_id), 'user_id': str(user_id)})
        if not req:
            return jsonify({'error': 'Service request not found or unauthorized'}), 404

        if req.get('status') != 'pending':
            return jsonify({'error': f'Request cannot be accepted in status "{req.get("status")}"'}), 400

        # Find the specific offer
        selected_offer = None
        for off in req.get('offers', []):
            if off.get('mechanic_id') == mechanic_id:
                selected_offer = off
                break

        if not selected_offer:
            return jsonify({'error': 'Offer from this mechanic not found'}), 404

        # Atomic update: assign selected mechanic and mark accepted
        now = datetime.utcnow()
        result = db.service_requests.update_one(
            {'_id': ObjectId(request_id), 'status': 'pending'},
            {
                '$set': {
                    'status': 'accepted',
                    'accepted_by_mechanic_id': mechanic_id,
                    'agreed_service_amount': selected_offer.get('proposed_amount'),
                    'travel_charge': selected_offer.get('travel_charge'),
                    'distance_km': selected_offer.get('distance_km'),
                    'total_amount': selected_offer.get('total_amount'),
                    'accepted_at': now,
                    'updated_at': now
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({'error': 'Request has already been accepted by another mechanic.'}), 409

        # Update offer statuses: set selected offer to accepted, others to rejected
        db.service_requests.update_one(
            {'_id': ObjectId(request_id), 'offers.mechanic_id': mechanic_id},
            {'$set': {'offers.$.status': 'accepted'}}
        )
        db.service_requests.update_many(
            {'_id': ObjectId(request_id), 'offers.mechanic_id': {'$ne': mechanic_id}},
            {'$set': {'offers.$[].status': 'rejected'}}
        )

        # Create / open chat conversation between user and accepted mechanic
        conv = MessageModel.get_or_create_conversation(str(user_id), mechanic_id)

        # Notify the accepted mechanic
        try:
            from app.utils.notifications import send_in_app_notification
            mech = db.mechanics.find_one({'_id': ObjectId(mechanic_id)})
            user = db.users.find_one({'_id': ObjectId(user_id)})
            customer_name = user.get('name', 'The customer') if user else 'The customer'

            if mech and mech.get('user_id'):
                send_in_app_notification(
                    mech['user_id'],
                    'offer_accepted',
                    'Your Offer Was Accepted!',
                    f"{customer_name} accepted your offer of PKR {selected_offer.get('total_amount', 0):,.0f}. You can now start chatting.",
                    {
                        'request_id': request_id,
                        'conversation_id': str(conv['_id']),
                        'total_amount': selected_offer.get('total_amount')
                    }
                )

            # Notify other mechanics whose offers were closed
            for off in req.get('offers', []):
                other_mech_id = off.get('mechanic_id')
                if other_mech_id != mechanic_id:
                    other_mech = db.mechanics.find_one({'_id': ObjectId(other_mech_id)})
                    if other_mech and other_mech.get('user_id'):
                        send_in_app_notification(
                            other_mech['user_id'],
                            'offer_declined',
                            'Service Request Closed',
                            f"The service request for {req.get('service_type')} was accepted with another mechanic.",
                            {'request_id': request_id}
                        )
        except Exception:
            pass

        return jsonify({
            'message': 'Offer accepted successfully! Mechanic selected and chat enabled.',
            'request_id': request_id,
            'mechanic_id': mechanic_id,
            'conversation_id': str(conv['_id']),
            'agreed_service_amount': selected_offer.get('proposed_amount'),
            'travel_charge': selected_offer.get('travel_charge'),
            'total_amount': selected_offer.get('total_amount'),
            'status': 'accepted'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_request_bp.route('/<request_id>/offers/<mechanic_id>/reject', methods=['POST'])
@jwt_required()
def reject_mechanic_offer(request_id, mechanic_id):
    """User rejects a specific mechanic's offer."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        req = db.service_requests.find_one({'_id': ObjectId(request_id), 'user_id': str(user_id)})
        if not req:
            return jsonify({'error': 'Service request not found or unauthorized'}), 404

        db.service_requests.update_one(
            {'_id': ObjectId(request_id), 'offers.mechanic_id': mechanic_id},
            {
                '$set': {
                    'offers.$.status': 'rejected',
                    'updated_at': datetime.utcnow()
                }
            }
        )

        # Notify mechanic
        try:
            from app.utils.notifications import send_in_app_notification
            mech = db.mechanics.find_one({'_id': ObjectId(mechanic_id)})
            if mech and mech.get('user_id'):
                send_in_app_notification(
                    mech['user_id'],
                    'offer_rejected',
                    'Offer Declined',
                    f"Your offer for {req.get('service_type')} was declined by the customer.",
                    {'request_id': request_id}
                )
        except Exception:
            pass

        return jsonify({'message': 'Offer rejected', 'status': 'rejected'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_request_bp.route('/<request_id>/accept', methods=['POST'])
@jwt_required()
def accept_service_request(request_id):
    """
    Direct accept route (backward-compatible):
    Mechanic accepts request at user proposed budget directly.
    """
    try:
        user_id = get_jwt_identity()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        mechanic_id = str(mechanic['_id'])

        req = db.service_requests.find_one({'_id': ObjectId(request_id)})
        if not req:
            return jsonify({'error': 'Service request not found'}), 404

        # Calculate distance and travel charge
        mech_lat = float(mechanic.get('latitude') or 35.2973)
        mech_lng = float(mechanic.get('longitude') or 75.6333)
        req_lat = float(req.get('latitude') or 35.2973)
        req_lng = float(req.get('longitude') or 75.6333)
        distance_km = round(calculate_distance(mech_lat, mech_lng, req_lat, req_lng), 2)
        travel_charge = round(distance_km * TRAVEL_RATE_PER_KM, 2)
        service_amount = float(req.get('proposed_budget') or 0.0)
        total_amount = round(service_amount + travel_charge, 2)

        # Atomic update to ensure only 1 mechanic can take it
        result = db.service_requests.update_one(
            {'_id': ObjectId(request_id), 'status': 'pending'},
            {'$set': {
                'status': 'accepted',
                'accepted_by_mechanic_id': mechanic_id,
                'agreed_service_amount': service_amount,
                'travel_charge': travel_charge,
                'distance_km': distance_km,
                'total_amount': total_amount,
                'accepted_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }}
        )

        if result.modified_count == 0:
            existing = db.service_requests.find_one({'_id': ObjectId(request_id)})
            if not existing:
                return jsonify({'error': 'Service request not found'}), 404
            if existing['status'] != 'pending':
                return jsonify({
                    'error': 'This service request has already been accepted by another mechanic.',
                    'already_accepted': True
                }), 409

        # Request accepted! Auto-create conversation between user & accepted mechanic
        conv = MessageModel.get_or_create_conversation(req['user_id'], mechanic_id)

        # Notify user
        try:
            from app.utils.notifications import send_in_app_notification
            send_in_app_notification(
                req['user_id'],
                'request_accepted',
                'Service Request Accepted!',
                f'Mechanic {mechanic.get("shop_name", "a mechanic")} accepted your request for {req.get("service_type")} at PKR {total_amount:,.0f} (including PKR {travel_charge:,.0f} travel).',
                {'request_id': request_id, 'mechanic_id': mechanic_id, 'total_amount': total_amount}
            )
        except Exception:
            pass

        return jsonify({
            'message': 'Service request accepted successfully!',
            'request_id': request_id,
            'conversation_id': str(conv['_id']),
            'agreed_service_amount': service_amount,
            'travel_charge': travel_charge,
            'distance_km': distance_km,
            'total_amount': total_amount,
            'status': 'accepted'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_request_bp.route('/<request_id>/items', methods=['POST'])
@jwt_required()
def add_service_item(request_id):
    """
    Mechanic adds/updates service items/details during or after providing service.
    Triggers User Notification and Admin Monitoring Notification.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Only mechanics can add service items'}), 403

        mechanic_id = str(mechanic['_id'])

        req = db.service_requests.find_one({'_id': ObjectId(request_id)})
        if not req:
            return jsonify({'error': 'Service request not found'}), 404

        # Validate that this mechanic is the assigned mechanic
        if req.get('accepted_by_mechanic_id') != mechanic_id:
            return jsonify({'error': 'You are not the assigned mechanic for this request'}), 403

        item_name = (data.get('item_name') or '').strip()
        if not item_name:
            return jsonify({'error': 'Item name is required'}), 400

        item_doc = {
            'item_id': str(uuid.uuid4()),
            'item_name': item_name,
            'description': data.get('description', ''),
            'quantity': int(data.get('quantity', 1)),
            'price': float(data.get('price', 0.0)),
            'notes': data.get('notes', ''),
            'added_at': datetime.utcnow()
        }

        db.service_requests.update_one(
            {'_id': ObjectId(request_id)},
            {
                '$push': {'service_items': item_doc},
                '$set': {
                    'status': 'in_progress' if req.get('status') == 'accepted' else req.get('status'),
                    'updated_at': datetime.utcnow()
                }
            }
        )

        user_doc = db.users.find_one({'_id': ObjectId(req['user_id'])})
        customer_name = user_doc.get('name', 'Customer') if user_doc else 'Customer'

        # Send User Notification
        try:
            from app.utils.notifications import send_in_app_notification
            send_in_app_notification(
                req['user_id'],
                'service_details_added',
                'Service Details Added',
                f"Your mechanic added new service item: {item_name} (PKR {item_doc['price']:,.0f}).",
                {
                    'request_id': request_id,
                    'item': item_doc,
                    'mechanic_id': mechanic_id
                }
            )
        except Exception:
            pass

        # Send Admin Monitoring Notification to all admins
        try:
            from app.utils.notifications import send_in_app_notification
            admins = list(db.users.find({'is_admin': True}))
            for admin in admins:
                send_in_app_notification(
                    str(admin['_id']),
                    'admin_service_item_logged',
                    'Mechanic Added Service Item',
                    f"Mechanic {mechanic.get('shop_name')} added '{item_name}' (PKR {item_doc['price']:,.0f}) for {customer_name} (Request #{request_id[:6]}).",
                    {
                        'request_id': request_id,
                        'mechanic_id': mechanic_id,
                        'user_id': req['user_id'],
                        'item': item_doc
                    }
                )
        except Exception:
            pass

        return jsonify({
            'message': 'Service item added successfully',
            'item': item_doc
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_request_bp.route('/<request_id>/items', methods=['GET'])
@jwt_required()
def get_service_items(request_id):
    """Get all service items logged for a service request."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        req = db.service_requests.find_one({'_id': ObjectId(request_id)})
        if not req:
            return jsonify({'error': 'Service request not found'}), 404

        items = req.get('service_items', [])
        formatted_items = [{
            'item_id': it.get('item_id'),
            'item_name': it.get('item_name'),
            'description': it.get('description'),
            'quantity': it.get('quantity', 1),
            'price': it.get('price', 0.0),
            'notes': it.get('notes'),
            'added_at': it['added_at'].isoformat() if it.get('added_at') else None
        } for it in items]

        total_items_cost = sum(it.get('price', 0.0) * it.get('quantity', 1) for it in items)

        return jsonify({
            'request_id': request_id,
            'items': formatted_items,
            'total_items_cost': total_items_cost,
            'count': len(formatted_items)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_request_bp.route('/<request_id>/complete', methods=['POST'])
@jwt_required()
def complete_service_request(request_id):
    """Mark service request completed and record service history."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        req = db.service_requests.find_one({'_id': ObjectId(request_id)})
        if not req:
            return jsonify({'error': 'Service request not found'}), 404

        db.service_requests.update_one(
            {'_id': ObjectId(request_id)},
            {'$set': {'status': 'completed', 'updated_at': datetime.utcnow()}}
        )

        # Notify user
        try:
            from app.utils.notifications import send_in_app_notification
            send_in_app_notification(
                req['user_id'],
                'service_completed',
                'Service Completed!',
                f"Your vehicle service for {req.get('service_type')} has been marked completed.",
                {'request_id': request_id}
            )
        except Exception:
            pass

        return jsonify({'message': 'Service request marked completed', 'status': 'completed'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
