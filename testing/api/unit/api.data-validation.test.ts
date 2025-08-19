// @ts-nocheck
import { fetchFullData, fetchMetadata, determineSyncActions, mergeUpdates } from '../../../contexts/api.service';
import { SCREEN_CONFIGS } from '../../../contexts/api.config';

// Mock fetch globally
global.fetch = jest.fn();

describe('Data Validation & Schema Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Required Field Validation', () => {
    it('should handle missing required fields in API responses', async () => {
      // Test missing 'data' field entirely
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}) // Missing 'data' field
      });

      const result = await fetchFullData('/items/home/');
      expect(result).toBeUndefined();
    });

    it('should handle null data field in API responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: null })
      });

      const result = await fetchFullData('/items/wildflower/');
      expect(result).toBeNull();
    });

    it('should handle missing required fields in data objects', async () => {
      const incompleteHomeData = {
        text: 'Welcome to Stebbins',
        reserve_status: 'active'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: incompleteHomeData })
      });

      const result: any = await fetchFullData('/items/home/');
      expect(result).toEqual(incompleteHomeData);
      
      // Verify the app handles missing critical fields
      expect(result.id).toBeUndefined();
      expect(result.date_created).toBeUndefined();
      expect(result.date_updated).toBeUndefined();
    });

    it('should handle empty arrays vs null collections', async () => {
      const testCases = [
        { data: [] }, // Empty array
        { data: null }, // Null collection
        { data: undefined }, // Undefined collection
        {} // Missing data field entirely
      ];

      for (const testCase of testCases) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(testCase)
        });

        const result = await fetchFullData('/items/wildflower/');
        
        if (testCase.data === undefined || !testCase.hasOwnProperty('data')) {
          expect(result).toBeUndefined();
        } else if (testCase.data === null) {
          expect(result).toBeNull();
        } else {
          expect(Array.isArray(result)).toBe(true);
          expect(result).toHaveLength(0);
        }
      }
    });
  });

  describe('Data Type Validation', () => {
    it('should handle string vs number ID mismatches', async () => {
      const mixedIdTypes = [
        { id: 1, name: 'Numeric ID' },           // Number
        { id: '2', name: 'String ID' },          // String  
        { id: 'abc', name: 'Non-numeric ID' },   // Non-numeric string
        { id: null, name: 'Null ID' }            // Null
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mixedIdTypes })
      });

      const result: any = await fetchFullData('/items/wildflower/');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(4);
      
      // Verify different ID types are preserved
      expect(typeof result[0].id).toBe('number');
      expect(typeof result[1].id).toBe('string');
      expect(typeof result[2].id).toBe('string');
      expect(result[3].id).toBeNull();
    });

    it('should handle invalid date format handling', async () => {
      const invalidDateFormats: any = {
        id: 1,
        date_created: 'invalid-date',
        date_updated: '2023-13-45T25:70:80Z', // Invalid date
        other_date: '2023/01/01', // Wrong format
        null_date: null
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: invalidDateFormats })
      });

      const result: any = await fetchFullData('/items/update/');
      
      // Verify invalid dates are preserved as-is (no conversion)
      expect(result.date_created).toBe('invalid-date');
      expect(result.date_updated).toBe('2023-13-45T25:70:80Z');
      expect(result.other_date).toBe('2023/01/01');
      expect(result.null_date).toBeNull();
    });
  });

  describe('Content Validation', () => {
    it('should handle UTF-8/emoji handling in text fields', async () => {
      const unicodeTestData: any = {
        id: 1,
        name: 'Test with émojis 🌸🦋🌿',
        description: 'UTF-8 test: café naïve résumé 中文 العربية',
        emoji_text: '🌺🌻🌷🌹🌵🍄🦆🐝🦋'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: unicodeTestData })
      });

      const result: any = await fetchFullData('/items/wildflower/');
      
      // Verify UTF-8 content is preserved
      expect(result.name).toBe('Test with émojis 🌸🦋🌿');
      expect(result.description).toBe('UTF-8 test: café naïve résumé 中文 العربية');
      expect(result.emoji_text).toBe('🌺🌻🌷🌹🌵🍄🦆🐝🦋');
    });

    it('should handle extremely long strings', async () => {
      const longStringData: any = {
        id: 1,
        short_text: 'Normal length text',
        long_description: 'A'.repeat(10000),      // 10KB string
        very_long_text: 'B'.repeat(100000)        // 100KB string
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: longStringData })
      });

      const result: any = await fetchFullData('/items/about/');
      
      // Verify long strings are handled
      expect(result.short_text).toBe('Normal length text');
      expect(result.long_description).toHaveLength(10000);
      expect(result.very_long_text).toHaveLength(100000);
    });

    it('should handle HTML/script injection in content', async () => {
      const injectionTestData: any = {
        id: 1,
        name: '<script>alert("XSS")</script>',
        description: '<img src="x" onerror="alert(1)">',
        sql_injection: "'; DROP TABLE users; --"
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: injectionTestData })
      });

      const result: any = await fetchFullData('/items/about/');
      
      // Verify potentially malicious content is preserved as-is (not sanitized at API level)
      expect(result.name).toBe('<script>alert("XSS")</script>');
      expect(result.description).toBe('<img src="x" onerror="alert(1)">');
      expect(result.sql_injection).toBe("'; DROP TABLE users; --");
    });
  });

  describe('Schema Compliance Integration', () => {
    it('should handle sync operations with invalid data', async () => {
      const localData = [
        { id: 1, date_updated: '2023-01-01T00:00:00Z' },
        { id: 2, date_updated: null }, // Invalid timestamp
        { id: 3, date_updated: undefined } // Missing timestamp
      ];

      const remoteItems = [
        { id: 1, date_updated: '2023-01-02T00:00:00Z' },
        { id: 2, date_updated: 'invalid-date' }, // Invalid date format
        { id: 4, date_updated: '2023-01-01T00:00:00Z' } // New item
      ];

      const syncActions = determineSyncActions(localData, remoteItems);
      
      // Should handle invalid timestamps gracefully
      expect(syncActions.itemsToFetchIds).toContain(1); // Valid update
      expect(syncActions.itemsToFetchIds).toContain(2); // Invalid date should trigger fetch
      expect(syncActions.itemsToFetchIds).toContain(4); // New item
      expect(syncActions.itemsToDeleteIds).toContain(3); // Missing from remote
    });

    it('should validate screen configuration data integrity', async () => {
      // Test each screen configuration with invalid data
      for (const [screenName, config] of Object.entries(SCREEN_CONFIGS)) {
        const invalidResponses = [
          { data: null },
          { data: undefined },
          {},
          { data: 'string-instead-of-object-or-array' }
        ];

        for (const invalidResponse of invalidResponses) {
          (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(invalidResponse)
          });

          // Should not throw errors with invalid data
          await expect(fetchFullData(config.endpoint)).resolves.not.toThrow();
        }
      }
    });
  });
});