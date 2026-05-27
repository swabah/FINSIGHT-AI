import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test-dummy';
process.env.JWT_SECRET = 'test-secret';
process.env.OPENAI_API_KEY = 'test-key';
process.env.GOOGLE_API_KEY = 'test-key';

vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose');
  return {
    ...(actual as any),
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn().mockResolvedValue(true),
    connection: {
      readyState: 1,
      collections: {},
    },
  };
});

beforeAll(async () => {
  // Mock setup complete
});

afterAll(async () => {
  // Mock teardown complete
});

afterEach(async () => {
  vi.clearAllMocks();
});
