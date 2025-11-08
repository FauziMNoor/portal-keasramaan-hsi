// Jest setup file for integration tests
// This file runs before each test file

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Set test environment variables if needed
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
