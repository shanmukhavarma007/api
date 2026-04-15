const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const users = [];

app.get('/', (req, res) => {
  res.json({ message: 'API is running 🚀' });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'name and email are required'
    });
  }

  const user = {
    id: uuidv4(),
    name,
    email,
    role: req.body.role || 'user',
    createdAt: new Date().toISOString()
  };

  users.push(user);
  res.status(201).json(user);
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: `User with id ${req.params.id} not found`
    });
  }

  res.json(user);
});

app.put('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      error: 'User not found',
      message: `User with id ${req.params.id} not found`
    });
  }

  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'name and email are required'
    });
  }

  users[index] = {
    id: req.params.id,
    name,
    email,
    role: role || users[index].role,
    createdAt: users[index].createdAt
  };

  res.json(users[index]);
});

app.patch('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      error: 'User not found',
      message: `User with id ${req.params.id} not found`
    });
  }

  const { name, email, role } = req.body;

  if (name) users[index].name = name;
  if (email) users[index].email = email;
  if (role) users[index].role = role;

  res.json(users[index]);
});

app.delete('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      error: 'User not found',
      message: `User with id ${req.params.id} not found`
    });
  }

  const deleted = users.splice(index, 1);
  res.json(deleted[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});