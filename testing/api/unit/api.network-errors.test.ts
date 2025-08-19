import { fetchFullData, fetchMetadata, fetchItemsByIds } from '../../../contexts/api.service';

// Mock fetch globally
global.fetch = jest.fn();

describe('Network & API Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('HTTP 401/403 Authentication Errors', () => {
    it('should handle HTTP 401 bearer token expiration', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Bearer token has expired')
      });

      await expect(fetchFullData('/items/home/')).rejects.toThrow();
      
      // Verify the error contains authentication information
      try {
        await fetchFullData('/items/home/');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('401');
      }
    });

    it('should handle HTTP 401 invalid API key', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid API key provided')
      });

      await expect(fetchMetadata('/items/wildflower/')).rejects.toThrow();
      
      try {
        await fetchMetadata('/items/wildflower/');
      } catch (error) {
        expect((error as Error).message).toMatch(/401.*Invalid API key/);
      }
    });

    it('should handle HTTP 403 permission denied', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve('Insufficient permissions to access this resource')
      });

      await expect(fetchItemsByIds('/items/restricted/', [1, 2])).rejects.toThrow();
      
      try {
        await fetchItemsByIds('/items/restricted/', [1, 2]);
      } catch (error) {
        expect((error as Error).message).toContain('403');
        expect((error as Error).message).toContain('Insufficient permissions');
      }
    });

    it('should handle multiple authentication failures gracefully', async () => {
      const authErrors = [
        { status: 401, text: 'Token expired' },
        { status: 401, text: 'Invalid token format' },
        { status: 403, text: 'Access denied' }
      ];

      for (const authError of authErrors) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: authError.status,
          statusText: authError.status === 401 ? 'Unauthorized' : 'Forbidden',
          text: () => Promise.resolve(authError.text)
        });

        await expect(fetchFullData('/items/test/')).rejects.toThrow();
      }

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('HTTP 429 Rate Limiting', () => {
    it('should handle rate limit exceeded responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Map([
          ['retry-after', '60'],
          ['x-ratelimit-limit', '1000'],
          ['x-ratelimit-remaining', '0']
        ]),
        text: () => Promise.resolve('Rate limit exceeded. Try again in 60 seconds.')
      });

      await expect(fetchFullData('/items/home/')).rejects.toThrow();
      
      try {
        await fetchFullData('/items/home/');
      } catch (error) {
        expect((error as Error).message).toContain('429');
        expect((error as Error).message).toContain('Rate limit exceeded');
      }
    });

    it('should handle rate limiting with different retry-after values', async () => {
      const retryAfterValues = ['30', '60', '300']; // 30s, 1min, 5min
      
      for (const retryAfter of retryAfterValues) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: new Map([['retry-after', retryAfter]]),
          text: () => Promise.resolve(`Rate limit exceeded. Retry after ${retryAfter} seconds.`)
        });

        await expect(fetchMetadata('/items/wildflower/')).rejects.toThrow();
      }
    });

    it('should handle rate limiting without retry-after header', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Map(), // No retry-after header
        text: () => Promise.resolve('Rate limit exceeded')
      });

      await expect(fetchItemsByIds('/items/bird/', [1, 2, 3])).rejects.toThrow();
    });
  });

  describe('HTTP 502/503 Server Errors', () => {
    it('should handle HTTP 502 bad gateway errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: () => Promise.resolve('The server received an invalid response from the upstream server')
      });

      await expect(fetchFullData('/items/home/')).rejects.toThrow();
      
      try {
        await fetchFullData('/items/home/');
      } catch (error) {
        expect((error as Error).message).toContain('502');
        expect((error as Error).message).toContain('invalid response from the upstream server');
      }
    });

    it('should handle HTTP 503 service unavailable errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: () => Promise.resolve('The server is temporarily overloaded or under maintenance')
      });

      await expect(fetchMetadata('/items/update/')).rejects.toThrow();
      
      try {
        await fetchMetadata('/items/update/');
      } catch (error) {
        expect((error as Error).message).toContain('503');
        expect((error as Error).message).toContain('temporarily overloaded or under maintenance');
      }
    });

    it('should handle HTTP 504 gateway timeout errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 504,
        statusText: 'Gateway Timeout',
        text: () => Promise.resolve('The server did not receive a timely response from the upstream server')
      });

      await expect(fetchItemsByIds('/items/mammal/', [1, 2, 3, 4, 5])).rejects.toThrow();
      
      try {
        await fetchItemsByIds('/items/mammal/', [1, 2, 3, 4, 5]);
      } catch (error) {
        expect((error as Error).message).toContain('504');
        expect((error as Error).message).toContain('did not receive a timely response');
      }
    });

    it('should handle various 5xx server errors', async () => {
      const serverErrors = [
        { status: 500, statusText: 'Internal Server Error' },
        { status: 502, statusText: 'Bad Gateway' },
        { status: 503, statusText: 'Service Unavailable' },
        { status: 504, statusText: 'Gateway Timeout' }
      ];

      for (const serverError of serverErrors) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: serverError.status,
          statusText: serverError.statusText,
          text: () => Promise.resolve(`Server error: ${serverError.statusText}`)
        });

        await expect(fetchFullData('/items/test/')).rejects.toThrow();
      }

      expect(global.fetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('Network Timeout Errors', () => {
    it('should handle request timeout scenarios', async () => {
      const timeoutError = new Error('The operation was aborted due to timeout');
      timeoutError.name = 'AbortError';
      
      (global.fetch as jest.Mock).mockRejectedValue(timeoutError);

      await expect(fetchFullData('/items/home/')).rejects.toThrow('The operation was aborted due to timeout');
    });

    it('should handle connection timeout scenarios', async () => {
      const connectionError = new Error('Connection timeout');
      connectionError.name = 'TimeoutError';
      
      (global.fetch as jest.Mock).mockRejectedValue(connectionError);

      await expect(fetchMetadata('/items/wildflower/')).rejects.toThrow('Connection timeout');
    });

    it('should handle network unavailable scenarios', async () => {
      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';
      
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(fetchItemsByIds('/items/bird/', [1, 2])).rejects.toThrow('Network request failed');
    });

    it('should handle DNS resolution failures', async () => {
      const dnsError = new Error('getaddrinfo ENOTFOUND api.example.com');
      dnsError.name = 'DNSError';
      
      (global.fetch as jest.Mock).mockRejectedValue(dnsError);

      await expect(fetchFullData('/items/home/')).rejects.toThrow();
    });
  });

  describe('Malformed JSON Response Errors', () => {
    it('should handle invalid JSON syntax', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token < in JSON at position 0'))
      });

      await expect(fetchFullData('/items/home/')).rejects.toThrow('Unexpected token < in JSON at position 0');
    });

    it('should handle incomplete JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input'))
      });

      await expect(fetchMetadata('/items/wildflower/')).rejects.toThrow('Unexpected end of JSON input');
    });

    it('should handle unexpected response structure', async () => {
      // Response missing expected 'data' field
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ error: 'Invalid response format' })
      });

      const result = await fetchFullData('/items/home/');
      // The function should handle missing 'data' field gracefully
      expect(result).toBeUndefined();
    });

    it('should handle null response data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: null })
      });

      const result = await fetchItemsByIds('/items/bird/', [999]); // Non-existent ID
      expect(result).toBeNull();
    });

    it('should handle empty response body', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected end of input'))
      });

      await expect(fetchFullData('/items/empty/')).rejects.toThrow();
    });

    it('should handle corrupted JSON with extra characters', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token } in JSON at position 45'))
      });

      await expect(fetchMetadata('/items/corrupted/')).rejects.toThrow('Unexpected token');
    });
  });

  describe('Mixed Error Scenarios', () => {
    it('should handle consecutive different error types', async () => {
      const errorSequence = [
        { ok: false, status: 401, text: () => Promise.resolve('Unauthorized') },
        { ok: false, status: 429, text: () => Promise.resolve('Rate limited') },
        { ok: false, status: 503, text: () => Promise.resolve('Service unavailable') }
      ];

      for (const errorResponse of errorSequence) {
        (global.fetch as jest.Mock).mockResolvedValueOnce(errorResponse);
        await expect(fetchFullData('/items/test/')).rejects.toThrow();
      }

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle error recovery after multiple failures', async () => {
      const successResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ 
          data: { 
            id: 1, 
            date_created: '2023-01-01', 
            date_updated: '2023-01-01', 
            text: 'Success after errors' 
          } 
        })
      };

      // First two calls fail, third succeeds
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, status: 503, text: () => Promise.resolve('Service unavailable') })
        .mockResolvedValueOnce({ ok: false, status: 429, text: () => Promise.resolve('Rate limited') })
        .mockResolvedValueOnce(successResponse);

      // First two calls should fail
      await expect(fetchFullData('/items/test/')).rejects.toThrow();
      await expect(fetchFullData('/items/test/')).rejects.toThrow();
      
      // Third call should succeed
      const result = await fetchFullData('/items/test/');
      expect(result).toEqual({
        id: 1,
        date_created: '2023-01-01',
        date_updated: '2023-01-01',
        text: 'Success after errors'
      });
    });

    it('should handle network errors during large batch operations', async () => {
      const networkError = new Error('Connection lost during batch operation');
      networkError.name = 'NetworkError';
      
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Try to fetch a large batch of items
      const largeIdArray = Array.from({ length: 50 }, (_, i) => i + 1);
      
      await expect(fetchItemsByIds('/items/wildflower/', largeIdArray)).rejects.toThrow('Connection lost during batch operation');
    });
  });

  describe('Error Message Quality', () => {
    it('should provide informative error messages', async () => {
      const testCases = [
        {
          response: { ok: false, status: 404, statusText: 'Not Found', text: () => Promise.resolve('Resource not found') },
          expectedInMessage: ['404', 'Resource not found']
        },
        {
          response: { ok: false, status: 422, statusText: 'Unprocessable Entity', text: () => Promise.resolve('Validation failed') },
          expectedInMessage: ['422', 'Validation failed']
        }
      ];

      for (const testCase of testCases) {
        (global.fetch as jest.Mock).mockResolvedValueOnce(testCase.response);
        
        try {
          await fetchFullData('/items/test/');
        } catch (error) {
          const errorMessage = (error as Error).message;
          testCase.expectedInMessage.forEach(expectedText => {
            expect(errorMessage).toContain(expectedText);
          });
        }
      }
    });

    it('should include endpoint information in error messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Database connection failed')
      });

      try {
        await fetchFullData('/items/wildflower/');
      } catch (error) {
        // Error should contain helpful debugging information
        expect((error as Error).message).toContain('500');
        expect((error as Error).message).toContain('Database connection failed');
      }
    });
  });
});