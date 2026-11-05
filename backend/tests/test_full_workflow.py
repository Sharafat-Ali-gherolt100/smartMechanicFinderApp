"""
End-to-end integration test covering:
1. Mechanic registration with CNIC, Certificate, and Profile Photo metadata
2. Admin review and verification approval (Pending -> Verified)
3. User creates service request with proposed budget (PKR 5,000) and location
4. Distance calculation and Travel charge calculation (PKR 400/km)
5. Mechanic receives request, reviews budget, and submits counter-offer (+20% -> PKR 6,000 + travel charge)
6. User receives offer, reviews details, accepts offer
7. Selected mechanic is locked in, other offers closed
8. Direct chat conversation created and CRUD chat tested:
   - Create (send message)
   - Read (view history)
   - Update (edit own message)
   - Delete (delete own message)
   - Clear chat (clear for me without affecting other party)
   - Security: third party unauthorized access blocked
9. Mechanic adds service details (Brake pad replacement, Oil change)
10. User and Admin notifications verified
11. Service completed
"""
import unittest
import json
from datetime import datetime
from app import create_app
from app.utils.database import get_db

class TestGetFixWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()
        cls.ctx = cls.app.app_context()
        cls.ctx.push()
        cls.db = get_db()

    @classmethod
    def tearDownClass(cls):
        cls.ctx.pop()

    def setUp(self):
        # Generate unique test email prefixes
        self.ts = int(datetime.utcnow().timestamp() * 1000)

    def test_complete_getfix_workflow(self):
        # 1. Register Admin
        admin_email = f"admin_{self.ts}@test.com"
        res = self.client.post('/api/auth/register', json={
            'name': 'Admin User',
            'email': admin_email,
            'password': 'password123',
            'role': 'admin'
        })
        self.assertEqual(res.status_code, 201)
        admin_token = res.get_json()['access_token']
        # Set is_admin = True in DB
        self.db.users.update_one({'email': admin_email}, {'$set': {'is_admin': True}})

        # 2. Register Mechanic with Verification Details
        mech_email = f"mech_{self.ts}@test.com"
        res = self.client.post('/api/auth/register', json={
            'name': 'Tariq Mehmood',
            'email': mech_email,
            'password': 'password123',
            'phone': '03001234567',
            'role': 'mechanic',
            'shop_name': 'Karakoram Auto Works',
            'address': 'Main Bazar, Skardu',
            'latitude': 35.2973,
            'longitude': 75.6333,
            'location_name': 'Skardu City',
            'cnic_number': '71101-1234567-1',
            'certificate_title': 'Master Automotive Technician (ASE)',
            'cnic_document_url': '/api/uploads/verification/cnic/test_cnic.jpg',
            'certificate_document_url': '/api/uploads/verification/certificate/test_cert.pdf',
            'profile_photo_url': '/api/uploads/verification/profile_photo/test_photo.jpg',
            'services': ['Brake Repair', 'Engine Diagnostics', 'Oil Change']
        })
        self.assertEqual(res.status_code, 201)
        mech_data = res.get_json()
        mech_token = mech_data['access_token']
        mech_id = mech_data['user']['mechanic']['_id']

        # Verify initial verification_status is pending
        self.assertEqual(mech_data['user']['mechanic']['verification_status'], 'pending')
        self.assertEqual(mech_data['user']['mechanic']['cnic_number'], '71101-1234567-1')

        # 3. Admin Reviews Mechanic Verification
        admin_headers = {'Authorization': f'Bearer {admin_token}'}
        res = self.client.get('/api/admin/mechanics?verification_status=pending', headers=admin_headers)
        self.assertEqual(res.status_code, 200)
        pending_list = res.get_json()['mechanics']
        self.assertTrue(any(m['_id'] == mech_id for m in pending_list))

        # Admin gets detailed verification view
        res = self.client.get(f'/api/admin/mechanics/{mech_id}/verification', headers=admin_headers)
        self.assertEqual(res.status_code, 200)
        ver_details = res.get_json()['verification']
        self.assertEqual(ver_details['cnic_number'], '71101-1234567-1')
        self.assertEqual(ver_details['certificate_title'], 'Master Automotive Technician (ASE)')

        # Admin Approves Mechanic
        res = self.client.put(f'/api/admin/mechanics/{mech_id}/verification-status', headers=admin_headers, json={
            'status': 'verified'
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.get_json()['is_verified'])
        self.assertEqual(res.get_json()['verification_status'], 'verified')

        # 4. Register Normal User (Customer)
        user_email = f"customer_{self.ts}@test.com"
        res = self.client.post('/api/auth/register', json={
            'name': 'Ali Khan',
            'email': user_email,
            'password': 'password123',
            'phone': '03119876543',
            'role': 'user'
        })
        self.assertEqual(res.status_code, 201)
        user_token = res.get_json()['access_token']
        user_headers = {'Authorization': f'Bearer {user_token}'}

        # 5. User Creates Service Request with Proposed Budget
        # Location: 5 km away from mechanic (approx 35.3423, 75.6333)
        res = self.client.post('/api/service-requests/create', headers=user_headers, json={
            'service_type': 'Brake Service',
            'vehicle_type': 'Car',
            'description': 'Brake pads worn out, grinding noise when stopping.',
            'proposed_budget': 5000.0,
            'location_name': 'Shangrila Road, Skardu',
            'latitude': 35.3423,
            'longitude': 75.6333
        })
        self.assertEqual(res.status_code, 201)
        req_id = res.get_json()['request_id']
        self.assertEqual(res.get_json()['proposed_budget'], 5000.0)

        # 6. Mechanic Views Available Requests with Travel Charge (PKR 400/km)
        mech_headers = {'Authorization': f'Bearer {mech_token}'}
        res = self.client.get('/api/service-requests/mechanic/available', headers=mech_headers)
        self.assertEqual(res.status_code, 200)
        available_reqs = res.get_json()['requests']
        target_req = next(r for r in available_reqs if r['_id'] == req_id)

        self.assertEqual(target_req['proposed_budget'], 5000.0)
        self.assertGreater(target_req['distance_km'], 0.0)
        expected_travel = round(target_req['distance_km'] * 400.0, 2)
        self.assertEqual(target_req['travel_charge'], expected_travel)
        self.assertEqual(target_req['travel_rate'], 400.0)

        # 7. Mechanic Submits Counter-Offer (+20%)
        # User budget: 5,000 -> 20% increase = 6,000 service amount + travel charge
        res = self.client.post(f'/api/service-requests/{req_id}/offer', headers=mech_headers, json={
            'percentage_increase': 20
        })
        self.assertEqual(res.status_code, 201)
        offer_data = res.get_json()['offer']
        self.assertEqual(offer_data['percentage_increase'], 20)
        self.assertEqual(offer_data['proposed_amount'], 6000.0)
        self.assertEqual(offer_data['travel_charge'], expected_travel)
        self.assertEqual(offer_data['total_amount'], round(6000.0 + expected_travel, 2))

        # 8. User Checks My Requests and Views Counter-Offer
        res = self.client.get('/api/service-requests/user/my', headers=user_headers)
        self.assertEqual(res.status_code, 200)
        my_reqs = res.get_json()['requests']
        my_target = next(r for r in my_reqs if r['_id'] == req_id)
        self.assertEqual(len(my_target['offers']), 1)
        received_offer = my_target['offers'][0]
        self.assertEqual(received_offer['proposed_amount'], 6000.0)
        self.assertEqual(received_offer['percentage_increase'], 20)

        # 9. User Accepts Mechanic's Counter-Offer
        res = self.client.post(f'/api/service-requests/{req_id}/offers/{mech_id}/accept', headers=user_headers)
        self.assertEqual(res.status_code, 200)
        accepted_res = res.get_json()
        self.assertEqual(accepted_res['status'], 'accepted')
        self.assertEqual(accepted_res['agreed_service_amount'], 6000.0)
        self.assertEqual(accepted_res['travel_charge'], expected_travel)
        self.assertEqual(accepted_res['total_amount'], round(6000.0 + expected_travel, 2))
        conv_id = accepted_res['conversation_id']
        self.assertIsNotNone(conv_id)

        # 10. CRUD Chat Operations
        # A) Create: User sends message to mechanic
        res = self.client.post(f'/api/messages/conversations/{conv_id}/messages', headers=user_headers, json={
            'text': 'Hello! When can you arrive at Shangrila Road?'
        })
        self.assertEqual(res.status_code, 201)
        user_msg = res.get_json()['message']
        msg_id = user_msg['_id']

        # B) Create: Mechanic replies
        res = self.client.post(f'/api/messages/conversations/{conv_id}/messages', headers=mech_headers, json={
            'text': 'I am departing now, should be there in 15 minutes.'
        })
        self.assertEqual(res.status_code, 201)

        # C) Read: Both can view messages
        res = self.client.get(f'/api/messages/conversations/{conv_id}/messages', headers=user_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()['messages']), 2)

        # D) Update: User edits own message
        res = self.client.put(f'/api/messages/conversations/{conv_id}/messages/{msg_id}', headers=user_headers, json={
            'text': 'Hello! Please bring new brake pads as well.'
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.get_json()['updated_message']['is_edited'])
        self.assertEqual(res.get_json()['updated_message']['text'], 'Hello! Please bring new brake pads as well.')

        # E) Security: Mechanic cannot edit user's message
        res = self.client.put(f'/api/messages/conversations/{conv_id}/messages/{msg_id}', headers=mech_headers, json={
            'text': 'Hacked message'
        })
        self.assertIn(res.status_code, [400, 403])

        # F) Security: Third party cannot access conversation
        third_party_res = self.client.post('/api/auth/register', json={
            'name': 'Intruder', 'email': f'intruder_{self.ts}@test.com', 'password': 'password123'
        })
        intruder_headers = {'Authorization': f'Bearer {third_party_res.get_json()["access_token"]}'}
        res = self.client.get(f'/api/messages/conversations/{conv_id}/messages', headers=intruder_headers)
        self.assertEqual(res.status_code, 403)

        # G) Delete: User deletes own message
        res = self.client.delete(f'/api/messages/conversations/{conv_id}/messages/{msg_id}', headers=user_headers)
        self.assertEqual(res.status_code, 200)

        # H) Clear Chat for User
        res = self.client.delete(f'/api/messages/conversations/{conv_id}/clear', headers=user_headers)
        self.assertEqual(res.status_code, 200)

        # After clear: User sees 0 messages, but mechanic still sees conversation history
        res = self.client.get(f'/api/messages/conversations/{conv_id}/messages', headers=user_headers)
        self.assertEqual(res.get_json()['count'], 0)
        res_mech = self.client.get(f'/api/messages/conversations/{conv_id}/messages', headers=mech_headers)
        self.assertGreater(res_mech.get_json()['count'], 0)

        # 11. Mechanic Adds Service Details / Items
        res = self.client.post(f'/api/service-requests/{req_id}/items', headers=mech_headers, json={
            'item_name': 'Ceramic Brake Pads (Front)',
            'description': 'Installed premium ceramic brake pads',
            'quantity': 2,
            'price': 3500.0,
            'notes': '6 months warranty included'
        })
        self.assertEqual(res.status_code, 201)

        res = self.client.post(f'/api/service-requests/{req_id}/items', headers=mech_headers, json={
            'item_name': 'Brake Fluid Flush',
            'description': 'DOT 4 brake fluid change',
            'quantity': 1,
            'price': 1200.0,
            'notes': ''
        })
        self.assertEqual(res.status_code, 201)

        # 12. Verify Service Items & User / Admin Notifications
        res = self.client.get(f'/api/service-requests/{req_id}/items', headers=user_headers)
        self.assertEqual(res.status_code, 200)
        items = res.get_json()['items']
        self.assertEqual(len(items), 2)
        self.assertEqual(res.get_json()['total_items_cost'], (3500.0 * 2) + 1200.0)

        # Check in-app notifications generated for user
        user_notifs = list(self.db.notifications.find({'user_id': str(self.db.users.find_one({'email': user_email})['_id'])}))
        self.assertTrue(any(n['type'] == 'service_details_added' for n in user_notifs))

        # Check in-app notifications generated for admin
        admin_notifs = list(self.db.notifications.find({'user_id': str(self.db.users.find_one({'email': admin_email})['_id'])}))
        self.assertTrue(any(n['type'] == 'admin_service_item_logged' for n in admin_notifs))

        # 13. Complete Service
        res = self.client.post(f'/api/service-requests/{req_id}/complete', headers=mech_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['status'], 'completed')

        print("\n=== ALL WORKFLOW TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    unittest.main()
