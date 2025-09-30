module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],
  globals: {
    __DEV__: true
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    '../contexts/**/*.{ts,tsx}',
    '!../contexts/**/*.d.ts',
    '!../node_modules/**'
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.js',
    '^expo-application$': '<rootDir>/__mocks__/expo-application.js',
    '^expo-device$': '<rootDir>/__mocks__/expo-device.js',
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
    '^expo-image-picker$': '<rootDir>/__mocks__/expo-image-picker.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^@react-native-community/netinfo$': '<rootDir>/__mocks__/@react-native-community/netinfo.js',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^expo-font$': '<rootDir>/__mocks__/expo-font.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/@expo/vector-icons.js',
    '^expo-image-manipulator$': '<rootDir>/__mocks__/expo-image-manipulator.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|expo|expo-.*|@expo|@testing-library)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};