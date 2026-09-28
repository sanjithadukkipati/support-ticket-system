const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// All ticket routes require authentication
router.use(authenticate);

/**
 * POST /api/tickets
 * Create a new support ticket (Customer)
 */
router.post('/', async (req, res) => {
  const { subject, description, priority } = req.body;

  if (!subject || subject.trim() === '') {
    return res.status(400).json({ error: 'Subject is required' });
  }

  const validPriorities = ['low', 'medium', 'high'];
  const ticketPriority = validPriorities.includes(priority) ? priority : 'medium';

  try {
    const [result] = await pool.execute(
      'INSERT INTO tickets (user_id, subject, description, priority, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, subject.trim(), description || '', ticketPriority, 'open']
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Ticket created successfully'
    });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

/**
 * GET /api/tickets
 * Get tickets list.
 * - Customer: returns only own tickets
 * - Agent: returns all tickets (with customer & assignee info), supports filtering by status/priority
 */
router.get('/', async (req, res) => {
  const { status, priority } = req.query;

  try {
    if (req.user.role === 'agent') {
      let sql = `
        SELECT 
          t.id, t.subject, t.description, t.priority, t.status, 
          t.user_id, t.assigned_to, t.created_at, t.updated_at,
          u.name AS customer_name, u.email AS customer_email,
          a.name AS assignee_name
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN users a ON t.assigned_to = a.id
      `;
      const params = [];
      const whereClauses = [];

      if (status) {
        whereClauses.push('t.status = ?');
        params.push(status);
      }
      if (priority) {
        whereClauses.push('t.priority = ?');
        params.push(priority);
      }

      if (whereClauses.length > 0) {
        sql += ' WHERE ' + whereClauses.join(' AND ');
      }

      sql += ' ORDER BY t.created_at DESC';

      const [rows] = await pool.execute(sql, params);
      return res.json(rows);
    } else {
      // Customer view
      const sql = `
        SELECT 
          t.id, t.subject, t.description, t.priority, t.status, 
          t.user_id, t.assigned_to, t.created_at, t.updated_at,
          a.name AS assignee_name
        FROM tickets t
        LEFT JOIN users a ON t.assigned_to = a.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
      `;
      const [rows] = await pool.execute(sql, [req.user.id]);
      return res.json(rows);
    }
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to retrieve tickets' });
  }
});

/**
 * GET /api/tickets/:id
 * Get single ticket details. Includes ownership verification.
 */
router.get('/:id', async (req, res) => {
  const ticketId = req.params.id;

  try {
    const sql = `
      SELECT 
        t.id, t.subject, t.description, t.priority, t.status, 
        t.user_id, t.assigned_to, t.created_at, t.updated_at,
        u.name AS customer_name, u.email AS customer_email,
        a.name AS assignee_name
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = ?
    `;

    const [rows] = await pool.execute(sql, [ticketId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = rows[0];

    // Ownership check: customer can only view their own ticket
    if (req.user.role !== 'agent' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this ticket' });
    }

    res.json(ticket);
  } catch (err) {
    console.error('Error fetching ticket by ID:', err);
    res.status(500).json({ error: 'Failed to retrieve ticket details' });
  }
});

/**
 * PUT /api/tickets/:id
 * Update ticket status, priority, or assignee (Agent only)
 */
router.put('/:id', requireRole('agent'), async (req, res) => {
  const ticketId = req.params.id;
  const { status, priority, assigned_to } = req.body;

  try {
    const [existing] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const currentTicket = existing[0];
    const newStatus = status || currentTicket.status;
    const newPriority = priority || currentTicket.priority;
    const newAssignee = assigned_to !== undefined ? (assigned_to ? parseInt(assigned_to, 10) : null) : currentTicket.assigned_to;

    await pool.execute(
      'UPDATE tickets SET status = ?, priority = ?, assigned_to = ? WHERE id = ?',
      [newStatus, newPriority, newAssignee, ticketId]
    );

    res.json({ message: 'Ticket updated successfully' });
  } catch (err) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

/**
 * GET /api/tickets/:id/comments
 * Fetch comments for a ticket (Owner customer or Agent)
 */
router.get('/:id/comments', async (req, res) => {
  const ticketId = req.params.id;

  try {
    // Verify ticket exists & check ownership
    const [tRows] = await pool.execute('SELECT user_id FROM tickets WHERE id = ?', [ticketId]);
    if (!tRows || tRows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (req.user.role !== 'agent' && tRows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Cannot access comments for this ticket' });
    }

    const sql = `
      SELECT 
        c.id, c.ticket_id, c.user_id, c.comment, c.created_at,
        u.name AS user_name, u.role AS user_role
      FROM ticket_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.ticket_id = ?
      ORDER BY c.created_at ASC
    `;

    const [comments] = await pool.execute(sql, [ticketId]);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to retrieve ticket comments' });
  }
});

/**
 * POST /api/tickets/:id/comments
 * Add a comment to a ticket (Owner customer or Agent)
 */
router.post('/:id/comments', async (req, res) => {
  const ticketId = req.params.id;
  const { comment } = req.body;

  if (!comment || comment.trim() === '') {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    // Verify ticket exists & check ownership
    const [tRows] = await pool.execute('SELECT user_id FROM tickets WHERE id = ?', [ticketId]);
    if (!tRows || tRows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (req.user.role !== 'agent' && tRows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Cannot add comment to this ticket' });
    }

    const [result] = await pool.execute(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [ticketId, req.user.id, comment.trim()]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Comment added successfully'
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

module.exports = router;
