# CampusConnect API Documentation

## Overview

This document describes the complete API integration between the React frontend and Spring Boot backend.

## Base URLs

- **Development (with nginx)**: `http://localhost/api`
- **Development (direct)**: `http://localhost:8080`
- **Frontend Dev Server**: `http://localhost:5173`

## Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The frontend automatically attaches the token from localStorage for all requests.

---

## API Endpoints

### 1. Club Registration

**POST** `/clubs/register`

**Access**: Public

**Request Body**:

```json
{
  "clubName": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Success Response** (200):

```json
{
  "clubId": "string",
  "clubName": "string",
  "email": "string",
  "token": "string (JWT)"
}
```

**Error Responses**:

- `400`: `{"message": "Email already registered"}`
- `400`: `{"message": "Validation failed", "errors": "..."}`

**Frontend Usage**: `ClubAuth.jsx` - Registration form

---

### 2. Club Login

**POST** `/clubs/login`

**Access**: Public

**Request Body**:

```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Success Response** (200):

```json
{
  "clubId": "string",
  "clubName": "string",
  "email": "string",
  "token": "string (JWT)"
}
```

**Error Responses**:

- `401`: `{"message": "Invalid credentials"}`
- `400`: `{"message": "Validation failed", "errors": "..."}`

**Frontend Usage**: `ClubAuth.jsx` - Login form

---

### 3. List All Events

**GET** `/events`

**Access**: Public

**Success Response** (200):

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "date": "string",
    "time": "string",
    "venue": "string",
    "capacity": number,
    "clubId": "string",
    "clubName": "string"
  }
]
```

**Frontend Usage**: `Events.jsx` - Events listing page

---

### 4. Get Event Details

**GET** `/events/{id}`

**Access**: Public

**Success Response** (200):

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "date": "string",
  "time": "string",
  "venue": "string",
  "capacity": number,
  "clubId": "string",
  "clubName": "string"
}
```

**Error Responses**:

- `404`: Event not found (empty response)

**Frontend Usage**: `EventDetails.jsx` - Event details page

---

### 5. Create Event

**POST** `/events/create`

**Access**: Authenticated (Club only)

**Request Body**:

```json
{
  "name": "string (required)",
  "description": "string (required)",
  "date": "string (required, YYYY-MM-DD)",
  "time": "string (required, HH:MM)",
  "venue": "string (required)",
  "capacity": number (required, min: 1)
}
```

**Note**: `clubId` is automatically extracted from JWT token. Do NOT send it in the request body.

**Success Response** (200):

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "date": "string",
  "time": "string",
  "venue": "string",
  "capacity": number,
  "clubId": "string",
  "clubName": "string"
}
```

**Error Responses**:

- `401`: `{"message": "Unauthorized: missing club identity"}`
- `400`: `{"message": "Invalid clubId"}`
- `400`: `{"message": "Validation failed", "errors": "..."}`

**Frontend Usage**: `CreateEvent.jsx` - Event creation form

---

### 6. Book Ticket

**POST** `/tickets/book`

**Access**: Public

**Request Body**:

```json
{
  "eventId": "string (required)",
  "studentName": "string (required)",
  "email": "string (required, valid email)"
}
```

**Success Response** (200):

```json
{
  "id": "string",
  "eventId": "string",
  "eventName": "string",
  "studentName": "string",
  "email": "string",
  "bookingTime": "string (ISO 8601)"
}
```

**Error Responses**:

- `400`: `{"message": "Invalid eventId"}`
- `400`: `{"message": "Event is fully booked"}`
- `400`: `{"message": "Validation failed", "errors": "..."}`

**Frontend Usage**: `EventDetails.jsx` - Ticket booking form

---

### 7. Export Tickets (Excel)

**GET** `/tickets/export/{eventId}`

**Access**: Authenticated (Club only)

**Success Response** (200):

- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Binary Excel file download
- Filename: `event-{eventName}-tickets.xlsx`

**Error Responses**:

- `401`: Unauthorized (no JWT token)
- `404`: Event not found
- `500`: Export generation failed

**Frontend Usage**: `EventDetails.jsx` - Export button (only visible when logged in)

---

## Frontend API Client Configuration

### Axios Instance (`api.js`)

```javascript
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});
```

### JWT Token Management

- **Storage**: `localStorage.getItem('token')`
- **Automatic Attachment**: Request interceptor adds `Authorization: Bearer {token}` header
- **401 Handling**: Response interceptor clears token and redirects to login

### Error Handling Pattern

```javascript
try {
  const res = await api.post("/endpoint", data);
  // Handle success
} catch (err) {
  const errorMsg =
    err.response?.data?.message || err.response?.data || "Default error";
  setMsg(String(errorMsg));
}
```

---

## Security Configuration

### Public Endpoints

- `/clubs/register`
- `/clubs/login`
- `/events` (GET)
- `/events/{id}` (GET)
- `/tickets/book` (POST)

### Protected Endpoints (Requires JWT)

- `/events/create` (POST)
- `/tickets/export/{eventId}` (GET)

### JWT Token Structure

- **Subject**: Club ID
- **Issued At**: Current timestamp
- **Expiration**: 24 hours from issue
- **Signature**: HMAC-SHA256 with secret key

---

## CORS Configuration

Backend allows all origins in development:

```java
@CrossOrigin(origins = "*", allowedHeaders = "*")
```

nginx proxy forwards CORS headers:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
```

