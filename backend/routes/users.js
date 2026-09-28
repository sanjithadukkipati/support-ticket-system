const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * GET /api/users
 * Returns list of users/agents for assignment dropdowns
 * Protected: Agent only
 */
router.get('/', authenticate, requireRole('agent'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, role FROM users ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

module.exports = router;
