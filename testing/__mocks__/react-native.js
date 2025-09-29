const React = require('react');

const View = 'View';
const Text = 'Text';
const TouchableOpacity = 'TouchableOpacity';
const ScrollView = 'ScrollView';
const Image = 'Image';
const TextInput = 'TextInput';
const Modal = 'Modal';
const Pressable = 'Pressable';
const ActivityIndicator = 'ActivityIndicator';
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
};

const Platform = {
  OS: 'ios',
  Version: '16.0',
  select: (obj) => obj.ios || obj.default,
};

const Dimensions = {
  get: () => ({ width: 375, height: 812 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const Alert = {
  alert: jest.fn((title, message, buttons) => {
    // Auto-press first button for testing
    if (buttons && buttons[0] && buttons[0].onPress) {
      buttons[0].onPress();
    }
  }),
};

const Animated = {
  Value: class {
    constructor(value) {
      this._value = value;
    }
    setValue(value) {
      this._value = value;
    }
    interpolate(config) {
      return this;
    }
  },
  View: 'Animated.View',
  Text: 'Animated.Text',
  timing: () => ({
    start: jest.fn((callback) => callback && callback()),
  }),
  spring: () => ({
    start: jest.fn((callback) => callback && callback()),
  }),
  sequence: () => ({
    start: jest.fn((callback) => callback && callback()),
  }),
  parallel: () => ({
    start: jest.fn((callback) => callback && callback()),
  }),
  loop: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  delay: () => ({
    start: jest.fn((callback) => callback && callback()),
  }),
};

module.exports = {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
  Animated,
  __esModule: true,
};