---

## Common Integration Patterns

### 1. User Registration/Login Flow

```
Frontend (ClubAuth.jsx)
  → POST /clubs/register or /clubs/login
  → Receive {clubId, clubName, email, token}
  → Save to localStorage
  → Call setAuthToken(token)
  → Navigate to /create-event
```

### 2. Event Creation Flow

```
Frontend (CreateEvent.jsx)
  → Check localStorage for club data
  → POST /events/create with JWT in header
  → Backend extracts clubId from JWT
  → Receive created event
  → Navigate to /events/{eventId}
```

### 3. Ticket Booking Flow

```
Frontend (EventDetails.jsx)
  → Student fills form (no auth required)
  → POST /tickets/book
  → Receive ticket confirmation
  → Display success message
```

### 4. Excel Export Flow

```
Frontend (EventDetails.jsx)
  → Check if JWT token exists
  → Show export button only to logged-in clubs
  → GET /tickets/export/{eventId} with responseType: 'blob'
  → Extract filename from Content-Disposition header
  → Trigger browser download
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "message": "Human-readable error message"
}
```

Validation errors include additional details:

```json
{
  "message": "Validation failed",
  "errors": "{field1=error1, field2=error2}"
}
```

---

## Environment Variables

### Frontend (.env.development)

```
VITE_API_BASE_URL=http://localhost/api
```

### Backend (application.properties)

```
spring.data.mongodb.uri=mongodb+srv://...
jwt.secret=your-secret-key-here
server.port=8080
```

---

## Testing Integration

### Manual Testing Checklist

1. ✅ Club Registration → Receive token → Redirected to create event
2. ✅ Club Login → Receive token → Redirected to create event
3. ✅ Create Event (with JWT) → Event created with clubId from token
4. ✅ List Events → All events displayed
5. ✅ View Event Details → Event details loaded
6. ✅ Book Ticket → Ticket created, form cleared
7. ✅ Export Tickets (with JWT) → Excel file downloaded
8. ✅ 401 Errors → Token cleared, user redirected to login

### API Contract Validation

- ✅ All error responses use `{"message": "..."}` format
- ✅ All controllers return consistent JSON structures
- ✅ Frontend error handling extracts `.message` field
- ✅ JWT automatically attached to authenticated requests
- ✅ clubId not sent by frontend (extracted from JWT)

---

## Production Deployment

### nginx Reverse Proxy

```nginx
location /api/ {
    proxy_pass http://localhost:8080/;
    proxy_set_header Authorization $http_authorization;
}

location / {
    root /path/to/frontend/dist;
    try_files $uri /index.html;
}
```

### Build Commands

```bash
# Backend
cd backend
./mvnw clean package
java -jar target/campus-connect.jar

# Frontend
cd frontend
npm run build
# Serve dist/ folder through nginx
```

---

## Troubleshooting

### Issue: 401 Unauthorized on /events/create

- **Cause**: JWT token missing or invalid
- **Fix**: Check localStorage for token, verify token in request headers

### Issue: clubId validation error

- **Cause**: Frontend sending clubId in request body
- **Fix**: Remove clubId from request payload (use JWT instead)

### Issue: Error messages not displaying

- **Cause**: Backend returning plain strings instead of JSON
- **Fix**: All error responses now use `Map.of("message", "...")` format

### Issue: Export button not working

- **Cause**: Missing JWT token or 401 response
- **Fix**: Verify token exists, check SecurityConfig permits `/tickets/export/**`

---

## API Integration Status

### ✅ Completed

- All endpoints return consistent JSON error format
- Frontend error handling extracts `.message` field
- JWT authentication flow end-to-end
- Global exception handler for validation errors
- CORS configuration for cross-origin requests
- nginx reverse proxy configuration

### 🎯 Production Ready

The API integration is **fully compatible** and production-ready. All endpoints are tested and follow RESTful conventions with proper JWT authentication.
