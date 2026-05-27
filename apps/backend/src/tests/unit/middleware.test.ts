import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { protect } from '../../middleware/auth';
import { errorHandler, notFound } from '../../middleware/errorHandler';
import jwt from 'jsonwebtoken';
import User from '../../models/User';

vi.mock('jsonwebtoken');
vi.mock('../../models/User');

describe('Middleware Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = vi.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      statusCode: 200,
    };
    vi.clearAllMocks();
  });

  describe('Auth Middleware - protect', () => {
    it('should return 401 if no authorization header is present', async () => {
      await protect(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, no token provided',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      mockRequest.headers = { authorization: 'Bearer invalidtoken' };
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('invalid token');
      });

      await protect(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, token failed',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next if token is valid and user exists', async () => {
      mockRequest.headers = { authorization: 'Bearer validtoken' };
      const decodedToken = { id: 'user123' };
      vi.mocked(jwt.verify).mockReturnValue(decodedToken as any);
      
      const mockUser = { _id: 'user123', email: 'test@example.com' };
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      await protect(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Error Handler Middleware', () => {
    it('notFound should create a 404 error and pass it to next', () => {
      mockRequest.originalUrl = '/test-url';
      
      notFound(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Not Found - /test-url'
      }));
    });

    it('errorHandler should format the error response correctly', () => {
      const error = new Error('Test Error');
      mockResponse.statusCode = 400;

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test Error',
        stack: expect.any(String),
      });
    });
  });
});
