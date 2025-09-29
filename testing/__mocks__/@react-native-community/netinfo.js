module.exports = {
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
  addEventListener: jest.fn().mockReturnValue(jest.fn()),
  configure: jest.fn(),
  refresh: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
  __esModule: true,
  default: {
    fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
    addEventListener: jest.fn().mockReturnValue(jest.fn()),
    configure: jest.fn(),
    refresh: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
  }
};