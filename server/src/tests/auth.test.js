const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  const user = { email: 'test@fch.com', password: 'password123', name: 'Test User' };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(user);
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(user.email);
      expect(res.body.access).toBeDefined();
    });
    it('should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send(user);
      const res = await request(app).post('/api/auth/register').send(user);
      expect(res.status).toBe(409);
    });
    it('should reject weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...user, password: '123' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await request(app).post('/api/auth/register').send(user);
      const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
      expect(res.status).toBe(200);
      expect(res.body.access).toBeDefined();
    });
    it('should reject invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'wrong' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
