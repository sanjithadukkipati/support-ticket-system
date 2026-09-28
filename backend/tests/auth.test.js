const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints API Integration Tests', () => {

  it('POST /api/auth/login - should reject invalid credentials (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('POST /api/auth/login - should authenticate valid customer (200)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'customer');
  });

  it('POST /api/auth/login - should authenticate valid agent (200)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'agent@example.com', password: 'agentpass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'agent');
  });

  it('POST /api/auth/register - should register a new customer (201)', async () => {
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New Test User',
        email: uniqueEmail,
        password: 'securepassword123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('email', uniqueEmail);
  });

  it('POST /api/auth/register - should reject duplicate email (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Alice',
        email: 'customer@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
