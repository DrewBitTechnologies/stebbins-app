module.exports = {
  displayName: 'API Tests',
  testEnvironment: 'node',
  rootDir: '..',
  setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],
  testMatch: [
    '<rootDir>/api/**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    '../../contexts/**/*.{ts,tsx}',
    '!../../contexts/**/*.d.ts',
    '!../../node_modules/**'
  ],
  coverageDirectory: '../coverage/api',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.js',
    '^expo-application$': '<rootDir>/__mocks__/expo-application.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 10000 // 10 seconds for API tests
};