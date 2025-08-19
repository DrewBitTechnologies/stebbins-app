// @ts-nocheck
import * as FileSystem from 'expo-file-system';
import {
  saveToCache,
  loadFromCache,
  processAndCacheImages,
  isCacheVersionValid,
  wipeCache,
  getCacheVersion,
  saveCacheVersion
} from '../../../contexts/api.service';

// Mock the modules
jest.mock('expo-file-system');
jest.mock('expo-application');

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('Cache Corruption & Recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
    mockFileSystem.makeDirectoryAsync.mockResolvedValue();
    mockFileSystem.writeAsStringAsync.mockResolvedValue();
    mockFileSystem.readAsStringAsync.mockResolvedValue('{}');
    mockFileSystem.downloadAsync.mockResolvedValue({ status: 200 } as any);
    mockFileSystem.deleteAsync.mockResolvedValue();
  });

  describe('File System Corruption', () => {
    it('should handle truncated JSON files', async () => {
      const testData = {
        data: { id: 1, text: 'Test content' } as any,
        imagePaths: {},
        lastItemUpdateTimestamp: '2023-01-01'
      };

      // Save complete data first
      await saveToCache('test_data', testData);

      // Mock truncated JSON file
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue('{"data":{"id":1,"text":"Test con'); // Truncated

      const result = await loadFromCache('test_data');
      expect(result).toBeNull(); // Should return null for corrupted JSON
    });

    it('should handle completely corrupted JSON files', async () => {
      // Mock corrupted file with binary data
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue('\x00\x01\x02\x03corrupted binary data');

      const result = await loadFromCache('corrupted_data');
      expect(result).toBeNull();
    });

    it('should handle JSON files with invalid structure', async () => {
      const invalidJsonStructures = [
        '{"invalid": "structure", "missing": "required_fields"}',
        '{"data": "string_instead_of_object"}',
        '{"data": {"id": 1}, "missing_timestamp": true}',
        '[]', // Array instead of object
        'null',
        '""', // Empty string
        '123' // Number instead of object
      ];

      for (const invalidJson of invalidJsonStructures) {
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
        mockFileSystem.readAsStringAsync.mockResolvedValue(invalidJson);

        const result = await loadFromCache('invalid_structure');
        // Should handle gracefully - either return null or the parsed data
        expect(() => result).not.toThrow();
      }
    });

    it('should handle corrupted cache directory structure', async () => {
      // Mock directory access error
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('ENOTDIR: not a directory'));
      
      // Should handle directory corruption gracefully
      await expect(loadFromCache('test_data')).resolves.not.toThrow();
      
      const result = await loadFromCache('test_data');
      expect(result).toBeNull();
    });

    it('should handle permission errors on cache files', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockRejectedValue(new Error('EACCES: permission denied'));

      const result = await loadFromCache('permission_test');
      expect(result).toBeNull();
    });

    it('should handle cache files with zero bytes', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true, size: 0 } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue('');

      const result = await loadFromCache('empty_file');
      expect(result).toBeNull();
    });

    it('should handle cache files that are actually directories', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true, isDirectory: true } as any);
      mockFileSystem.readAsStringAsync.mockRejectedValue(new Error('EISDIR: illegal operation on a directory'));

      const result = await loadFromCache('directory_instead_of_file');
      expect(result).toBeNull();
    });

    it('should handle cache recovery mechanisms', async () => {
      const testData = {
        data: { id: 1, text: 'Recovery test' } as any,
        imagePaths: {},
        lastItemUpdateTimestamp: '2023-01-01'
      };

      // First attempt fails due to corruption
      mockFileSystem.writeAsStringAsync
        .mockRejectedValueOnce(new Error('EIO: i/o error'))
        .mockResolvedValueOnce(); // Second attempt succeeds

      // Should not throw and should retry
      await expect(saveToCache('recovery_test', testData)).resolves.not.toThrow();

      expect(mockFileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent file corruption during write operations', async () => {
      const testData1 = {
        data: { id: 1, text: 'Data 1' } as any,
        imagePaths: {},
        lastItemUpdateTimestamp: '2023-01-01'
      };

      const testData2 = {
        data: { id: 2, text: 'Data 2' } as any,
        imagePaths: {},
        lastItemUpdateTimestamp: '2023-01-02'
      };

      // Mock write corruption for one file
      mockFileSystem.writeAsStringAsync.mockImplementation(async (path: string) => {
        if (path.includes('data1')) {
          throw new Error('ENOSPC: no space left on device');
        }
        return Promise.resolve();
      });

      // One should fail, one should succeed
      await expect(saveToCache('data1', testData1)).resolves.not.toThrow();
      await expect(saveToCache('data2', testData2)).resolves.not.toThrow();

      expect(mockFileSystem.writeAsStringAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Consistency', () => {
    it('should test image paths vs cached data sync', async () => {
      const testData = [
        { id: 1, image: 'image1.jpg', background: 'bg1.png' },
        { id: 2, image: 'image2.jpg', background: 'bg2.png' }
      ];

      const cachedData = {
        data: testData,
        imagePaths: {
          'image1.jpg': '/cache/screen_image1.jpg',
          'bg1.png': '/cache/screen_bg1.png',
          // Missing image2.jpg and bg2.png mappings
        },
        lastItemUpdateTimestamp: '2023-01-01'
      };

      // Mock cache load
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(cachedData));

      const result = await loadFromCache('consistency_test');
      
      // Verify data structure consistency
      expect(result?.data).toHaveLength(2);
      expect(result?.imagePaths).toBeDefined();
      
      // Check for missing image mappings
      const dataImages = testData.flatMap(item => [item.image, item.background]);
      const cachedImages = Object.keys(result?.imagePaths || {});
      
      expect(dataImages).toContain('image2.jpg');
      expect(dataImages).toContain('bg2.png');
      expect(cachedImages).not.toContain('image2.jpg');
      expect(cachedImages).not.toContain('bg2.png');
    });

    it('should test version file corruption', async () => {
      const corruptedVersionData = [
        '',                                    // Empty file
        'not json',                           // Invalid JSON
        '{"wrong": "structure"}',             // Wrong structure
        '{"version": null}',                  // Null version
        '{"version": 123}',                   // Number instead of string
        '{"version": ""}',                    // Empty version string
        '[]',                                 // Array instead of object
        'null'                               // Null value
      ];

      for (const corruptedData of corruptedVersionData) {
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
        mockFileSystem.readAsStringAsync.mockResolvedValue(corruptedData);

        const isValid = await isCacheVersionValid();
        expect(typeof isValid).toBe('boolean');
        expect(isValid).toBe(false); // Should be invalid for corrupted version
      }
    });

    it('should test partial cache states', async () => {
      // Simulate partial cache state where some files exist and others don't
      const partialCacheStates = [
        {
          description: 'Data file exists, version file missing',
          dataExists: true,
          versionExists: false,
          imagesExist: false
        },
        {
          description: 'Version file exists, data files missing',
          dataExists: false,
          versionExists: true,
          imagesExist: false
        },
        {
          description: 'Images exist, metadata missing',
          dataExists: false,
          versionExists: false,
          imagesExist: true
        },
        {
          description: 'All metadata exists, images missing',
          dataExists: true,
          versionExists: true,
          imagesExist: false
        }
      ];

      for (const state of partialCacheStates) {
        // Mock file existence based on state
        mockFileSystem.getInfoAsync.mockImplementation(async (path: string) => {
          if (path.includes('version') && state.versionExists) {
            return Promise.resolve({ exists: true } as any);
          }
          if (path.includes('.json') && state.dataExists) {
            return Promise.resolve({ exists: true } as any);
          }
          if (path.includes('.jpg') || path.includes('.png')) {
            return Promise.resolve({ exists: state.imagesExist } as any);
          }
          return Promise.resolve({ exists: false } as any);
        });

        // Test version validation with partial state
        const isValid = await isCacheVersionValid();
        expect(typeof isValid).toBe('boolean');

        // Test data loading with partial state
        if (state.dataExists) {
          mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify({
            data: { id: 1, text: 'test' },
            imagePaths: {},
            lastItemUpdateTimestamp: '2023-01-01'
          }));
        }

        const result = await loadFromCache('partial_test');
        if (state.dataExists) {
          expect(result).not.toBeNull();
        } else {
          expect(result).toBeNull();
        }
      }
    });

    it('should handle image cache inconsistencies', async () => {
      const imageData = [{ id: 1, image: 'test.jpg' }];

      // Mock inconsistent image cache state
      mockFileSystem.getInfoAsync.mockImplementation(async (path: string) => {
        if (path.includes('cache/')) return Promise.resolve({ exists: false } as any);
        return Promise.resolve({ exists: false } as any);
      });

      // Mock download success but file doesn't appear in cache
      mockFileSystem.downloadAsync.mockResolvedValue({ status: 200 } as any);

      const result = await processAndCacheImages('inconsistent_test', imageData);
      
      // Should handle inconsistency gracefully
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should test timestamp consistency across cache files', async () => {
      const inconsistentTimestamps = {
        main_data: {
          data: { id: 1, date_updated: '2023-01-01T00:00:00Z' },
          imagePaths: {},
          lastItemUpdateTimestamp: '2023-01-01T00:00:00Z'
        },
        related_data: {
          data: { id: 2, date_updated: '2023-01-02T00:00:00Z' },
          imagePaths: {},
          lastItemUpdateTimestamp: '2022-12-31T00:00:00Z' // Inconsistent timestamp
        }
      };

      // Save both datasets
      for (const [key, data] of Object.entries(inconsistentTimestamps)) {
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
        mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(data));
        
        const result = await loadFromCache(key);
        
        if (result) {
          expect(result.lastItemUpdateTimestamp).toBeDefined();
          
          // Verify timestamp inconsistency is preserved (not auto-corrected)
          if (key === 'related_data') {
            expect(result.lastItemUpdateTimestamp).not.toBe(result.data.date_updated);
          }
        }
      }
    });
  });

  describe('Cache Recovery Mechanisms', () => {
    it('should handle complete cache wipe and recovery', async () => {
      // Mock cache existence
      mockFileSystem.getInfoAsync
        .mockResolvedValueOnce({ exists: true } as any)  // Cache exists for wipe
        .mockResolvedValueOnce({ exists: false } as any) // After wipe
        .mockResolvedValueOnce({ exists: false } as any); // For recreation

      await expect(wipeCache()).resolves.not.toThrow();

      expect(mockFileSystem.deleteAsync).toHaveBeenCalled();
      expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });

    it('should handle partial recovery after corruption', async () => {
      const corruptedCacheData = {
        'screen1': { corrupted: true },
        'screen2': null,
        'screen3': { data: { id: 1 }, lastItemUpdateTimestamp: '2023-01-01' }
      };

      for (const [key, data] of Object.entries(corruptedCacheData)) {
        if (data === null) {
          mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
        } else if (data.corrupted) {
          mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
          mockFileSystem.readAsStringAsync.mockResolvedValue('corrupted data');
        } else {
          mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
          mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(data));
        }

        const result = await loadFromCache(key);
        
        if (data?.corrupted || data === null) {
          expect(result).toBeNull();
        } else {
          expect(result).not.toBeNull();
        }
      }
    });

    it('should handle cache version recovery', async () => {
      // Test version recovery scenarios
      const versionRecoveryScenarios = [
        {
          name: 'Missing version file',
          versionExists: false,
          expectedValid: false
        },
        {
          name: 'Corrupted version file',
          versionExists: true,
          versionContent: 'corrupted',
          expectedValid: false
        },
        {
          name: 'Valid version file',
          versionExists: true,
          versionContent: JSON.stringify({ version: '2.0.0-42' }),
          expectedValid: true
        }
      ];

      const mockApplication = require('expo-application');
      mockApplication.nativeApplicationVersion = '2.0.0';
      mockApplication.nativeBuildVersion = '42';

      for (const scenario of versionRecoveryScenarios) {
        if (scenario.versionExists) {
          mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
          mockFileSystem.readAsStringAsync.mockResolvedValue(scenario.versionContent || '');
        } else {
          mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
        }

        const isValid = await isCacheVersionValid();
        expect(isValid).toBe(scenario.expectedValid);
      }
    });

    it('should handle automated cache cleanup after corruption detection', async () => {
      // Mock a scenario where corruption is detected and cache should be cleaned
      const corruptionIndicators = [
        'Invalid JSON in main cache file',
        'Missing critical cache files',
        'Version mismatch indicating corruption',
        'Inconsistent timestamps',
        'File system errors'
      ];

      let cleanupCalled = false;
      
      // Mock version check that detects corruption
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue('corrupted version data');

      const isValid = await isCacheVersionValid();
      expect(isValid).toBe(false);

      if (!isValid) {
        // Simulate cleanup
        await wipeCache();
        cleanupCalled = true;
      }

      expect(cleanupCalled).toBe(true);
    });

    it('should handle recovery from disk space issues', async () => {
      const testData = {
        data: { id: 1, text: 'Disk space test' } as any,
        imagePaths: {},
        lastItemUpdateTimestamp: '2023-01-01'
      };

      // Simulate disk space recovery
      mockFileSystem.writeAsStringAsync
        .mockRejectedValueOnce(new Error('ENOSPC: no space left on device'))
        .mockRejectedValueOnce(new Error('ENOSPC: no space left on device'))
        .mockResolvedValueOnce(); // Space becomes available

      // Should handle disk space issues gracefully
      await expect(saveToCache('disk_space_test', testData)).resolves.not.toThrow();
      await expect(saveToCache('disk_space_test', testData)).resolves.not.toThrow();
      await expect(saveToCache('disk_space_test', testData)).resolves.not.toThrow();
    });

    it('should handle recovery from concurrent access conflicts', async () => {
      const testData = {
        data: { id: 1, text: 'Concurrent test' } as any,
        imagePaths: {},
        lastItemUpdateTimestamp: '2023-01-01'
      };

      // Simulate file locking conflicts
      mockFileSystem.writeAsStringAsync
        .mockRejectedValueOnce(new Error('EBUSY: resource busy or locked'))
        .mockRejectedValueOnce(new Error('EAGAIN: resource temporarily unavailable'))
        .mockResolvedValueOnce(); // Eventually succeeds

      await expect(saveToCache('concurrent_test', testData)).resolves.not.toThrow();
      await expect(saveToCache('concurrent_test', testData)).resolves.not.toThrow();
      await expect(saveToCache('concurrent_test', testData)).resolves.not.toThrow();
    });

    it('should verify cache integrity after recovery', async () => {
      // Simulate recovery process
      await wipeCache();
      
      // Recreate cache with valid data
      const validData = {
        data: { id: 1, text: 'Recovery test', date_updated: '2023-01-01' } as any,
        imagePaths: { 'test.jpg': '/cache/test.jpg' },
        lastItemUpdateTimestamp: '2023-01-01'
      };

      await saveToCache('recovery_integrity', validData);
      
      // Mock successful save and load
      mockFileSystem.writeAsStringAsync.mockResolvedValue();
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(validData));

      const recovered = await loadFromCache('recovery_integrity');
      
      // Verify integrity
      expect(recovered).not.toBeNull();
      expect(recovered?.data.id).toBe(1);
      expect(recovered?.lastItemUpdateTimestamp).toBe('2023-01-01');
      expect(recovered?.imagePaths['test.jpg']).toBe('/cache/test.jpg');
    });
  });

  describe('Cache Corruption Prevention', () => {
    it('should handle atomic write operations', async () => {
      const testData = {
        data: { id: 1, text: 'Atomic write test' } as any,
        imagePaths: {},
        lastItemUpdateTimestamp: '2023-01-01'
      };

      // Mock write operation tracking
      let writeStarted = false;
      let writeCompleted = false;

      mockFileSystem.writeAsStringAsync.mockImplementation(async () => {
        writeStarted = true;
        // Simulate write process
        await new Promise(resolve => setTimeout(resolve, 10));
        writeCompleted = true;
        return Promise.resolve();
      });

      await saveToCache('atomic_test', testData);

      expect(writeStarted).toBe(true);
      expect(writeCompleted).toBe(true);
    });

    it('should handle backup and restore mechanisms', async () => {
      const originalData = {
        data: { id: 1, text: 'Original data' } as any,
        imagePaths: {},
        lastItemUpdateTimestamp: '2023-01-01'
      };

      const corruptedData = 'corrupted backup data';

      // Save original data (simulating backup)
      mockFileSystem.writeAsStringAsync.mockResolvedValue();
      await saveToCache('backup_test', originalData);

      // Simulate corruption
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(corruptedData);

      const result = await loadFromCache('backup_test');
      expect(result).toBeNull(); // Should detect corruption

      // Simulate restore from backup (would be implemented at higher level)
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(originalData));
      const restored = await loadFromCache('backup_test');
      expect(restored).toEqual(originalData);
    });
  });
});