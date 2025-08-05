import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

// Load environment variables
dotenv.config();

// Test private key generation function
function generateTestPrivateKey(): string {
  return randomBytes(32).toString('hex');
}

// Set test values if environment variables are not configured
if (!process.env.IRYS_PRIVATE_KEY) {
  process.env.IRYS_PRIVATE_KEY = generateTestPrivateKey();
  console.log('🔑 Test private key generated:', process.env.IRYS_PRIVATE_KEY);
}

if (!process.env.IRYS_NETWORK) {
  process.env.IRYS_NETWORK = 'mainnet';
  console.log('🌍 IRYS_NETWORK set to: mainnet');
}

if (!process.env.IRYS_GATEWAY_URL) {
  process.env.IRYS_GATEWAY_URL = 'https://uploader.irys.xyz';
  console.log('🌐 IRYS_GATEWAY_URL set to: https://uploader.irys.xyz');
}

// Jest configuration
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

// Global test setup
beforeAll(() => {
  console.log('🧪 Test environment setup completed');
  console.log(`🔑 Private key: ${process.env.IRYS_PRIVATE_KEY ? 'Set' : 'Not set'}`);
  console.log(`🌍 Network: ${process.env.IRYS_NETWORK}`);
  console.log(`🌐 Gateway URL: ${process.env.IRYS_GATEWAY_URL}`);
});

afterAll(() => {
  console.log('🧹 Test environment cleanup completed');
});

// Cleanup after each test
afterEach(() => {
  // Cleanup work for test isolation
  jest.clearAllMocks();
});

// Test environment variable validation
beforeAll(() => {
  const requiredEnvVars = ['IRYS_PRIVATE_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  The following environment variables are not set: ${missingVars.join(', ')}`);
    console.warn('   Some tests may fail.');
  }
});

// Test file cleanup function
export const cleanupTestFiles = (filePaths: string[]) => {
  const fs = require('fs');
  filePaths.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Ignore file deletion failures
    }
  });
};

// Test data creation function
export const createTestFile = (filePath: string, content: string = 'test content') => {
  const fs = require('fs');
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
};

// Random test ID generation
export const generateTestId = () => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}; 