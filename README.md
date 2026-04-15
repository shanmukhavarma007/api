# Users REST API

A simple REST API for managing Users resource built with Node.js and Express.

## Running the API

```bash
npm install
node index.js
```

The server will start on port 3000.

## Endpoints

### Health Check

**GET /** - API health check

- Returns: `{ "message": "API is running 🚀" }`

---

### Create User

**POST /users** - Create a new user

- Required Fields: `name`, `email`
- Optional Fields: `role` (defaults to "user")

**Sample Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

**Response (201):**
```json
{
  "id": "uuid-generated-id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Get All Users

**GET /users** - Get all users

- Returns: Array of all users

**Response (200):**
```json
[
  {
    "id": "uuid-generated-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get User by ID

**GET /users/:id** - Get a single user by ID

- Replace `:id` with the user's UUID

**Response (200):**
```json
{
  "id": "uuid-generated-id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "User not found",
  "message": "User with id <id> not found"
}
```

---

### Fully Update User

**PUT /users/:id** - Fully update a user (replaces all fields)

- Required Fields: `name`, `email`
- Optional Fields: `role`

**Sample Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "user"
}
```

**Response (200):**
```json
{
  "id": "uuid-generated-id",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (404):** Same as GET /users/:id

---

### Partially Update User

**PATCH /users/:id** - Partially update a user

- Only provided fields are updated

**Sample Request Body:**
```json
{
  "name": "John Patched"
}
```

**Response (200):**
```json
{
  "id": "uuid-generated-id",
  "name": "John Patched",
  "email": "john@example.com",
  "role": "admin",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (404):** Same as GET /users/:id

---

### Delete User

**DELETE /users/:id** - Delete a user

**Response (200):**
```json
{
  "id": "uuid-generated-id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (404):** Same as GET /users/:id

---

## Error Responses

- **400 Bad Request**: Missing required fields
- **404 Not Found**: User not found

```json
{
  "error": "Error type",
  "message": "Error description"
}
```