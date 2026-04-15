const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API is running 🚀",
    status: "OK",
    endpoints: {
      health: "GET /",
      createUser: "POST /users",
      getAllUsers: "GET /users",
      getUserById: "GET /users/:id",
      updateUser: "PUT /users/:id",
      partialUpdate: "PATCH /users/:id",
      deleteUser: "DELETE /users/:id"
    }
  });
});

const DB_PATH = path.join(__dirname, 'db.json');

function readUsers() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

const VALID_ROLES = ['admin', 'user', 'moderator'];
const VALID_STATUSES = ['active', 'inactive'];

function validateUser(data, isPartial = false) {
  const errors = {};

  if (!isPartial) {
    if (!data.name || typeof data.name !== 'string') {
      errors.name = 'Name is required';
    } else if (data.name.length < 2 || data.name.length > 50) {
      errors.name = 'Name must be between 2 and 50 characters';
    } else if (/\d/.test(data.name)) {
      errors.name = 'Name cannot contain numbers';
    }

    if (!data.email || typeof data.email !== 'string') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (!data.phone || typeof data.phone !== 'string') {
      errors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(data.phone)) {
      errors.phone = 'Phone must be exactly 10 digits';
    }

    if (data.age === undefined || data.age === null) {
      errors.age = 'Age is required';
    } else if (typeof data.age !== 'number' || data.age < 1 || data.age > 120) {
      errors.age = 'Age must be between 1 and 120';
    }
  } else {
    if (data.name !== undefined) {
      if (data.name.length < 2 || data.name.length > 50) {
        errors.name = 'Name must be between 2 and 50 characters';
      } else if (/\d/.test(data.name)) {
        errors.name = 'Name cannot contain numbers';
      }
    }

    if (data.email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (data.phone !== undefined) {
      if (!/^\d{10}$/.test(data.phone)) {
        errors.phone = 'Phone must be exactly 10 digits';
      }
    }

    if (data.age !== undefined) {
      if (typeof data.age !== 'number' || data.age < 1 || data.age > 120) {
        errors.age = 'Age must be between 1 and 120';
      }
    }
  }

  if (data.role !== undefined) {
    if (!VALID_ROLES.includes(data.role)) {
      errors.role = `Role must be one of: ${VALID_ROLES.join(', ')}`;
    }
  }

  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
    }
  }

  return errors;
}

function checkEmailUniqueness(email, excludeId = null) {
  const users = readUsers();
  const existing = users.find(u => u.email === email && u.id !== excludeId);
  return !existing;
}

function checkPhoneUniqueness(phone, excludeId = null) {
  const users = readUsers();
  const existing = users.find(u => u.phone === phone && u.id !== excludeId);
  return !existing;
}

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/users', (req, res) => {
  const users = readUsers();
  const errors = validateUser(req.body, false);

  if (!checkEmailUniqueness(req.body.email)) {
    errors.email = 'Email already exists';
  }
  if (!checkPhoneUniqueness(req.body.phone)) {
    errors.phone = 'Phone already exists';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const now = new Date().toISOString();
  const user = {
    id: uuidv4(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    age: req.body.age,
    role: req.body.role || 'user',
    status: req.body.status || 'active',
    createdAt: now,
    updatedAt: now
  };

  users.push(user);
  writeUsers(users);

  res.status(201).json(user);
});

app.get('/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

app.get('/users/stats', (req, res) => {
  const users = readUsers();
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    roleCounts: {
      admin: users.filter(u => u.role === 'admin').length,
      user: users.filter(u => u.role === 'user').length,
      moderator: users.filter(u => u.role === 'moderator').length
    }
  };
  res.json(stats);
});

app.get('/users/search', (req, res) => {
  const users = readUsers();
  const { name, role, status } = req.query;

  let results = users;

  if (name) {
    results = results.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (role) {
    results = results.filter(u => u.role === role);
  }
  if (status) {
    results = results.filter(u => u.status === status);
  }

  res.json(results);
});

app.get('/users/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ errors: { id: 'User not found' } });
  }

  res.json(user);
});

app.put('/users/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ errors: { id: 'User not found' } });
  }

  const errors = validateUser(req.body, false);

  if (!checkEmailUniqueness(req.body.email, req.params.id)) {
    errors.email = 'Email already exists';
  }
  if (!checkPhoneUniqueness(req.body.phone, req.params.id)) {
    errors.phone = 'Phone already exists';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const now = new Date().toISOString();
  users[index] = {
    id: req.params.id,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    age: req.body.age,
    role: req.body.role,
    status: req.body.status,
    createdAt: users[index].createdAt,
    updatedAt: now
  };

  writeUsers(users);
  res.json(users[index]);
});

app.patch('/users/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ errors: { id: 'User not found' } });
  }

  const errors = validateUser(req.body, true);

  if (req.body.email && !checkEmailUniqueness(req.body.email, req.params.id)) {
    errors.email = 'Email already exists';
  }
  if (req.body.phone && !checkPhoneUniqueness(req.body.phone, req.params.id)) {
    errors.phone = 'Phone already exists';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const now = new Date().toISOString();
  if (req.body.name) users[index].name = req.body.name;
  if (req.body.email) users[index].email = req.body.email;
  if (req.body.phone) users[index].phone = req.body.phone;
  if (req.body.age !== undefined) users[index].age = req.body.age;
  if (req.body.role) users[index].role = req.body.role;
  if (req.body.status) users[index].status = req.body.status;
  users[index].updatedAt = now;

  writeUsers(users);
  res.json(users[index]);
});

app.patch('/users/:id/status', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ errors: { id: 'User not found' } });
  }

  const currentStatus = users[index].status;
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  users[index].status = newStatus;
  users[index].updatedAt = new Date().toISOString();

  writeUsers(users);
  res.json(users[index]);
});

app.delete('/users/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ errors: { id: 'User not found' } });
  }

  const deleted = users.splice(index, 1)[0];
  writeUsers(users);

  res.json(deleted);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});