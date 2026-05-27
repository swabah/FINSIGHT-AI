import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../server';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import { vi } from 'vitest';

vi.mock('../../models/User');

describe('API System Tests', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  describe('Auth Flow', () => {
    const testUser = {
      username: 'systemtestuser',
      email: 'systemtest@example.com',
      password: 'password123',
    };

    let token: string;

    it('should register a new user', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const mockUser = {
        _id: 'systemuser123',
        username: testUser.username,
        email: testUser.email,
        password_hash: testUser.password,
      };
      vi.mocked(User.create).mockResolvedValue(mockUser as any);
      const signSpy = vi.spyOn(jwt, 'sign').mockReturnValue('mocked-token-123' as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      
      token = res.body.data.token;
    });

    it('should login an existing user', async () => {
      const mockUser = {
        _id: 'systemuser123',
        username: testUser.username,
        email: testUser.email,
        comparePassword: vi.fn().mockResolvedValue(true),
      };
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail to access protected route without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should access protected route with valid token', async () => {
      vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'systemuser123' } as any);
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: 'systemuser123', email: testUser.email }),
      } as any);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
    });
  });
});
