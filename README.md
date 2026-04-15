# Users REST API

A production-grade REST API for managing users with persistent JSON file storage.

## Features

- Full CRUD operations for Users
- Data persistence using local JSON file (db.json)
- Comprehensive input validation
- Search/filter functionality
- Statistics endpoint
- Status toggle endpoint

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

### Create User
```
POST /users
```
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

## Data Storage

Data is stored in `db.json` in the project root. The file is created automatically on first request if it doesn't exist.