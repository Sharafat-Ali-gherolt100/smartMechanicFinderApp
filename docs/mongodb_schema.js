// MongoDB Schema Design for Smart Mechanic Finder App

// ============================================
// USERS COLLECTION
// ============================================
db.users.insertOne({
  _id: ObjectId(),
  name: "John Doe",
  email: "john@example.com",
  password_hash: "$2b$12$...",
  phone: "1234567890",
  latitude: 35.2973,
  longitude: 75.6333,
  fcm_token: "fcm_token_here",
  is_mechanic: false,
  is_admin: false,
  is_active: true,
  last_login: ISODate("2026-01-01T10:00:00Z"),
  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// MECHANICS COLLECTION
// ============================================
db.mechanics.insertOne({
  _id: ObjectId(),
  user_id: "user_object_id",
  shop_name: "Skardu Auto Repair",
  address: "Main Bazar, Skardu",
  location: {
    type: "Point",
    coordinates: [75.6333, 35.2973]  // [longitude, latitude]
  },
  latitude: 35.2973,
  longitude: 75.6333,
  status: "open",  // open, closed, busy
  services: ["Engine Repair", "Oil Change", "Tire Service"],
  phone: "03451234567",
  description: "Professional auto repair services",
  opening_hours: {
    monday: {open: "09:00", close: "18:00"},
    tuesday: {open: "09:00", close: "18:00"},
    wednesday: {open: "09:00", close: "18:00"},
    thursday: {open: "09:00", close: "18:00"},
    friday: {open: "09:00", close: "18:00"},
    saturday: {open: "10:00", close: "16:00"},
    sunday: {open: "closed", close: "closed"}
  },
  is_verified: true,
  is_banned: false,
  rating_average: 4.5,
  total_ratings: 25,
  response_time: 15,  // average response time in minutes
  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// RATINGS COLLECTION
// ============================================
db.ratings.insertOne({
  _id: ObjectId(),
  user_id: "user_object_id",
  mechanic_id: "mechanic_object_id",
  service_id: "service_object_id",
  rating: 5,
  review: "Excellent service!",
  service_quality: 5,
  punctuality: 4,
  pricing: 5,
  communication: 5,
  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// SERVICE HISTORY COLLECTION
// ============================================
db.service_history.insertOne({
  _id: ObjectId(),
  user_id: "user_object_id",
  mechanic_id: "mechanic_object_id",
  service_type: "Engine Repair",
  description: "Engine overheating issue",
  cost: 3500.00,
  status: "completed",  // requested, in_progress, completed, cancelled
  rating_given: true,
  service_date: ISODate("2026-01-01T10:00:00Z"),
  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// EMERGENCY SOS COLLECTION
// ============================================
db.emergency_sos.insertOne({
  _id: ObjectId(),
  user_id: "user_object_id",
  location: {
    type: "Point",
    coordinates: [75.6333, 35.2973]
  },
  latitude: 35.2973,
  longitude: 75.6333,
  location_name: "Near Skardu Bazar",
  vehicle_type: "Car",
  issue_description: "Engine stopped suddenly",
  photo_id: "photo_object_id",
  status: "resolved",  // active, responding, resolved, cancelled
  assigned_mechanic_id: "mechanic_object_id",
  response_time: 120,  // seconds
  resolved_time: ISODate("2026-01-01T11:00:00Z"),
  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// NOTIFICATIONS COLLECTION
// ============================================
db.notifications.insertOne({
  _id: ObjectId(),
  user_id: "user_object_id",
  type: "mechanic_status",  // mechanic_status, sos_response, rating_request
  title: "Mechanic Status Update",
  message: "Skardu Auto Repair is now open",
  data: '{"mechanic_id":"mechanic_object_id","status":"open"}',
  is_read: false,
  is_push_sent: true,
  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// PHOTOS COLLECTION
// ============================================
db.photos.insertOne({
  _id: ObjectId(),
  user_id: "user_object_id",
  mechanic_id: null,
  filename: "vehicle_issue.jpg",
  file_path: "/uploads/photos/vehicle_issue.jpg",
  thumbnail_path: "/uploads/thumbnails/vehicle_issue_thumb.jpg",
  file_size: 2048576,
  mime_type: "image/jpeg",
  description: "Engine damage photo",
  is_vehicle_issue: true,
  latitude: 35.2973,
  longitude: 75.6333,
  created_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// ANALYTICS COLLECTION
// ============================================
db.analytics.insertOne({
  _id: ObjectId(),
  event_type: "mechanic_search",
  user_id: "user_object_id",
  mechanic_id: null,
  data: '{"latitude":35.2973,"longitude":75.6333,"radius":10}',
  ip_address: "192.168.1.1",
  user_agent: "Mozilla/5.0 ...",
  timestamp: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// VIDEOS COLLECTION
// ============================================
db.videos.insertOne({
  _id: ObjectId(),
  title: "How to Jump Start a Car Battery",
  description: "Step by step guide to safely jump start a dead car battery",
  category: "Battery",
  url: "https://youtube.com/watch?v=123",
  thumbnail_url: "https://img.youtube.com/vi/123/0.jpg",
  duration: 180,
  views: 1500,
  is_active: true,
  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// REPORTS COLLECTION
// ============================================
db.reports.insertOne({
  _id: ObjectId(),
  user_id: "user_object_id",
  mechanic_id: "mechanic_object_id",
  reason: "Overcharged me PKR 5000 for a tire repair",
  status: "pending",  // pending, reviewed, resolved, dismissed
  resolution: null,
  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// SOP COLLECTION
// ============================================
db.sop.insertOne({
  _id: ObjectId(),
  service_type: "Engine Repair",
  price_range_min: 2000.00,
  price_range_max: 5000.00,
  description: "Standard charges for engine repair services",
  estimated_time: 120,  // minutes
  is_active: true,
  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-01T10:00:00Z")
});

// ============================================
// QUERY EXAMPLES
// ============================================

// 1. Find mechanics within 50km using geospatial query
db.mechanics.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [75.6333, 35.2973]
      },
      $maxDistance: 50000  // meters (50km)
    }
  },
  status: "open",
  is_banned: false
});

// 2. Get mechanic with average rating
db.mechanics.aggregate([
  {
    $match: { status: "open", is_banned: false }
  },
  {
    $lookup: {
      from: "ratings",
      localField: "_id",
      foreignField: "mechanic_id",
      as: "ratings"
    }
  },
  {
    $addFields: {
      rating_average: { $avg: "$ratings.rating" },
      total_ratings: { $size: "$ratings" }
    }
  }
]);

// 3. Get user service history with mechanic details
db.service_history.aggregate([
  {
    $match: { user_id: "user_object_id" }
  },
  {
    $lookup: {
      from: "mechanics",
      localField: "mechanic_id",
      foreignField: "_id",
      as: "mechanic"
    }
  },
  {
    $unwind: "$mechanic"
  },
  {
    $project: {
      service_type: 1,
      status: 1,
      cost: 1,
      service_date: 1,
      "mechanic.shop_name": 1,
      "mechanic.address": 1
    }
  },
  { $sort: { service_date: -1 } }
]);

// 4. Get analytics for a date range
db.analytics.aggregate([
  {
    $match: {
      timestamp: {
        $gte: ISODate("2026-01-01T00:00:00Z"),
        $lte: ISODate("2026-01-31T23:59:59Z")
      }
    }
  },
  {
    $group: {
      _id: "$event_type",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
]);

// 5. Find active SOS requests with user details
db.emergency_sos.aggregate([
  {
    $match: {
      status: { $in: ["active", "responding"] }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "user"
    }
  },
  {
    $unwind: "$user"
  },
  {
    $project: {
      latitude: 1,
      longitude: 1,
      location_name: 1,
      issue_description: 1,
      status: 1,
      created_at: 1,
      "user.name": 1,
      "user.phone": 1
    }
  }
]);

// ============================================
// INDEXES (Run these once)
// ============================================

// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ latitude: 1, longitude: 1 });
db.users.createIndex({ is_mechanic: 1 });

// Mechanics
db.mechanics.createIndex({ "location": "2dsphere" });
db.mechanics.createIndex({ status: 1 });
db.mechanics.createIndex({ is_banned: 1 });
db.mechanics.createIndex({ rating_average: -1 });

// Emergency SOS
db.emergency_sos.createIndex({ status: 1 });
db.emergency_sos.createIndex({ created_at: -1 });

// Analytics
db.analytics.createIndex({ event_type: 1 });
db.analytics.createIndex({ timestamp: -1 });
db.analytics.createIndex({ user_id: 1 });

// Notifications
db.notifications.createIndex({ user_id: 1, created_at: -1 });
db.notifications.createIndex({ is_read: 1 });



