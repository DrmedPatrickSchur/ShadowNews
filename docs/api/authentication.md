<!--
============================================================================
ShadowNews - Authentication API Documentation
============================================================================

Comprehensive documentation for ShadowNews authentication system, covering
JWT-based authentication, token management, and secure user verification.

Purpose:
- Define authentication endpoints and security protocols
- Document JWT token lifecycle and refresh mechanisms
- Provide integration examples for frontend developers
- Establish security best practices and error handling

Target Audience:
- Frontend developers implementing authentication
- Backend developers maintaining auth services
- Security auditors reviewing authentication flows
- DevOps engineers configuring authentication systems

Coverage:
- User registration and email verification
- Login/logout flows with JWT tokens
- Token refresh and rotation strategies
- Password reset and recovery mechanisms
- Email-based authentication workflows
- Security considerations and best practices

Last Updated: 2025-07-27
Version: 1.0.0
============================================================================
-->

# Authentication API Documentation\n\n# Authentication API Documentation

## Overview

Shadownews uses JWT-based authentication with refresh tokens. All authenticated endpoints require a valid access token in the Authorization header.

## Base URL

```
https://api.shadownews.com/v1
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    participant Email Service
    
    Client->>API: POST /auth/register
    API->>Database: Create user
    API->>Email Service: Send verification email
    API-->>Client: 201 Created
    
    Client->>API: GET /auth/verify/:token
    API->>Database: Update user.verified
    API-->>Client: 200 OK
    
    Client->>API: POST /auth/login
    API->>Database: Validate credentials
    API-->>Client: 200 OK + tokens
    
    Client->>API: GET /posts (with token)
    API->>API: Validate JWT
    API-->>Client: 200 OK + data
```

## Endpoints

### Register New User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "acceptedTerms": true
}
```

**Response**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe",
    "shadownewsEmail": "johndoe@shadownews.community"
  }
}
```

**Error Responses**
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email or username already exists

### Email Verification

```http
GET /auth/verify/:token
```

**Response**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "email": "user@example.com",
    "verified": true
  }
}
```

**Error Responses**
- `400 Bad Request` - Invalid or expired token
- `404 Not Found` - Token not found

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "shadownewsEmail": "johndoe@shadownews.community",
      "karma": 150,
      "role": "user",
      "verified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

**Error Responses**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account not verified

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Error Responses**
- `401 Unauthorized` - Invalid refresh token
- `403 Forbidden` - Refresh token expired

### Logout

```http
POST /auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Request Password Reset

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Error Responses**
- `404 Not Found` - Email not found

### Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses**
- `400 Bad Request` - Invalid or expired token
- `422 Unprocessable Entity` - Invalid password format

### Get Current User

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe",
    "shadownewsEmail": "johndoe@shadownews.community",
    "karma": 150,
    "role": "user",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "preferences": {
      "emailDigest": true,
      "emailFrequency": "daily",
      "publicProfile": true,
      "showEmail": false
    },
    "repositories": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "AI Research",
        "emailCount": 1247
      }
    ]
  }
}
```

### Update Password

```http
PUT /auth/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses**
- `401 Unauthorized` - Current password incorrect
- `422 Unprocessable Entity` - Invalid password format

### Enable Two-Factor Authentication

```http
POST /auth/2fa/enable
Authorization: Bearer <access_token>
```

**Response**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "backupCodes": [
      "a1b2c3d4e5",
      "f6g7h8i9j0",
      "k1l2m3n4o5"
    ]
  }
}
```

### Verify Two-Factor Authentication

```http
POST /auth/2fa/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "123456"
}
```

**Response**
```json
{
  "success": true,
  "message": "Two-factor authentication enabled successfully"
}
```

### Login with 2FA

```http
POST /auth/login/2fa
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "totpToken": "123456"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "tokens": { /* tokens object */ }
  }
}
```

## Headers

### Authorization Header

All authenticated endpoints require the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Rate Limiting Headers

All responses include rate limiting information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642082400
```

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Email or password incorrect |
| `ACCOUNT_NOT_VERIFIED` | Email verification required |
| `TOKEN_EXPIRED` | JWT or refresh token expired |
| `TOKEN_INVALID` | Malformed or invalid token |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `VALIDATION_ERROR` | Input validation failed |
| `ACCOUNT_LOCKED` | Account temporarily locked |
| `2FA_REQUIRED` | Two-factor authentication required |
| `2FA_INVALID` | Invalid 2FA token |

## Token Expiration

- **Access Token**: 1 hour (3600 seconds)
- **Refresh Token**: 30 days
- **Email Verification Token**: 24 hours
- **Password Reset Token**: 1 hour

## Security Considerations

1. **Password Requirements**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

2. **Account Security**:
   - Account locked after 5 failed login attempts (15 minutes)
   - Email verification required for new accounts
   - Optional two-factor authentication
   - Secure password reset flow

3. **Token Security**:
   - Tokens signed with RS256 algorithm
   - Refresh tokens stored in httpOnly cookies
   - Access tokens should be stored in memory
   - Implement token rotation on refresh

4. **CORS Configuration**:
   ```javascript
   {
     origin: ['https://shadownews.com'],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }
   ```

## Example Implementation

### Client-Side (React)

```javascript
// Login request
const login = async (email, password) => {
  const response = await fetch('https://api.shadownews.com/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens securely
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    // Store refresh token in httpOnly cookie (handled by server)
  }
  
  return data;
};

// Authenticated request
const fetchPosts = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('https://api.shadownews.com/v1/posts', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh it
    await refreshToken();
    return fetchPosts(); // Retry
  }
  
  return response.json();
};
```

### Server-Side Middleware

```javascript
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Access token required'
      }
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Invalid or expired token'
      }
    });
  }
};
```