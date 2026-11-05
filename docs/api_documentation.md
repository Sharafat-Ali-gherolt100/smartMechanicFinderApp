# GetFix (Smart Mechanic Finder) — API Documentation

Comprehensive reference for all RESTful API endpoints exposed by the Flask backend (`http://<HOST>:5000/api`).

---

## Headers & Authentication

All protected endpoints require the JSON Web Token (JWT) passed in the `Authorization` header:
```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
Content-Type: application/json
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User / Mechanic
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Muhammad Ali",
  "email": "ali@example.com",
  "password": "Password123!",
  "phone": "03001234567",
  "is_mechanic": true,
  "shop_name": "Ali Auto Care",
  "address": "Main Road, F-10, Islamabad",
  "latitude": 33.6844,
  "longitude": 73.0479,
  "services": ["Oil Change", "Brake Service", "Engine Repair"]
}
```
- **Response (`201 Created`):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "6aa448795d508f80cfe6f101",
    "name": "Muhammad Ali",
    "email": "ali@example.com",
    "is_mechanic": true,
    "phone": "03001234567"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "ali@example.com",
  "password": "Password123!"
}
```
- **Response (`200 OK`):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6aa448795d508f80cfe6f101",
    "name": "Muhammad Ali",
    "email": "ali@example.com",
    "is_mechanic": true,
    "is_admin": false
  }
}
```

### 1.3 Get Current Profile
- **Endpoint:** `GET /api/auth/profile`
- **Access:** Authenticated (Bearer)
- **Response (`200 OK`):** Returns the user document and attached mechanic workshop profile (if `is_mechanic` is true).

---

## 2. Service History & Walk-in Endpoints (`/api/history`)

### 2.1 Add Walk-in Service (Manual Mechanic Entry)
- **Endpoint:** `POST /api/history/mechanic/add`
- **Access:** Authenticated (Mechanic Only)
- **Description:** Adds a service record manually for offline customers visiting the workshop in person.
- **Request Body:**
```json
{
  "customer_name": "Tariq Mehmood",
  "customer_phone": "03129876543",
  "service_type": "Brake Pad Replacement",
  "vehicle_type": "Car",
  "vehicle_number": "ICT-4422",
  "cost": 4500.0,
  "description": "Replaced front ceramic brake pads and topped up brake fluid.",
  "status": "completed"
}
```
- **Response (`201 Created`):**
```json
{
  "message": "Service record added successfully",
  "service_id": "6aa448795d508f80cfe6f193",
  "service": {
    "_id": "6aa448795d508f80cfe6f193",
    "added_by": "mechanic",
    "customer_name": "Tariq Mehmood",
    "customer_phone": "03129876543",
    "vehicle_type": "Car",
    "vehicle_number": "ICT-4422",
    "service_type": "Brake Pad Replacement",
    "cost": 4500.0,
    "status": "completed",
    "service_date": "2026-09-12T00:40:00.000Z",
    "created_at": "2026-09-12T00:40:00.000Z"
  }
}
```

### 2.2 Get Mechanic Service History
- **Endpoint:** `GET /api/history/mechanic`
- **Access:** Authenticated (Mechanic Only)
- **Query Params:** `limit` (int, default: 50), `status` (string, optional: `completed`, `in_progress`, etc.)
- **Response (`200 OK`):**
```json
{
  "count": 1,
  "history": [
    {
      "_id": "6aa448795d508f80cfe6f193",
      "service_type": "Brake Pad Replacement",
      "customer_name": "Tariq Mehmood",
      "customer_phone": "03129876543",
      "vehicle_type": "Car",
      "vehicle_number": "ICT-4422",
      "cost": 4500.0,
      "status": "completed",
      "added_by": "mechanic"
    }
  ]
}
```

### 2.3 Get User Service History
- **Endpoint:** `GET /api/history/user`
- **Access:** Authenticated (Driver / User)
- **Response (`200 OK`):** List of past service records booked with mechanics.

### 2.4 Update Service Status
- **Endpoint:** `PUT /api/history/<service_id>/status`
- **Access:** Authenticated (Mechanic or Customer owner)
- **Request Body:**
```json
{
  "status": "completed"
}
```

---

## 3. Mechanic Workshop Endpoints (`/api/mechanic` & `/api/mechanics`)

