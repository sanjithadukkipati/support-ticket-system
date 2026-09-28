const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_support_tickets_2026';

/**
 * POST /api/auth/register
 * Register a new user (customer or agent)
 */
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email address format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const userRole = role === 'agent' ? 'agent' : 'customer';

  try {
    // Check if user already exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Could not create user: Email is already registered' });
    }

    // Hash password with salt rounds = 10
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [cleanName, cleanEmail, password_hash, userRole]
    );

    res.status(201).json({
      message: 'User registered successfully',
      id: result.insertId,
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: userRole
      }
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(400).json({ error: 'Could not create user account' });
  }
});

/**
 * POST /api/auth/login
 * User authentication & JWT token generation
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. User email not found.' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password.trim(), user.password_hash) || await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Password does not match.' });
    }

    // Generate JWT token with 24h expiration
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile details
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

module.exports = router;
