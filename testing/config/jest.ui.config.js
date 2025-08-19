module.exports = {
  displayName: 'UI Tests',
  testEnvironment: 'jsdom',
  rootDir: '..',
  setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],
  testMatch: [
    '<rootDir>/ui/**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    '../../components/**/*.{ts,tsx}',
    '../../app/**/*.{ts,tsx}',
    '!../../components/**/*.d.ts',
    '!../../app/**/*.d.ts',
    '!../../node_modules/**'
  ],
  coverageDirectory: '../coverage/ui',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../$1',
    '^expo-file-system$': '<rootDir>/../__mocks__/expo-file-system.js',
    '^expo-application$': '<rootDir>/../__mocks__/expo-application.js',
    '^expo-router$': '<rootDir>/../__mocks__/expo-router.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library|expo|react-native)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 5000 // 5 seconds for UI tests
};