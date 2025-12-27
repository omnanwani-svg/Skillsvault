# API Documentation

This document describes all API endpoints available in the SkillsVault platform.

## Authentication

All API routes require authentication via Supabase Auth. The user's session is automatically handled by the Supabase client.

## Base URL

\`\`\`
/api
\`\`\`

## Endpoints

### Profile Management

#### GET `/api/profile`

Get the current user's profile.

**Response:**
\`\`\`json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "bio": "Software developer",
  "avatar_url": "https://...",
  "time_balance": 10,
  "total_earned": 25,
  "total_spent": 15,
  "is_admin": false,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
\`\`\`

#### PUT `/api/profile`

Update the current user's profile.

**Request Body:**
\`\`\`json
{
  "full_name": "John Doe",
  "bio": "Updated bio",
  "avatar_url": "https://..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "profile": { /* updated profile */ }
}
\`\`\`

### Skills Management

#### GET `/api/skills`

Get all verified skills or user's own skills.

**Query Parameters:**
- `userId` (optional): Filter by user ID

**Response:**
\`\`\`json
{
  "skills": [
    {
      "id": "uuid",
      "title": "Web Development",
      "description": "Full-stack web development",
      "category": "Technology",
      "hourly_rate": 1,
      "certification_level": "Advanced",
      "certificate_url": "https://...",
      "certificate_issuer": "Coursera",
      "certificate_id": "ABC123",
      "verification_status": "auto_verified",
      "is_verified": true,
      "demo_video_url": "https://...",
      "user_id": "uuid",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

#### POST `/api/skills`

Create a new skill listing.

**Request Body:**
\`\`\`json
{
  "title": "Web Development",
  "description": "Full-stack web development",
  "category": "Technology",
  "hourly_rate": 1,
  "certification_level": "Advanced",
  "certificate_url": "https://coursera.org/verify/ABC123",
  "certificate_issuer": "Coursera",
  "certificate_id": "ABC123",
  "demo_video_url": "https://..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "skill": { /* created skill */ },
  "verification_status": "auto_verified",
  "message": "Skill created and auto-verified!"
}
\`\`\`

#### PUT `/api/skills`

Update an existing skill.

**Request Body:**
\`\`\`json
{
  "id": "uuid",
  "title": "Updated Title",
  "description": "Updated description"
}
\`\`\`

#### DELETE `/api/skills`

Delete a skill.

**Request Body:**
\`\`\`json
{
  "id": "uuid"
}
\`\`\`

### Skill Requests

#### GET `/api/requests`

Get skill requests (sent or received).

**Query Parameters:**
- `type`: "sent" or "received"

**Response:**
\`\`\`json
{
  "requests": [
    {
      "id": "uuid",
      "skill_id": "uuid",
      "requester_id": "uuid",
      "provider_id": "uuid",
      "hours_requested": 2,
      "status": "pending",
      "notes": "Need help with...",
      "created_at": "2025-01-01T00:00:00Z",
      "skill": { /* skill details */ },
      "requester": { /* user details */ },
      "provider": { /* user details */ }
    }
  ]
}
\`\`\`

#### POST `/api/requests`

Create a new skill request.

**Request Body:**
\`\`\`json
{
  "skillId": "uuid",
  "providerId": "uuid",
  "hoursRequested": 2,
  "notes": "I need help with..."
}
\`\`\`

#### PUT `/api/requests`

Update request status (accept/reject).

**Request Body:**
\`\`\`json
{
  "requestId": "uuid",
  "status": "accepted"
}
\`\`\`

### Messages

#### GET `/api/messages`

Get messages for a specific request.

**Query Parameters:**
- `requestId`: UUID of the request

**Response:**
\`\`\`json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "recipient_id": "uuid",
      "request_id": "uuid",
      "content": "Hello!",
      "read": false,
      "created_at": "2025-01-01T00:00:00Z",
      "sender": { /* user details */ }
    }
  ]
}
\`\`\`

#### POST `/api/messages`

Send a new message.

**Request Body:**
\`\`\`json
{
  "requestId": "uuid",
  "recipientId": "uuid",
  "content": "Hello!"
}
\`\`\`

#### PUT `/api/messages`

Mark messages as read.

**Request Body:**
\`\`\`json
{
  "requestId": "uuid"
}
\`\`\`

### Ratings

#### GET `/api/ratings`

Get ratings for a user.

**Query Parameters:**
- `userId`: UUID of the user

**Response:**
\`\`\`json
{
  "ratings": [
    {
      "id": "uuid",
      "rater_id": "uuid",
      "rated_user_id": "uuid",
      "transaction_id": "uuid",
      "rating": 5,
      "review": "Great experience!",
      "created_at": "2025-01-01T00:00:00Z",
      "rater": { /* user details */ }
    }
  ],
  "average": 4.8,
  "count": 10
}
\`\`\`

#### POST `/api/ratings`

Submit a rating.

**Request Body:**
\`\`\`json
{
  "transactionId": "uuid",
  "ratedUserId": "uuid",
  "rating": 5,
  "review": "Great experience!"
}
\`\`\`

### Videos

#### GET `/api/videos`

Get videos (all verified or user's own).

**Query Parameters:**
- `userId` (optional): Filter by user ID

**Response:**
\`\`\`json
{
  "videos": [
    {
      "id": "uuid",
      "title": "Tutorial Video",
      "description": "How to...",
      "video_url": "https://...",
      "thumbnail_url": "https://...",
      "category": "Technology",
      "duration": 300,
      "views": 100,
      "is_verified": true,
      "user_id": "uuid",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

#### POST `/api/videos`

Upload a new video.

**Request Body:**
\`\`\`json
{
  "title": "Tutorial Video",
  "description": "How to...",
  "videoUrl": "https://...",
  "thumbnailUrl": "https://...",
  "category": "Technology",
  "duration": 300
}
\`\`\`

### Admin Endpoints

All admin endpoints require `is_admin = true` in the user's profile.

#### GET `/api/admin/stats`

Get platform statistics.

**Response:**
\`\`\`json
{
  "totalUsers": 100,
  "totalSkills": 50,
  "totalTransactions": 200,
  "totalVideos": 75,
  "pendingSkills": 5,
  "pendingVideos": 3
}
\`\`\`

#### GET `/api/admin/users`

Get all users with statistics.

**Response:**
\`\`\`json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "time_balance": 10,
      "total_earned": 25,
      "total_spent": 15,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

#### GET `/api/admin/skills`

Get all skills pending verification.

**Response:**
\`\`\`json
{
  "skills": [
    {
      "id": "uuid",
      "title": "Web Development",
      "certificate_url": "https://...",
      "certificate_issuer": "Other",
      "certificate_id": "ABC123",
      "verification_status": "pending_review",
      "user": { /* user details */ }
    }
  ]
}
\`\`\`

#### PUT `/api/admin/skills`

Verify or reject a skill.

**Request Body:**
\`\`\`json
{
  "skillId": "uuid",
  "action": "verify" // or "reject"
}
\`\`\`

#### GET `/api/admin/videos`

Get all videos pending verification.

#### PUT `/api/admin/videos`

Verify or reject a video.

**Request Body:**
\`\`\`json
{
  "videoId": "uuid",
  "action": "verify", // or "reject"
  "notes": "Optional verification notes"
}
\`\`\`

## Error Responses

All endpoints return errors in the following format:

\`\`\`json
{
  "error": "Error message description"
}
\`\`\`

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error
