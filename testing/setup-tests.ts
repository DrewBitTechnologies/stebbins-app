import '@testing-library/jest-dom';

// Mock fetch globally
(global as any).fetch = jest.fn();

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});