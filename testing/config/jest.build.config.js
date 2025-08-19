module.exports = {
  displayName: 'Build Tests',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../setup-tests.ts'],
  testMatch: [
    '**/build/**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    '../../*.{ts,tsx,js}', // Config files at root
    '!../../node_modules/**',
    '!../../coverage/**'
  ],
  coverageDirectory: '../coverage/build',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../$1'
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
  testTimeout: 600000, // 10 minutes for build tests
  maxWorkers: 1 // Run build tests sequentially to avoid conflicts
};