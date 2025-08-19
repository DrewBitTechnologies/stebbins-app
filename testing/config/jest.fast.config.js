module.exports = {
  displayName: 'Fast Tests',
  testEnvironment: 'node',
  rootDir: '..',
  setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],
  testMatch: [
    '<rootDir>/api/unit/**/*.(test|spec).(ts|tsx|js)',
    '<rootDir>/unit/**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    '../../contexts/**/*.{ts,tsx}',
    '!../../contexts/**/*.d.ts',
    '!../../node_modules/**'
  ],
  coverageDirectory: '../coverage/fast',
  coverageReporters: ['text', 'lcov'],
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
  testTimeout: 5000, // 5 seconds for fast tests
  verbose: false // Keep output minimal for fast feedback
};