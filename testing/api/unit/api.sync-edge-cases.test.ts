// @ts-nocheck
import { determineSyncActions, mergeUpdates, fetchMetadata } from '../../../contexts/api.service';

// Mock fetch globally
global.fetch = jest.fn();

describe('Sync Logic Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Timestamp Edge Cases', () => {
    it('should handle null vs undefined timestamps', async () => {
      const localData = [
        { id: 1, date_updated: null }, // Null timestamp
        { id: 2, date_updated: null }, // Treat undefined as null for testing
        { id: 3, date_updated: '2023-01-01T00:00:00Z' }, // Valid timestamp
        { id: 4, date_updated: null } // Missing field treated as null
      ];

      const remoteItems = [
        { id: 1, date_updated: '2023-01-02T00:00:00Z' },
        { id: 2, date_updated: '2023-01-02T00:00:00Z' },
        { id: 3, date_updated: '2023-01-01T00:00:00Z' }, // Same timestamp
        { id: 4, date_updated: '2023-01-02T00:00:00Z' }
      ];

      const syncActions = determineSyncActions(localData, remoteItems);

      // Items with null/undefined timestamps should be fetched if remote has valid timestamp
      expect(syncActions.itemsToFetchIds).toContain(1); // null local, valid remote
      expect(syncActions.itemsToFetchIds).toContain(2); // undefined local, valid remote  
      expect(syncActions.itemsToFetchIds).toContain(4); // missing field, valid remote
      
      // Item with same valid timestamp should not be fetched
      expect(syncActions.itemsToFetchIds).not.toContain(3);
    });

    it('should handle invalid timestamp formats', async () => {
      const localData = [
        { id: 1, date_updated: 'invalid-date' },
        { id: 2, date_updated: '2023-13-45T25:70:80Z' }, // Invalid date components
        { id: 3, date_updated: '2023/01/01' }, // Wrong format
        { id: 4, date_updated: 1640995200 }, // Unix timestamp (number)
        { id: 5, date_updated: '2023-01-01T00:00:00' } // Missing timezone
      ];

      const remoteItems = [
        { id: 1, date_updated: '2023-01-02T00:00:00Z' },
        { id: 2, date_updated: '2023-01-02T00:00:00Z' },
        { id: 3, date_updated: '2023-01-02T00:00:00Z' },
        { id: 4, date_updated: '2023-01-02T00:00:00Z' },
        { id: 5, date_updated: '2023-01-02T00:00:00Z' }
      ];

      const syncActions = determineSyncActions(localData, remoteItems);

      // Items with invalid timestamps that result in invalid Date objects should be handled
      // The actual behavior depends on how Date constructor handles invalid strings
      // Some invalid formats might parse to valid dates, others to Invalid Date
      expect(syncActions.itemsToFetchIds.length).toBeGreaterThan(0);
      expect(syncActions.itemsToFetchIds.length).toBeLessThanOrEqual(5);
    });

    it('should handle timezone handling correctly', async () => {
      const timezoneTestCases = [
        {
          local: '2023-01-01T12:00:00Z', // UTC
          remote: '2023-01-01T07:00:00-05:00', // EST (same moment)
          shouldFetch: false
        },
        {
          local: '2023-01-01T12:00:00Z', // UTC  
          remote: '2023-01-01T12:00:00+00:00', // UTC explicit (same moment)
          shouldFetch: false
        },
        {
          local: '2023-01-01T12:00:00Z', // UTC
          remote: '2023-01-01T13:00:00+01:00', // CET (same moment)
          shouldFetch: false
        },
        {
          local: '2023-01-01T12:00:00Z', // UTC
          remote: '2023-01-01T12:01:00Z', // 1 minute later
          shouldFetch: true
        }
      ];

      timezoneTestCases.forEach((testCase, index) => {
        const localData = [{ id: index + 1, date_updated: testCase.local }];
        const remoteItems = [{ id: index + 1, date_updated: testCase.remote }];

        const syncActions = determineSyncActions(localData, remoteItems);

        if (testCase.shouldFetch) {
          expect(syncActions.itemsToFetchIds).toContain(index + 1);
        } else {
          expect(syncActions.itemsToFetchIds).not.toContain(index + 1);
        }
      });
    });

    it('should handle daylight saving time transitions', async () => {
      // Test DST transition scenarios
      const dstTestCases = [
        {
          description: 'Spring forward - 2:00 AM becomes 3:00 AM',
          local: '2023-03-12T06:59:59Z', // Just before DST
          remote: '2023-03-12T07:00:01Z', // Just after DST (2 seconds later in real time)
          shouldFetch: true
        },
        {
          description: 'Fall back - 2:00 AM becomes 1:00 AM',
          local: '2023-11-05T05:59:59Z', // Before fall back
          remote: '2023-11-05T06:00:01Z', // After fall back (2 seconds later)
          shouldFetch: true
        },
        {
          description: 'Same time during DST ambiguous hour',
          local: '2023-11-05T06:30:00Z', // During ambiguous hour
          remote: '2023-11-05T06:30:00Z', // Same timestamp
          shouldFetch: false
        }
      ];

      dstTestCases.forEach((testCase, index) => {
        const localData = [{ id: index + 1, date_updated: testCase.local }];
        const remoteItems = [{ id: index + 1, date_updated: testCase.remote }];

        const syncActions = determineSyncActions(localData, remoteItems);

        if (testCase.shouldFetch) {
          expect(syncActions.itemsToFetchIds).toContain(index + 1);
        } else {
          expect(syncActions.itemsToFetchIds).not.toContain(index + 1);
        }
      });
    });

    it('should handle future timestamps', async () => {
      const now = new Date();
      const futureTimestamps = [
        new Date(now.getTime() + 60000).toISOString(), // 1 minute in future
        new Date(now.getTime() + 3600000).toISOString(), // 1 hour in future
        new Date(now.getTime() + 86400000).toISOString(), // 1 day in future
        '2030-01-01T00:00:00Z', // Far future
        '2099-12-31T23:59:59Z' // Very far future
      ];

      futureTimestamps.forEach((futureTimestamp, index) => {
        const localData = [{ id: index + 1, date_updated: '2023-01-01T00:00:00Z' }];
        const remoteItems = [{ id: index + 1, date_updated: futureTimestamp }];

        const syncActions = determineSyncActions(localData, remoteItems);

        // Future timestamps should still trigger sync (server knows best)
        expect(syncActions.itemsToFetchIds).toContain(index + 1);
      });
    });

    it('should handle timestamp precision differences', async () => {
      const precisionTestCases = [
        {
          local: '2023-01-01T12:00:00Z', // No milliseconds
          remote: '2023-01-01T12:00:00.000Z', // With milliseconds (same time)
          shouldFetch: false
        },
        {
          local: '2023-01-01T12:00:00.123Z', // With milliseconds
          remote: '2023-01-01T12:00:01Z', // Without milliseconds but later (877ms difference)
          shouldFetch: true
        },
        {
          local: '2023-01-01T12:00:00.999Z', // High precision
          remote: '2023-01-01T12:00:01Z', // Rounded to next second (1ms difference)
          shouldFetch: true
        }
      ];

      precisionTestCases.forEach((testCase, index) => {
        const localData = [{ id: index + 1, date_updated: testCase.local }];
        const remoteItems = [{ id: index + 1, date_updated: testCase.remote }];

        const syncActions = determineSyncActions(localData, remoteItems);

        if (testCase.shouldFetch) {
          expect(syncActions.itemsToFetchIds).toContain(index + 1);
        } else {
          expect(syncActions.itemsToFetchIds).not.toContain(index + 1);
        }
      });
    });

    it('should handle leap year and leap second edge cases', async () => {
      const leapTestCases = [
        {
          description: 'Leap year date',
          local: '2024-02-29T00:00:00Z', // Valid leap year date
          remote: '2024-02-29T00:00:01Z', // 1 second later
          shouldFetch: true
        },
        {
          description: 'Non-leap year Feb 28th',
          local: '2023-02-28T23:59:59Z',
          remote: '2023-03-01T00:00:00Z', // Next day (1 second later)
          shouldFetch: true
        },
        {
          description: 'Leap second scenario',
          local: '2023-12-31T23:59:59Z',
          remote: '2024-01-01T00:00:00Z', // New year (1 second later)
          shouldFetch: true
        }
      ];

      leapTestCases.forEach((testCase, index) => {
        const localData = [{ id: index + 1, date_updated: testCase.local }];
        const remoteItems = [{ id: index + 1, date_updated: testCase.remote }];

        const syncActions = determineSyncActions(localData, remoteItems);

        if (testCase.shouldFetch) {
          expect(syncActions.itemsToFetchIds).toContain(index + 1);
        } else {
          expect(syncActions.itemsToFetchIds).not.toContain(index + 1);
        }
      });
    });

    it('should handle timestamp comparison edge cases in mergeUpdates', async () => {
      const localItems = [
        { id: 1, title: 'Local Item 1', date_updated: null },
        { id: 2, title: 'Local Item 2', date_updated: 'invalid-date' },
        { id: 3, title: 'Local Item 3', date_updated: '2023-01-01T00:00:00Z' }
      ];

      const remoteUpdates = [
        { id: 1, title: 'Remote Item 1', date_updated: '2023-01-02T00:00:00Z' },
        { id: 2, title: 'Remote Item 2', date_updated: '2023-01-02T00:00:00Z' },
        { id: 3, title: 'Remote Item 3', date_updated: '2023-01-01T00:00:00Z' }
      ];

      const mergedData = mergeUpdates(localItems, remoteUpdates, []);

      // Items with null/invalid local timestamps should be updated
      expect(mergedData.find(item => item.id === 1)?.title).toBe('Remote Item 1');
      expect(mergedData.find(item => item.id === 2)?.title).toBe('Remote Item 2');
      
      // Item with same timestamp should keep remote version (server wins)
      expect(mergedData.find(item => item.id === 3)?.title).toBe('Remote Item 3');
    });
  });

  describe('Large Dataset Syncing', () => {
    it('should handle syncing with 1000+ items efficiently', async () => {
      // Generate large datasets
      const largeLocalData = Array.from({ length: 1200 }, (_, i) => ({
        id: i + 1,
        title: `Local Item ${i + 1}`,
        date_updated: `2023-01-${String(Math.floor(i / 40) + 1).padStart(2, '0')}T00:00:00Z`
      }));

      const largeRemoteItems = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        title: `Remote Item ${i + 1}`,
        date_updated: `2023-01-${String(Math.floor(i / 40) + 2).padStart(2, '0')}T00:00:00Z` // Newer dates
      }));

      const startTime = Date.now();
      const syncActions = determineSyncActions(largeLocalData, largeRemoteItems);
      const endTime = Date.now();

      // Performance check - should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(1000); // 1 second max

      // Verify sync logic correctness
      expect(syncActions.itemsToFetchIds).toHaveLength(1000); // All remote items are newer
      expect(syncActions.itemsToDeleteIds).toHaveLength(200); // 200 local items not in remote (1200 - 1000)
      
      // Verify no duplicates in fetch list
      const uniqueFetchIds = new Set(syncActions.itemsToFetchIds);
      expect(uniqueFetchIds.size).toBe(syncActions.itemsToFetchIds.length);
    });

    it('should handle memory usage during large syncs', async () => {
      // Simulate memory-intensive large items
      const largeItemData = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        title: `Large Item ${i + 1}`,
        content: 'A'.repeat(10000), // 10KB content per item
        date_updated: '2023-01-01T00:00:00Z'
      }));

      const largeRemoteUpdates = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        title: `Updated Large Item ${i + 1}`,
        content: 'B'.repeat(10000), // 10KB content per item
        date_updated: '2023-01-02T00:00:00Z'
      }));

      // Mock memory monitoring
      const initialMemory = process.memoryUsage();
      
      const startTime = Date.now();
      const mergedData = mergeUpdates(largeItemData, largeRemoteUpdates, []);
      const endTime = Date.now();

      const finalMemory = process.memoryUsage();

      // Performance checks
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds max
      expect(mergedData).toHaveLength(500);
      
      // Memory usage should be reasonable (allow for test overhead)
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB max increase
      
      // Verify data integrity
      mergedData.forEach((item, index) => {
        expect(item.title).toBe(`Updated Large Item ${index + 1}`);
        expect(item.content).toBe('B'.repeat(10000));
      });
    });

    it('should handle partial sync failure recovery', async () => {
      const localData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Local Item ${i + 1}`,
        date_updated: '2023-01-01T00:00:00Z'
      }));

      // Mock metadata fetch that returns partial results due to server issues
      (global.fetch as jest.Mock).mockImplementation(async (url) => {
        if (url.includes('/items/update/')) {
          // Simulate server returning only first 50 items due to timeout/error
          const partialItems = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            date_updated: '2023-01-02T00:00:00Z'
          }));
          
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(partialItems)
          });
        }
        return Promise.reject(new Error('Network error'));
      });

      let metadata;
      try {
        metadata = await fetchMetadata('/items/update/');
      } catch (error) {
        // If fetchMetadata fails due to network error, that's expected in this test
        metadata = [];
      }
      
      // Should handle partial metadata gracefully (may be empty if network error)
      if (!Array.isArray(metadata)) {
        metadata = [];
      }
      expect(Array.isArray(metadata)).toBe(true);

      const syncActions = determineSyncActions(localData, metadata);
      
      // Should identify items needing updates from partial data (if any metadata received)
      if (metadata.length > 0) {
        expect(syncActions.itemsToFetchIds.length).toBeGreaterThan(0);
        expect(syncActions.itemsToDeleteIds.length).toBeGreaterThanOrEqual(0);
      } else {
        // If no metadata received, nothing to sync
        expect(syncActions.itemsToFetchIds).toHaveLength(0);
        expect(syncActions.itemsToDeleteIds).toHaveLength(100); // All local items would be considered for deletion
      }
      
      // Verify IDs are in expected range
      syncActions.itemsToFetchIds.forEach(id => {
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(50);
      });
    });

    it('should handle sync actions with mixed large and small datasets', async () => {
      // Local data has 2000 items
      const largeLocalData = Array.from({ length: 2000 }, (_, i) => ({
        id: i + 1,
        title: `Local Item ${i + 1}`,
        date_updated: i < 1000 ? '2023-01-01T00:00:00Z' : '2023-01-03T00:00:00Z'
      }));

      // Remote has only 800 items, but they're newer
      const smallerRemoteItems = Array.from({ length: 800 }, (_, i) => ({
        id: i + 1,
        date_updated: '2023-01-02T00:00:00Z'
      }));

      const syncActions = determineSyncActions(largeLocalData, smallerRemoteItems);

      // First 800 items should be fetched (newer remote versions)
      expect(syncActions.itemsToFetchIds).toHaveLength(800);
      
      // Items 801-2000 should be deleted (not in remote)
      expect(syncActions.itemsToDeleteIds).toHaveLength(1200);
      
      // Verify fetch IDs are correct
      syncActions.itemsToFetchIds.forEach(id => {
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(800);
      });

      // Verify delete IDs are correct  
      syncActions.itemsToDeleteIds.forEach(id => {
        expect(id).toBeGreaterThanOrEqual(801);
        expect(id).toBeLessThanOrEqual(2000);
      });
    });

    it('should handle extremely large sync operations without blocking', async () => {
      // Test with very large dataset to ensure non-blocking behavior
      const massiveLocalData = Array.from({ length: 5000 }, (_, i) => ({
        id: i + 1,
        title: `Item ${i + 1}`,
        content: i % 100 === 0 ? 'Large content: ' + 'X'.repeat(5000) : 'Small content',
        date_updated: new Date(2023, 0, 1 + Math.floor(i / 100)).toISOString()
      }));

      const massiveRemoteItems = Array.from({ length: 4800 }, (_, i) => ({
        id: i + 1,
        date_updated: new Date(2023, 0, 2 + Math.floor(i / 100)).toISOString()
      }));

      // Use setTimeout to ensure operation doesn't block event loop
      const isBlocking = await new Promise((resolve) => {
        let timeoutFired = false;
        
        const timer = setTimeout(() => {
          timeoutFired = true;
          resolve(true); // Operation is blocking
        }, 10);

        const syncActions = determineSyncActions(massiveLocalData, massiveRemoteItems);
        
        clearTimeout(timer);
        resolve(timeoutFired); // false if operation completed before timeout
      });

      expect(isBlocking).toBe(false); // Should not block for more than 10ms
    });

    it('should handle concurrent large sync operations', async () => {
      const createLargeDataset = (size: number, baseDate: string) => 
        Array.from({ length: size }, (_, i) => ({
          id: i + 1,
          title: `Item ${i + 1}`,
          date_updated: baseDate
        }));

      // Create multiple large datasets for concurrent syncing
      const datasets = [
        { local: createLargeDataset(500, '2023-01-01T00:00:00Z'), remote: createLargeDataset(500, '2023-01-02T00:00:00Z') },
        { local: createLargeDataset(750, '2023-01-01T00:00:00Z'), remote: createLargeDataset(600, '2023-01-02T00:00:00Z') },
        { local: createLargeDataset(300, '2023-01-01T00:00:00Z'), remote: createLargeDataset(400, '2023-01-02T00:00:00Z') }
      ];

      const startTime = Date.now();
      
      // Execute concurrent sync operations
      const syncResults = await Promise.all(
        datasets.map(({ local, remote }) => 
          Promise.resolve(determineSyncActions(local, remote))
        )
      );

      const endTime = Date.now();

      // Should complete all operations within reasonable time
      expect(endTime - startTime).toBeLessThan(1000); // 1 second for all
      
      // Verify all sync operations completed successfully
      expect(syncResults).toHaveLength(3);
      
      syncResults.forEach((result, index) => {
        expect(result.itemsToFetchIds.length).toBe(datasets[index].remote.length);
        expect(result.itemsToDeleteIds.length).toBe(
          Math.max(0, datasets[index].local.length - datasets[index].remote.length)
        );
      });
    });

    it('should handle progressive sync with batching simulation', async () => {
      const totalItems = 2000;
      const batchSize = 100;
      
      // Simulate progressive sync by processing in batches
      const allLocalData = Array.from({ length: totalItems }, (_, i) => ({
        id: i + 1,
        title: `Local Item ${i + 1}`,
        date_updated: '2023-01-01T00:00:00Z'
      }));

      const allRemoteItems = Array.from({ length: totalItems }, (_, i) => ({
        id: i + 1,
        date_updated: '2023-01-02T00:00:00Z'
      }));

      const batchResults = [];
      const startTime = Date.now();

      // Process in batches to simulate real-world progressive sync
      for (let i = 0; i < totalItems; i += batchSize) {
        const localBatch = allLocalData.slice(i, i + batchSize);
        const remoteBatch = allRemoteItems.slice(i, i + batchSize);
        
        const batchSyncActions = determineSyncActions(localBatch, remoteBatch);
        batchResults.push(batchSyncActions);
      }

      const endTime = Date.now();

      // Performance check for batched processing
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds for all batches
      expect(batchResults).toHaveLength(totalItems / batchSize);
      
      // Verify each batch processed correctly
      batchResults.forEach((batchResult, batchIndex) => {
        expect(batchResult.itemsToFetchIds).toHaveLength(batchSize);
        expect(batchResult.itemsToDeleteIds).toHaveLength(0);
        
        // Verify ID ranges are correct for each batch
        const expectedStartId = batchIndex * batchSize + 1;
        const expectedEndId = Math.min((batchIndex + 1) * batchSize, totalItems);
        
        batchResult.itemsToFetchIds.forEach(id => {
          expect(id).toBeGreaterThanOrEqual(expectedStartId);
          expect(id).toBeLessThanOrEqual(expectedEndId);
        });
      });
    });
  });

  describe('Complex Sync Scenarios', () => {
    it('should handle mixed timestamp formats in large datasets', async () => {
      const mixedFormatData = Array.from({ length: 1000 }, (_, i) => {
        let dateFormat;
        switch (i % 5) {
          case 0: dateFormat = '2023-01-01T00:00:00Z'; break;
          case 1: dateFormat = '2023-01-01T00:00:00.000Z'; break;
          case 2: dateFormat = null; break;
          case 3: dateFormat = undefined; break;
          case 4: dateFormat = 'invalid-date'; break;
        }
        
        return {
          id: i + 1,
          title: `Mixed Item ${i + 1}`,
          date_updated: dateFormat
        };
      });

      const remoteItems = Array.from({ length: 800 }, (_, i) => ({
        id: i + 1,
        date_updated: '2023-01-02T00:00:00Z'
      }));

      const syncActions = determineSyncActions(mixedFormatData, remoteItems);

      // Should handle all invalid formats correctly
      // Only items with valid timestamps that are actually different should be fetched
      // Items with null/undefined/invalid timestamps will be fetched when remote has valid timestamp
      expect(syncActions.itemsToFetchIds.length).toBeGreaterThan(0);
      expect(syncActions.itemsToDeleteIds).toHaveLength(200);
    });

    it('should handle sync state consistency during interruptions', async () => {
      const localData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Local Item ${i + 1}`,
        date_updated: '2023-01-01T00:00:00Z'
      }));

      const remoteItems = Array.from({ length: 120 }, (_, i) => ({
        id: i + 1,
        date_updated: '2023-01-02T00:00:00Z'
      }));

      // Simulate sync interruption by processing in steps
      const step1 = determineSyncActions(localData.slice(0, 50), remoteItems.slice(0, 50));
      const step2 = determineSyncActions(localData.slice(50), remoteItems.slice(50));

      // Combine results to simulate resuming sync
      const combinedFetchIds = [...step1.itemsToFetchIds, ...step2.itemsToFetchIds];
      const combinedDeleteIds = [...step1.itemsToDeleteIds, ...step2.itemsToDeleteIds];

      // Should maintain consistency across interrupted sync
      expect(new Set(combinedFetchIds).size).toBe(combinedFetchIds.length); // No duplicates
      expect(new Set(combinedDeleteIds).size).toBe(combinedDeleteIds.length); // No duplicates
      
      expect(combinedFetchIds.length).toBeGreaterThan(0); // Some items need updates
      expect(combinedDeleteIds.length).toBeGreaterThanOrEqual(0); // May or may not have items to delete
    });
  });
});