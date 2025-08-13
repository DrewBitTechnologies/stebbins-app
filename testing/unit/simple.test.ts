describe('Basic Test Setup', () => {
  it('should run a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to basic Jest functions', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});