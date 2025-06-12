import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce logging noise in tests
});

// Mock console methods to reduce noise in test output
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = originalConsole.error; // Keep errors for debugging
});

afterEach(() => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Global test cleanup
afterAll(async () => {
  // Clean up any remaining connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

// Helper to connect to test database
export const connectTestDB = async (uri?: string) => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  const mongoUri = uri || process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/test';
  await mongoose.connect(mongoUri);
};

// Helper to disconnect from test database
export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

// Helper to clear test database
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Mock external services by default
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify([{
            comment: "Test comment",
            viralRate: 85,
            commentTokenCount: 15
          }])
        }
      })
    }))
  }))
}));

jest.mock('puppeteer-extra', () => ({
  launch: jest.fn(() => ({
    newPage: jest.fn(() => ({
      goto: jest.fn(),
      screenshot: jest.fn(),
      $: jest.fn(),
      evaluate: jest.fn(),
      type: jest.fn(),
      click: jest.fn(),
      reload: jest.fn(),
      setCookie: jest.fn(),
      keyboard: { press: jest.fn() }
    })),
    close: jest.fn()
  })),
  use: jest.fn()
}));

jest.mock('bullmq', () => ({
  Queue: jest.fn(() => ({
    add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    pause: jest.fn(),
    resume: jest.fn(),
    close: jest.fn()
  })),
  Worker: jest.fn(() => ({
    close: jest.fn()
  }))
}));

// Export test utilities
export const createMockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  return mockDate;
};

export const restoreDate = () => {
  (global.Date as any).mockRestore?.();
}; 