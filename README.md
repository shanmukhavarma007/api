# Users REST API

A production-grade REST API for managing users with persistent JSON file storage and token-based authentication.

## Features

- Full CRUD operations for Users
- Data persistence using local JSON file (db.json)
- Comprehensive input validation
- Search/filter functionality
- Statistics endpoint
- Status toggle endpoint
- JWT-based authentication (register, login, protected routes)

## Quick Start

```bash
npm install
npm start
```

Server runs on `http://localhost:3000` (or PORT from environment)

## Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Register User
```
POST /auth/register
```
Create an account to get an authentication token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "password": "secret123"
}
```
- `email`: required, valid format, unique
- `name`: required
- `password`: required, min 6 characters

**Response:** 201 Created
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

### Login User
```
POST /auth/login
```
Login with email and password to get an authentication token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response:** 200 OK
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

### Get Current User
```
GET /auth/me
```
Get the currently authenticated user. Requires Bearer token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** 200 OK

---

## Authentication Required Endpoints

The following endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-token-here>
```

Without authentication, you will receive:
```json
{ "errors": { "auth": "Authentication required. Provide valid token." } }
```

### Create User
```
POST /users
```
**Requires Authentication**
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "age": 25,
  "role": "user",
  "status": "active"
}
```
- `name`: required, 2-50 chars, no numbers
- `email`: required, valid format, unique
- `phone`: required, exactly 10 digits
- `age`: required, number between 1-120
- `role`: optional, default "user" (admin|user|moderator)
- `status`: optional, default "active" (active|inactive)

**Response:** 201 Created

### Get All Users
```
GET /users
```
Returns array of all users.

### Get User by ID
```
GET /users/:id
```
**Response:** 200 OK or 404 Not Found

### Update User (Full)
```
PUT /users/:id
```
**Requires Authentication**
All fields required. Replaces entire user object.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "age": 26,
  "role": "admin",
  "status": "active"
}
```

### Update User (Partial)
```
PATCH /users/:id
```
**Requires Authentication**
Only provided fields are validated and updated.

**Request Body:**
```json
{
  "name": "John Smith"
}
```

### Delete User
```
DELETE /users/:id
```
**Requires Authentication**
**Response:** 200 OK with deleted user or 404 Not Found

### Search Users
```
GET /users/search?name=&role=&status=
```
Query parameters:
- `name`: filter by name (partial match, case-insensitive)
- `role`: filter by role (admin|user|moderator)
- `status`: filter by status (active|inactive)

Example: `GET /users/search?role=admin&status=active`

### Get Statistics
```
GET /users/stats
```
**Response:**
```json
{
  "total": 10,
  "active": 8,
  "inactive": 2,
  "roleCounts": {
    "admin": 2,
    "user": 7,
    "moderator": 1
  }
}
```

### Toggle User Status
```
PATCH /users/:id/status
```
**Requires Authentication**
Toggles between active/inactive.

**Response:** Updated user object

## Validation Errors

Validation errors return 400 Bad Request with structured error messages:

```json
{
  "errors": {
    "email": "Email already exists",
    "phone": "Phone must be exactly 10 digits",
    "age": "Age must be between 1 and 120",
    "name": "Name cannot contain numbers"
  }
}
```

## User Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | UUID | Auto | Generated automatically |
| name | string | Yes | 2-50 chars, no numbers |
| email | string | Yes | Valid format, unique |
| phone | string | Yes | Exactly 10 digits |
| age | number | Yes | 1-120 |
| role | enum | No | admin, user, moderator (default: user) |
| status | enum | No | active, inactive (default: active) |
| createdAt | timestamp | Auto | ISO 8601 |
| updatedAt | timestamp | Auto | ISO 8601, updates on change |

## Environment Variables

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for signing JWT tokens (default: a dev key - change in production!)
- `JWT_EXPIRES_IN`: Token expiration time (default: 24h)

## Data Storage

- `db.json`: User data (name, email, phone, age, role, status)
- `auth.json`: Authentication data (email, hashed password)

Both files are created automatically on first request.

## Testing with Postman

1. **Register**: `POST /auth/register` with email, name, password
2. **Login**: `POST /auth/login` to get a token
3. **Copy the token** from the response
4. **For protected endpoints**: Add header `Authorization: Bearer <token>`
5. POST, PUT, PATCH, DELETE requests now require the token