### 3.1 Get Mechanic Dashboard
- **Endpoint:** `GET /api/mechanic/dashboard`
- **Access:** Authenticated (Mechanic)
- **Response (`200 OK`):**
```json
{
  "mechanic": {
    "_id": "6aa448795d508f80cfe6f102",
    "shop_name": "Ali Auto Care",
    "status": "open",
    "is_verified": true
  },
  "statistics": {
    "total_services": 24,
    "pending_services": 2,
    "in_progress_services": 1,
    "average_rating": 4.85,
    "total_ratings": 18,
    "active_sos_requests": 0
  },
  "recent_services": [
    {
      "service_id": "6aa448795d508f80cfe6f193",
      "service_type": "Brake Pad Replacement",
      "status": "completed",
      "cost": 4500.0,
      "created_at": "2026-09-12T00:40:00"
    }
  ]
}
```

### 3.2 Update Shop Status
- **Endpoint:** `PUT /api/mechanics/status`
- **Access:** Authenticated (Mechanic)
- **Request Body:**
```json
{
  "status": "open" // "open" | "busy" | "closed"
}
```

### 3.3 Find Nearby Mechanics (Haversine Distance)
- **Endpoint:** `GET /api/mechanics/nearby`
- **Access:** Public
- **Query Params:**
  - `latitude`: Driver's latitude (e.g., 33.6844)
  - `longitude`: Driver's longitude (e.g., 73.0479)
  - `max_distance`: Maximum radius in kilometers (default: 50)
  - `service`: Optional filter by service name (e.g., "Tire Service")
- **Response (`200 OK`):**
```json
{
  "count": 2,
  "mechanics": [
    {
      "_id": "6aa448795d508f80cfe6f102",
      "shop_name": "Ali Auto Care",
      "distance": 1.45,
      "status": "open",
      "rating": 4.8,
      "services": ["Oil Change", "Brake Service"]
    }
  ]
}
```

---

## 4. Emergency SOS Endpoints (`/api/sos`)

### 4.1 Trigger Emergency SOS
- **Endpoint:** `POST /api/sos/create`
- **Access:** Authenticated (User)
- **Request Body:**
```json
{
  "latitude": 33.6912,
  "longitude": 73.0521,
  "location_name": "Kashmir Highway near G-9",
  "issue_type": "Overheating",
  "message": "Smoke coming from radiator, car stopped."
}
```
- **Response (`201 Created`):**
```json
{
  "message": "Emergency SOS broadcast sent",
  "sos_id": "6aa448795d508f80cfe6f555",
  "status": "active"
}
```

### 4.2 Accept Emergency SOS
- **Endpoint:** `POST /api/sos/<sos_id>/accept`
- **Access:** Authenticated (Mechanic)
- **Response (`200 OK`):** Links the mechanic to the SOS call and notifies the driver.

---

## 5. In-App Messaging (`/api/messages`)

### 5.1 Send Message
- **Endpoint:** `POST /api/messages/send`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "receiver_id": "6aa448795d508f80cfe6f102",
  "text": "Hello, how long until you reach my location?"
}
```

### 5.2 Get Conversation Messages
- **Endpoint:** `GET /api/messages/<conversation_id>`
- **Access:** Authenticated

---

## 6. DIY Videos & SOP Endpoints (`/api/videos` & `/api/sop`)

### 6.1 List Videos
- **Endpoint:** `GET /api/videos/list`
- **Access:** Public
- **Response (`200 OK`):**
```json
{
  "count": 3,
  "videos": [
    {
      "_id": "6aa448795d508f80cfe6f901",
      "title": "Battery Jump Start Guide",
      "category": "Battery",
      "file_url": "/api/videos/file/battery_jumpstart.mp4",
      "duration": 120
    }
  ]
}
```

### 6.2 Stream Video File
- **Endpoint:** `GET /api/videos/file/<filename>`
- **Access:** Public (Returns streaming `video/mp4` with HTTP 206 Partial Content range support).

### 6.3 List Pricing SOPs
- **Endpoint:** `GET /api/sop/list`
- **Access:** Public
- **Response (`200 OK`):** Standard estimated pricing brackets for automotive services.

---

## 7. Admin Endpoints (`/api/admin`)

### 7.1 Verify / Ban Mechanic
- **Endpoints:**
  - `PUT /api/admin/mechanics/<id>/verify` — sets `is_verified: true`
  - `PUT /api/admin/mechanics/<id>/ban` — sets `is_banned: true`
- **Access:** Authenticated (`is_admin: true`)

### 7.2 Admin Overview Metrics
- **Endpoint:** `GET /api/admin/dashboard`
- **Access:** Authenticated (`is_admin: true`)
- **Response (`200 OK`):** Total users, registered shops, verified shops, active SOS incidents, total completed jobs.
