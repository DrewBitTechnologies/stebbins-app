import * as ApiService from '../../contexts/api.service';
import { 
  saveToCache, 
  loadFromCache, 
  fetchFullData, 
  determineSyncActions, 
  mergeUpdates,
  processAndCacheImages,
  isCacheVersionValid 
} from '../../contexts/api.service';

// Mock the service layer
jest.mock('../../contexts/api.service');
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Flow Integration', () => {
    it('should complete full data fetch -> cache -> load cycle', async () => {
      // Mock the full data flow
      const mockData = {
        id: 1,
        date_created: '2023-01-01',
        date_updated: '2023-01-01',
        text: 'Test content',
        reserve_status: 'active'
      } as any;

      const mockCachedData = {
        data: mockData,
        imagePaths: { 'test.jpg': '/cache/test.jpg' },
        lastItemUpdateTimestamp: '2023-01-01'
      };

      // Setup mocks for the flow
      mockApiService.fetchFullData.mockResolvedValue(mockData);
      mockApiService.processAndCacheImages.mockResolvedValue({ 'test.jpg': '/cache/test.jpg' });
      mockApiService.saveToCache.mockResolvedValue();
      mockApiService.loadFromCache.mockResolvedValue(mockCachedData);

      // Test the flow
      const fetchedData = await fetchFullData('/test-endpoint');
      expect(fetchedData).toEqual(mockData);

      const imagePaths = await processAndCacheImages('test', [mockData]);
      expect(imagePaths).toEqual({ 'test.jpg': '/cache/test.jpg' });

      await saveToCache('test_key', mockCachedData);
      expect(mockApiService.saveToCache).toHaveBeenCalledWith('test_key', mockCachedData);

      const loadedData = await loadFromCache('test_key');
      expect(loadedData).toEqual(mockCachedData);
    });

    it('should handle sync workflow integration', async () => {
      const localData = [
        { id: 1, date_updated: '2023-01-01' },
        { id: 2, date_updated: '2023-01-01' }
      ];

      const remoteItems = [
        { id: 1, date_updated: '2023-01-02' }, // Updated
        { id: 3, date_updated: '2023-01-01' }  // New
      ];

      const fetchedItems = [
        { id: 1, date_updated: '2023-01-02', content: 'updated' },
        { id: 3, date_updated: '2023-01-01', content: 'new' }
      ];

      // Mock the sync process
      mockApiService.determineSyncActions.mockReturnValue({
        itemsToFetchIds: [1, 3],
        itemsToDeleteIds: [2],
        remoteItemMap: new Map(remoteItems.map(item => [item.id, item.date_updated]))
      });

      mockApiService.fetchItemsByIds.mockResolvedValue(fetchedItems);
      mockApiService.mergeUpdates.mockReturnValue([
        { id: 1, date_updated: '2023-01-02', content: 'updated' },
        { id: 3, date_updated: '2023-01-01', content: 'new' }
      ]);

      // Test sync workflow
      const syncActions = determineSyncActions(localData, remoteItems);
      expect(syncActions.itemsToFetchIds).toEqual([1, 3]);
      expect(syncActions.itemsToDeleteIds).toEqual([2]);

      const fetched = await mockApiService.fetchItemsByIds('/test', syncActions.itemsToFetchIds);
      expect(fetched).toEqual(fetchedItems);

      const merged = mergeUpdates(localData, fetched, syncActions.itemsToDeleteIds);
      expect(merged).toHaveLength(2);
      expect(merged.find(item => item.id === 1)?.content).toBe('updated');
      expect(merged.find(item => item.id === 3)?.content).toBe('new');
      expect(merged.find(item => item.id === 2)).toBeUndefined();
    });
  });

  describe('Cache Integration', () => {
    it('should integrate cache versioning with data operations', async () => {
      // Mock version validation
      mockApiService.isCacheVersionValid.mockResolvedValue(true);
      
      const mockCachedData = {
        data: { id: 1, text: 'cached content' } as any,
        lastItemUpdateTimestamp: '2023-01-01'
      };
      
      mockApiService.loadFromCache.mockResolvedValue(mockCachedData);

      // Test cache version integration
      const isValid = await isCacheVersionValid();
      expect(isValid).toBe(true);

      // If valid, should load from cache
      if (isValid) {
        const cachedData = await loadFromCache('test_key');
        expect(cachedData).toEqual(mockCachedData);
      }
    });

    it('should handle cache invalidation workflow', async () => {
      // Mock invalid cache version
      mockApiService.isCacheVersionValid.mockResolvedValue(false);
      
      const freshData = {
        id: 1,
        date_created: '2023-01-01',
        date_updated: '2023-01-02',
        text: 'fresh content'
      } as any;
      
      mockApiService.fetchFullData.mockResolvedValue(freshData);
      mockApiService.processAndCacheImages.mockResolvedValue({});
      mockApiService.saveToCache.mockResolvedValue();

      // Test cache invalidation workflow
      const isValid = await isCacheVersionValid();
      expect(isValid).toBe(false);

      // If invalid, should fetch fresh data
      if (!isValid) {
        const data = await fetchFullData('/test-endpoint');
        expect(data).toEqual(freshData);

        const imagePaths = await processAndCacheImages('test', [data!]);
        expect(imagePaths).toEqual({});

        await saveToCache('test_key', {
          data: data!,
          imagePaths,
          lastItemUpdateTimestamp: (data as any).date_updated
        });
        
        expect(mockApiService.saveToCache).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should gracefully handle API failure -> cache fallback workflow', async () => {
      const cachedData = {
        data: { id: 1, text: 'cached fallback' } as any,
        lastItemUpdateTimestamp: '2023-01-01'
      };

      // Mock API failure followed by cache success
      mockApiService.fetchFullData.mockRejectedValue(new Error('Network error'));
      mockApiService.loadFromCache.mockResolvedValue(cachedData);

      // Test error handling workflow
      let result;
      try {
        result = await fetchFullData('/test-endpoint');
      } catch (error) {
        // API failed, try cache
        result = await loadFromCache('test_key');
      }

      expect(result).toEqual(cachedData);
      expect(mockApiService.fetchFullData).toHaveBeenCalled();
      expect(mockApiService.loadFromCache).toHaveBeenCalled();
    });

    it('should handle complete failure scenario', async () => {
      // Mock both API and cache failures
      mockApiService.fetchFullData.mockRejectedValue(new Error('Network error'));
      mockApiService.loadFromCache.mockResolvedValue(null);

      // Test complete failure workflow
      let result;
      try {
        result = await fetchFullData('/test-endpoint');
      } catch (error) {
        // API failed, try cache
        result = await loadFromCache('test_key');
      }

      expect(result).toBeNull();
      expect(mockApiService.fetchFullData).toHaveBeenCalled();
      expect(mockApiService.loadFromCache).toHaveBeenCalled();
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent operations efficiently', async () => {
      const testData = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        date_created: '2023-01-01',
        date_updated: '2023-01-01',
        text: `Item ${i}`
      })) as any[];

      const cachePromises = testData.map((item, index) => {
        mockApiService.saveToCache.mockResolvedValue();
        return saveToCache(`test_key_${index}`, {
          data: item,
          imagePaths: {},
          lastItemUpdateTimestamp: item.date_updated
        });
      });

      // Test concurrent cache operations
      const startTime = Date.now();
      await Promise.all(cachePromises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete quickly
      expect(mockApiService.saveToCache).toHaveBeenCalledTimes(10);
    });

    it('should handle large dataset processing', async () => {
      const largeDataset = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        image: `image-${i}.jpg`,
        background: `bg-${i}.png`
      }));

      const expectedImagePaths = largeDataset.reduce((acc, item) => {
        acc[`image-${item.id}.jpg`] = `/cache/image-${item.id}.jpg`;
        acc[`bg-${item.id}.png`] = `/cache/bg-${item.id}.png`;
        return acc;
      }, {} as Record<string, string>);

      mockApiService.processAndCacheImages.mockResolvedValue(expectedImagePaths);

      // Test large dataset processing
      const startTime = Date.now();
      const result = await processAndCacheImages('test_screen', largeDataset);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(Object.keys(result)).toHaveLength(100); // 50 images + 50 backgrounds
    });
  });

  describe('Configuration Integration', () => {
    it('should integrate screen configs with data operations', async () => {
      const screenConfigs = {
        home: { endpoint: '/items/home/', cacheKey: 'home_data', isCollection: false },
        guide_wildflower: { endpoint: '/items/wildflower/', cacheKey: 'guide_wildflower', isCollection: true }
      };

      // Test singleton screen
      const homeData = { id: 1, text: 'Home content', reserve_status: 'active' } as any;
      mockApiService.fetchFullData.mockResolvedValueOnce(homeData);
      
      const fetchedHome = await fetchFullData(screenConfigs.home.endpoint);
      expect(fetchedHome).toEqual(homeData);

      // Test collection screen  
      const wildflowerData = [
        { id: 1, common_name: 'Rose', latin_name: 'Rosa' },
        { id: 2, common_name: 'Daisy', latin_name: 'Bellis' }
      ] as any[];
      mockApiService.fetchFullData.mockResolvedValueOnce(wildflowerData);
      
      const fetchedWildflowers = await fetchFullData(screenConfigs.guide_wildflower.endpoint);
      expect(fetchedWildflowers).toEqual(wildflowerData);
      expect(Array.isArray(fetchedWildflowers)).toBe(true);
    });
  });
});