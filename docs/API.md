# Sparkie API Documentation

## Base URL
```
Development: http://localhost:8000/api/v1
Production:  https://your-api-domain.com/api/v1
```

## Authentication

All endpoints (except auth) require Bearer token authentication:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "bee_lover",
  "email": "bee@example.com",
  "password": "secure_password123"
}

Response (201 Created):
{
  "id": 1,
  "username": "bee_lover",
  "email": "bee@example.com",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

### Login
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=bee_lover&password=secure_password123

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response (200 OK):
{
  "id": 1,
  "username": "bee_lover",
  "email": "bee@example.com",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

---

## Chat Endpoints

### Send Message (Non-streaming)
```http
POST /chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Tell me about Polleneer!",
  "conversation_id": null,
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1000
}

Response (200 OK):
{
  "conversation_id": 1,
  "message": "Ah, Polleneer, our beautiful hive of ideas! 🐝✨..."
}
```

### Send Message (Streaming)
```http
POST /chat/stream
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Write me a poem about bees",
  "stream": true
}

Response: Text stream with SSE format
data: {"chunk": "In", "done": false}
data: {"chunk": " the", "done": false}
data: {"chunk": " garden", "done": false}
...
data: {"chunk": "", "done": true, "conversation_id": 1}
```

### Get Conversations
```http
GET /chat/conversations?limit=20&offset=0
Authorization: Bearer <token>

Response (200 OK):
[
  {
    "id": 1,
    "title": "Chat with Sparkie",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T01:00:00",
    "message_count": 10
  }
]
```

---

## 🎨 Image Generation (FREE!)

Sparkie includes **free image generation** powered by ModelScope Z-Image-Turbo!

### Setup

1. Get free API token from https://modelscope.cn/my
2. Add to `.env`: `MODELSCOPE_API_KEY=your_token`

### Generate Image
```http
POST /generate/image
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "A beautiful queen bee with golden crown",
  "size": "1024x1024",    // optional: 512x512, 768x768, 1024x1024, 1024x768, 768x1024
  "steps": 9              // optional: 1-50, default 9
}

Response (200 OK):
{
  "success": true,
  "url": "https://...",
  "data_url": "data:image/png;base64,...",
  "message": "Image generated successfully! 🐝✨",
  "metadata": {
    "size": "1024x1024",
    "steps": 9,
    "model": "Tongyi-MAI/Z-Image-Turbo",
    "original_prompt": "A beautiful queen bee with golden crown",
    "enhanced_prompt": "A beautiful queen bee with golden crown, in elegant artistic style..."
  }
}
```

### Error Response (429 Rate Limit)
```json
{
  "success": false,
  "error": "Rate limited",
  "message": "ModelScope API rate limit exceeded. Please try again later."
}
```

### Get Available Sizes
```http
GET /generate/image/sizes
Authorization: Bearer <token>

Response (200 OK):
{
  "sizes": [
    {"value": "512x512", "label": "Square (512x512)", "description": "Standard square"},
    {"value": "768x768", "label": "Square HD (768x768)", "description": "Higher resolution"},
    {"value": "1024x1024", "label": "Square Ultra (1024x1024)", "description": "High resolution, default"},
    {"value": "1024x768", "label": "Landscape (1024x768)", "description": "Widescreen format"},
    {"value": "768x1024", "label": "Portrait (768x1024)", "description": "Vertical format"}
  ],
  "default": "1024x1024",
  "recommended": "1024x1024"
}
```

### Check Service Status
```http
GET /generate/image/status
Authorization: Bearer <token>

Response (200 OK):
{
  "service": "ModelScope Z-Image-Turbo",
  "status": "available",
  "api_key_configured": true,
  "model": "Tongyi-MAI/Z-Image-Turbo",
  "free_tier": true,
  "setup_url": "https://modelscope.cn/my",
  "message": "Ready to generate beautiful images!"
}
```

### Auto-Detection in Chat

The frontend automatically detects image generation requests from phrases like:
- "Generate an image of..."
- "Show me..."
- "Draw..."
- "Create a picture of..."

Just ask naturally and Sparkie will create the image!

---

## Health Check

### Get Health Status
```http
GET /health

Response (200 OK):
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "Sparkie API",
  "database": "healthy"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "detail": "Detailed description",
  "code": "ERROR_CODE"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error
