const request = require('supertest');
const app = require('../server');

describe('Tickets API & Authorization Integration Tests', () => {
  let customerToken = '';
  let customer2Token = '';
  let agentToken = '';
  let createdTicketId = null;

  beforeAll(async () => {
    // Obtain JWT tokens for testing
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'password123' });
    customerToken = custRes.body.token;

    const cust2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer2@example.com', password: 'password123' });
    customer2Token = cust2Res.body.token;

    const agentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'agent@example.com', password: 'agentpass123' });
    agentToken = agentRes.body.token;
  });

  it('GET /api/tickets - should reject unauthenticated request (401)', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/tickets - customer creates a ticket (201)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        subject: 'API Test Ticket',
        description: 'Testing ticket creation via Jest & Supertest',
        priority: 'high'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdTicketId = res.body.id;
  });

  it('GET /api/tickets/:id - customer can view their own ticket (200)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${createdTicketId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('subject', 'API Test Ticket');
  });

  it('GET /api/tickets/:id - customer CANNOT view another user ticket (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${createdTicketId}`)
      .set('Authorization', `Bearer ${customer2Token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/tickets/:id - returns 404 for non-existent ticket ID', async () => {
    const res = await request(app)
      .get('/api/tickets/999999')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Ticket not found');
  });

  it('PUT /api/tickets/:id - customer CANNOT update ticket status (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/tickets/${createdTicketId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'closed' });

    expect(res.statusCode).toBe(403);
  });

  it('PUT /api/tickets/:id - agent CAN update ticket status & priority (200)', async () => {
    const res = await request(app)
      .put(`/api/tickets/${createdTicketId}`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'in_progress', priority: 'medium', assigned_to: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Ticket updated successfully');
  });

  it('POST /api/tickets/:id/comments - customer adds comment to ticket (201)', async () => {
    const res = await request(app)
      .post(`/api/tickets/${createdTicketId}/comments`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ comment: 'Adding a follow-up comment via automated test.' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/tickets/:id/comments - fetches comment thread (200)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${createdTicketId}/comments`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
