import * as FileSystem from 'expo-file-system';
import * as Application from 'expo-application';
import {
  ensureCacheDir,
  saveToCache,
  loadFromCache,
  fetchFullData,
  fetchMetadata,
  fetchItemsByIds,
  processAndCacheImages,
  determineSyncActions,
  mergeUpdates,
  getCurrentAppVersion,
  getCacheVersion,
  saveCacheVersion,
  isCacheVersionValid,
  wipeCache
} from '../../contexts/api.service';

// Mock the modules
jest.mock('expo-file-system');
jest.mock('expo-application');

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockApplication = Application as jest.Mocked<typeof Application>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('File System Operations', () => {
    describe('ensureCacheDir', () => {
      it('should create cache directory if it does not exist', async () => {
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
        mockFileSystem.makeDirectoryAsync.mockResolvedValue();

        await ensureCacheDir();

        expect(mockFileSystem.getInfoAsync).toHaveBeenCalled();
        expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
          expect.stringContaining('cache/'),
          { intermediates: true }
        );
      });

      it('should not create directory if it already exists', async () => {
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);

        await ensureCacheDir();

        expect(mockFileSystem.getInfoAsync).toHaveBeenCalled();
        expect(mockFileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
      });
    });

    describe('saveToCache', () => {
      it('should save data to cache successfully', async () => {
        const testData = { 
          data: { id: 1, date_created: '2023-01-01', date_updated: '2023-01-01', text: 'test' } as any, 
          lastItemUpdateTimestamp: '2023-01-01' 
        };
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
        mockFileSystem.makeDirectoryAsync.mockResolvedValue();
        mockFileSystem.writeAsStringAsync.mockResolvedValue();

        await saveToCache('test_key', testData);

        expect(mockFileSystem.writeAsStringAsync).toHaveBeenCalledWith(
          expect.stringContaining('test_key.json'),
          JSON.stringify(testData)
        );
      });

      it('should handle save errors gracefully', async () => {
        const testData = { 
          data: { id: 1, date_created: '2023-01-01', date_updated: '2023-01-01', text: 'test' } as any, 
          lastItemUpdateTimestamp: '2023-01-01' 
        };
        mockFileSystem.getInfoAsync.mockRejectedValue(new Error('File system error'));

        await expect(saveToCache('test_key', testData)).resolves.not.toThrow();
      });
    });

    describe('loadFromCache', () => {
      it('should load data from cache successfully', async () => {
        const testData = { 
          data: { id: 1, date_created: '2023-01-01', date_updated: '2023-01-01', text: 'test' } as any, 
          lastItemUpdateTimestamp: '2023-01-01' 
        };
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
        mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(testData));

        const result = await loadFromCache('test_key');

        expect(result).toEqual(testData);
      });

      it('should return null if cache file does not exist', async () => {
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);

        const result = await loadFromCache('test_key');

        expect(result).toBeNull();
      });

      it('should handle load errors gracefully', async () => {
        mockFileSystem.getInfoAsync.mockRejectedValue(new Error('File system error'));

        const result = await loadFromCache('test_key');

        expect(result).toBeNull();
      });
    });
  });

  describe('API Operations', () => {
    describe('fetchFullData', () => {
      it('should fetch data successfully', async () => {
        const mockData = { id: 1, name: 'test' };
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: mockData })
        });

        const result = await fetchFullData('/test-endpoint');

        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/test-endpoint'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: expect.stringContaining('Bearer')
            })
          })
        );
      });

      it('should handle API errors', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 404,
          text: () => Promise.resolve('Not Found')
        });

        await expect(fetchFullData('/test-endpoint')).rejects.toThrow();
      });
    });

    describe('fetchMetadata', () => {
      it('should fetch metadata with correct query parameters', async () => {
        const mockMetadata = [{ id: 1, date_updated: '2023-01-01' }];
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: mockMetadata })
        });

        const result = await fetchMetadata('/test-endpoint');

        expect(result).toEqual(mockMetadata);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('?fields=id,date_updated'),
          expect.any(Object)
        );
      });
    });

    describe('fetchItemsByIds', () => {
      it('should fetch items by IDs', async () => {
        const mockItems = [{ id: 1 }, { id: 2 }];
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: mockItems })
        });

        const result = await fetchItemsByIds('/test-endpoint', [1, 2]);

        expect(result).toEqual(mockItems);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('filter[id][_in]=1,2'),
          expect.any(Object)
        );
      });

      it('should return empty array for empty IDs', async () => {
        const result = await fetchItemsByIds('/test-endpoint', []);
        expect(result).toEqual([]);
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Sync Logic', () => {
    describe('determineSyncActions', () => {
      it('should identify items to fetch and delete', () => {
        const localData = [
          { id: 1, date_updated: '2023-01-01' },
          { id: 2, date_updated: '2023-01-01' },
          { id: 3, date_updated: '2023-01-01' }
        ];
        const remoteItems = [
          { id: 1, date_updated: '2023-01-02' }, // Updated
          { id: 2, date_updated: '2023-01-01' }, // Same
          { id: 4, date_updated: '2023-01-01' }  // New
        ];

        const result = determineSyncActions(localData, remoteItems);

        expect(result.itemsToFetchIds).toContain(1); // Updated
        expect(result.itemsToFetchIds).toContain(4); // New
        expect(result.itemsToFetchIds).not.toContain(2); // Same
        expect(result.itemsToDeleteIds).toContain(3); // Deleted from remote
      });

      it('should handle null timestamps correctly', () => {
        const localData = [{ id: 1, date_updated: null }];
        const remoteItems = [{ id: 1, date_updated: '2023-01-01' }];

        const result = determineSyncActions(localData, remoteItems);

        expect(result.itemsToFetchIds).toContain(1);
      });
    });

    describe('mergeUpdates', () => {
      it('should merge updates correctly', () => {
        const localData = [
          { id: 1, name: 'old' },
          { id: 2, name: 'same' },
          { id: 3, name: 'delete' }
        ];
        const fetchedItems = [
          { id: 1, name: 'updated' },
          { id: 4, name: 'new' }
        ];
        const itemsToDelete = [3];

        const result = mergeUpdates(localData, fetchedItems, itemsToDelete);

        expect(result).toHaveLength(3);
        expect(result.find(item => item.id === 1)?.name).toBe('updated');
        expect(result.find(item => item.id === 2)?.name).toBe('same');
        expect(result.find(item => item.id === 4)?.name).toBe('new');
        expect(result.find(item => item.id === 3)).toBeUndefined();
      });
    });
  });

  describe('Version Management', () => {
    describe('getCurrentAppVersion', () => {
      it('should return current app version', () => {
        // Test with default mock values
        const version = getCurrentAppVersion();

        expect(version).toBe('1.0.0-1'); // Using mock values from setup
      });

      it('should handle version concatenation correctly', () => {
        // Test the logic with known mock values
        const version = getCurrentAppVersion();
        
        expect(version).toMatch(/^\d+\.\d+\.\d+-\d+$/); // Version format: x.y.z-build
        expect(typeof version).toBe('string');
      });
    });

    describe('isCacheVersionValid', () => {
      it('should return true for matching versions', async () => {
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
        mockFileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify({ version: '1.0.0-1' }) // Match mock app version
        );

        const result = await isCacheVersionValid();

        expect(result).toBe(true);
      });

      it('should return false for different versions', async () => {
        mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
        mockFileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify({ version: '2.0.0-42' }) // Different from mock app version
        );

        const result = await isCacheVersionValid();

        expect(result).toBe(false);
      });
    });

    describe('wipeCache', () => {
      it('should wipe cache directory successfully', async () => {
        mockFileSystem.getInfoAsync
          .mockResolvedValueOnce({ exists: true } as any)  // For wipe check
          .mockResolvedValueOnce({ exists: false } as any); // For ensureCacheDir
        mockFileSystem.deleteAsync.mockResolvedValue();
        mockFileSystem.makeDirectoryAsync.mockResolvedValue();

        await wipeCache();

        expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith(
          expect.stringContaining('cache/'),
          { idempotent: true }
        );
        expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalled();
      });
    });
  });
});