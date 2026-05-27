import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { login, register, getMe } from '../../controllers/authController';
import User from '../../models/User';
import * as expressValidator from 'express-validator';
import jwt from 'jsonwebtoken';

vi.mock('../../models/User');
vi.mock('express-validator', () => ({
  validationResult: vi.fn(),
}));

describe('Auth Controller Integration', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
    vi.mocked(expressValidator.validationResult).mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as any);
  });

  describe('login', () => {
    it('should return 401 for invalid credentials', async () => {
      mockRequest.body = { email: 'test@test.com', password: 'wrong' };
      vi.mocked(User.findOne).mockResolvedValue(null);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password',
      });
    });

    it('should return 200 and token for valid credentials', async () => {
      mockRequest.body = { email: 'test@test.com', password: 'password123' };
      const mockUser = {
        _id: 'user123',
        username: 'tester',
        email: 'test@test.com',
        comparePassword: vi.fn().mockResolvedValue(true),
      };
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      const signSpy = vi.spyOn(jwt, 'sign').mockReturnValue('mocked-token' as any);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          data: expect.objectContaining({ token: 'mocked-token' }),
        })
      );
    });
  });

  describe('register', () => {
    it('should return 400 if user exists', async () => {
      mockRequest.body = { username: 'test', email: 'test@test.com', password: 'password123' };
      vi.mocked(User.findOne).mockResolvedValue({ _id: 'existing' } as any);

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email or username already exists',
      });
    });

    it('should create user and return 201', async () => {
      mockRequest.body = { username: 'newuser', email: 'new@test.com', password: 'password123' };
      vi.mocked(User.findOne).mockResolvedValue(null);
      const mockUser = {
        _id: 'newuser123',
        username: 'newuser',
        email: 'new@test.com',
      };
      vi.mocked(User.create).mockResolvedValue(mockUser as any);
      vi.spyOn(jwt, 'sign').mockReturnValue('mocked-token' as any);

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
          data: expect.objectContaining({ token: 'mocked-token' }),
        })
      );
    });
  });
});
