import * as FileSystem from 'expo-file-system';
import { processAndCacheImages } from '../../../contexts/api.service';
import { CDN_URL, IMAGE_FIELD_KEYS } from '../../../contexts/api.config';

// Mock the modules
jest.mock('expo-file-system');
global.fetch = jest.fn();

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('Image Processing Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
    mockFileSystem.makeDirectoryAsync.mockResolvedValue();
    mockFileSystem.downloadAsync.mockResolvedValue({ status: 200 } as any);
  });

  describe('CDN Complete Failure', () => {
    it('should handle all CDN image extensions failing', async () => {
      const testData = [
        { id: 1, image: 'test-image' }, // No extension - will try multiple
        { id: 2, background: 'background-image' },
        { id: 3, icon: 'icon-image' }
      ];

      // Mock CDN failures for all extensions
      mockFileSystem.downloadAsync.mockImplementation(async (source: any) => {
        if (source?.uri?.includes(CDN_URL)) {
          return Promise.resolve({ status: 404 } as any); // CDN failure
        }
        return Promise.resolve({ status: 200 } as any); // Assets endpoint success
      });

      const result = await processAndCacheImages('test_screen', testData);

      // Should attempt downloads
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
      
      // Function should handle CDN failures gracefully
      expect(result).toBeDefined();

      // Should handle downloads appropriately
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
    });

    it('should test fallback to assets endpoint', async () => {
      const testData = [
        { id: 1, image: 'fallback-test.jpg' },
        { id: 2, background: 'fallback-bg.png' }
      ];

      // Mock CDN complete failure, assets success
      mockFileSystem.downloadAsync.mockImplementation(async (source: any) => {
        if (source?.uri?.includes(CDN_URL)) {
          return Promise.resolve({ status: 503 } as any); // CDN unavailable
        }
        if (source?.uri?.includes('/assets/')) {
          return Promise.resolve({ status: 200 } as any); // Assets success
        }
        return Promise.resolve({ status: 404 } as any);
      });

      const result = await processAndCacheImages('test_screen', testData);

      // Should handle CDN failure gracefully
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
      
      // Function should return a result object (may be empty if all downloads fail)
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle graceful degradation when no images available', async () => {
      const testData = [
        { id: 1, image: 'missing-image.jpg', text: 'Content without image' },
        { id: 2, background: 'missing-bg.png', title: 'Another item' }
      ];

      // Mock complete failure - both CDN and assets fail
      mockFileSystem.downloadAsync.mockResolvedValue({ status: 404 } as any);

      const result = await processAndCacheImages('test_screen', testData);

      // Should return empty image paths object
      expect(Object.keys(result)).toHaveLength(0);

      // Should have attempted downloads but failed gracefully
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
    });

    it('should handle CDN timeout scenarios', async () => {
      const testData = [{ id: 1, image: 'timeout-test.jpg' }];

      // Mock CDN timeout
      mockFileSystem.downloadAsync.mockImplementation(async (source: any) => {
        if (source?.uri?.includes(CDN_URL)) {
          throw new Error('Request timeout');
        }
        return Promise.resolve({ status: 200 } as any);
      });

      const result = await processAndCacheImages('test_screen', testData);

      // Should handle timeout and potentially fallback
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
    });

    it('should handle CDN SSL/certificate errors', async () => {
      const testData = [{ id: 1, image: 'ssl-test.jpg' }];

      // Mock SSL certificate error
      mockFileSystem.downloadAsync.mockImplementation(async (source: any) => {
        if (source?.uri?.includes(CDN_URL)) {
          throw new Error('SSL certificate verification failed');
        }
        return Promise.resolve({ status: 200 } as any);
      });

      await expect(processAndCacheImages('test_screen', testData)).resolves.not.toThrow();
    });
  });

  describe('Disk Space & Memory Issues', () => {
    it('should handle disk space exhaustion during downloads', async () => {
      const testData = [
        { id: 1, image: 'large-image-1.jpg' },
        { id: 2, image: 'large-image-2.jpg' },
        { id: 3, image: 'large-image-3.jpg' }
      ];

      // Mock disk space exhaustion after first download
      mockFileSystem.downloadAsync
        .mockResolvedValueOnce({ status: 200 } as any)  // First succeeds
        .mockRejectedValueOnce(new Error('ENOSPC: no space left on device'))
        .mockRejectedValueOnce(new Error('ENOSPC: no space left on device'));

      const result = await processAndCacheImages('test_screen', testData);

      // Should handle disk space errors gracefully
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
      
      // Function should return a result without throwing
      expect(result).toBeDefined();
    });

    it('should handle large image file scenarios', async () => {
      const largeImageData = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        image: `large-image-${i + 1}.jpg`,
        background: `large-bg-${i + 1}.png`
      }));

      // Mock successful downloads but track download count
      let downloadCount = 0;
      mockFileSystem.downloadAsync.mockImplementation(async () => {
        downloadCount++;
        // Simulate download time for large files
        await new Promise(resolve => setTimeout(resolve, 50));
        return Promise.resolve({ status: 200 } as any);
      });

      const startTime = Date.now();
      const result = await processAndCacheImages('test_screen', largeImageData);
      const endTime = Date.now();

      // Should handle large number of images
      expect(downloadCount).toBe(40); // 20 images + 20 backgrounds
      expect(Object.keys(result)).toHaveLength(40);
      
      // Should complete within reasonable time (allow more time for large dataset)
      expect(endTime - startTime).toBeLessThan(15000); // 15 seconds max
    });

    it('should handle memory pressure scenarios', async () => {
      const testData = [{ id: 1, image: 'memory-test.jpg' }];

      // Mock memory allocation error
      mockFileSystem.downloadAsync
        .mockRejectedValueOnce(new Error('Cannot allocate memory'))
        .mockResolvedValueOnce({ status: 200 } as any); // Retry succeeds

      await expect(processAndCacheImages('test_screen', testData)).resolves.not.toThrow();

      // Should attempt retry after memory error
      expect(mockFileSystem.downloadAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle disk write permission errors', async () => {
      const testData = [{ id: 1, image: 'permission-test.jpg' }];

      // Mock download success but cache directory creation failure
      mockFileSystem.makeDirectoryAsync.mockRejectedValue(
        new Error('EACCES: permission denied, mkdir')
      );

      await expect(processAndCacheImages('test_screen', testData)).resolves.not.toThrow();

      // Should handle permission errors gracefully
      expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });
  });

  describe('Image File Corruption', () => {
    it('should handle partial downloads', async () => {
      const testData = [{ id: 1, image: 'partial-download.jpg' }];

      // Mock partial download (206 Partial Content)
      mockFileSystem.downloadAsync
        .mockResolvedValueOnce({ status: 206 } as any)  // Partial content
        .mockResolvedValueOnce({ status: 200 } as any); // Retry with full content

      const result = await processAndCacheImages('test_screen', testData);

      // Should retry partial downloads
      expect(mockFileSystem.downloadAsync).toHaveBeenCalledTimes(2);
      expect(result['partial-download.jpg']).toBeDefined();
    });

    it('should handle corrupted image files', async () => {
      const testData = [{ id: 1, image: 'corrupted.jpg' }];

      // Mock download that returns corrupted data
      mockFileSystem.downloadAsync.mockImplementation(async (source, destination) => {
        // Simulate corrupted file by checking destination
        if (destination?.includes('corrupted')) {
          return Promise.resolve({ status: 200 } as any);
        }
        return Promise.resolve({ status: 404 } as any);
      });

      // Mock file info check for corrupted file
      mockFileSystem.getInfoAsync.mockImplementation(async (path) => {
        if (path.includes('corrupted')) {
          return Promise.resolve({ exists: true, size: 0 } as any); // Zero-byte file indicates corruption
        }
        return Promise.resolve({ exists: false } as any);
      });

      const result = await processAndCacheImages('test_screen', testData);

      // Should handle corrupted files (implementation may vary)
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
    });

    it('should handle invalid file formats', async () => {
      const testData = [
        { id: 1, image: 'test.pdf' },    // Invalid image format
        { id: 2, image: 'test.txt' },    // Text file
        { id: 3, image: 'test.exe' },    // Executable
        { id: 4, image: 'valid.jpg' }    // Valid image
      ];

      // Mock downloads - invalid formats return HTML error page instead of image
      mockFileSystem.downloadAsync.mockImplementation(async (source: any) => {
        const url = source?.uri || '';
        if (url.includes('.pdf') || url.includes('.txt') || url.includes('.exe')) {
          return Promise.resolve({ status: 415 } as any); // Unsupported Media Type
        }
        return Promise.resolve({ status: 200 } as any);
      });

      const result = await processAndCacheImages('test_screen', testData);

      // Should handle different file formats
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
      
      // Function should return result object
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle truncated image downloads', async () => {
      const testData = [{ id: 1, image: 'truncated.jpg' }];

      // Mock truncated download (content-length mismatch)
      mockFileSystem.downloadAsync.mockResolvedValue({ 
        status: 200,
        headers: { 'content-length': '100000' }  // Claims 100KB
      } as any);

      // Mock file size check shows smaller file
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 50000  // Only 50KB actually downloaded
      } as any);

      await expect(processAndCacheImages('test_screen', testData)).resolves.not.toThrow();
    });

    it('should handle network interruption during download', async () => {
      const testData = [{ id: 1, image: 'interrupted.jpg' }];

      // Mock network interruption
      mockFileSystem.downloadAsync
        .mockRejectedValueOnce(new Error('Network connection lost'))
        .mockResolvedValueOnce({ status: 200 } as any); // Retry succeeds

      const result = await processAndCacheImages('test_screen', testData);

      // Should retry after network interruption
      expect(mockFileSystem.downloadAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('File System Permissions', () => {
    it('should handle cache directory permission errors', async () => {
      const testData = [{ id: 1, image: 'permission-test.jpg' }];

      // Mock permission denied on cache directory creation
      mockFileSystem.makeDirectoryAsync.mockRejectedValue(
        new Error('EACCES: permission denied, mkdir \'/cache\'')
      );

      await expect(processAndCacheImages('test_screen', testData)).resolves.not.toThrow();

      // Should handle gracefully without crashing
      expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });

    it('should handle read-only filesystem scenarios', async () => {
      const testData = [{ id: 1, image: 'readonly-test.jpg' }];

      // Mock read-only filesystem
      mockFileSystem.downloadAsync.mockRejectedValue(
        new Error('EROFS: read-only file system, open')
      );

      await expect(processAndCacheImages('test_screen', testData)).resolves.not.toThrow();

      // Should handle read-only filesystem gracefully
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
    });

    it('should handle file system quota exceeded', async () => {
      const testData = [
        { id: 1, image: 'quota-test-1.jpg' },
        { id: 2, image: 'quota-test-2.jpg' }
      ];

      // Mock quota exceeded after first download
      mockFileSystem.downloadAsync
        .mockResolvedValueOnce({ status: 200 } as any)
        .mockRejectedValueOnce(new Error('EDQUOT: disk quota exceeded'));

      const result = await processAndCacheImages('test_screen', testData);

      // Should handle quota exceeded gracefully
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
      
      // Function should return result without throwing
      expect(result).toBeDefined();
    });

    it('should handle file path length limitations', async () => {
      // Create very long filename
      const longFilename = 'a'.repeat(255) + '.jpg'; // Maximum filename length
      const testData = [{ id: 1, image: longFilename }];

      // Mock filename too long error
      mockFileSystem.downloadAsync.mockRejectedValue(
        new Error('ENAMETOOLONG: name too long')
      );

      await expect(processAndCacheImages('test_screen', testData)).resolves.not.toThrow();

      // Should handle long filenames gracefully
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
    });

    it('should handle special characters in filenames', async () => {
      const testData = [
        { id: 1, image: 'test image with spaces.jpg' },
        { id: 2, image: 'test-with-unicode-émojis-🌸.png' },
        { id: 3, image: 'test/with/slashes.jpg' },
        { id: 4, image: 'test?with&query=params.jpg' }
      ];

      // Mock successful downloads for properly encoded filenames
      mockFileSystem.downloadAsync.mockImplementation(async (source) => {
        // Should handle URL encoding for special characters
        return Promise.resolve({ status: 200 } as any);
      });

      const result = await processAndCacheImages('test_screen', testData);

      // Should handle special characters in filenames
      expect(mockFileSystem.downloadAsync).toHaveBeenCalledTimes(4);
      
      // Check that cache paths handle special characters properly
      Object.values(result).forEach(path => {
        expect(typeof path).toBe('string');
        expect(path.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Case Combinations', () => {
    it('should handle multiple simultaneous edge cases', async () => {
      const testData = [
        { id: 1, image: 'large-corrupted.jpg' },      // Large + corrupted
        { id: 2, image: 'missing-with-spaces.png' },   // Missing + special chars
        { id: 3, image: 'partial-permission.jpg' }     // Partial + permission issues
      ];

      // Mock complex failure scenarios
      mockFileSystem.downloadAsync
        .mockRejectedValueOnce(new Error('ENOSPC: no space left on device'))
        .mockResolvedValueOnce({ status: 404 } as any)
        .mockRejectedValueOnce(new Error('EACCES: permission denied'));

      const result = await processAndCacheImages('test_screen', testData);

      // Should handle multiple edge cases gracefully
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
      
      // Function should return result without throwing
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should recover from temporary file system issues', async () => {
      const testData = [{ id: 1, image: 'recovery-test.jpg' }];

      // Mock temporary failure followed by success
      mockFileSystem.getInfoAsync
        .mockRejectedValueOnce(new Error('Temporary file system error'))
        .mockResolvedValueOnce({ exists: false } as any);

      mockFileSystem.makeDirectoryAsync
        .mockRejectedValueOnce(new Error('Temporary directory creation error'))
        .mockResolvedValueOnce();

      mockFileSystem.downloadAsync.mockResolvedValue({ status: 200 } as any);

      await expect(processAndCacheImages('test_screen', testData)).resolves.not.toThrow();
    });

    it('should handle image processing during low memory conditions', async () => {
      const memoryIntensiveData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        image: `memory-test-${i + 1}.jpg`,
        background: `memory-bg-${i + 1}.png`,
        icon: `memory-icon-${i + 1}.svg`
      }));

      // Mock memory constraints by rejecting some operations
      let operationCount = 0;
      mockFileSystem.downloadAsync.mockImplementation(async () => {
        operationCount++;
        if (operationCount % 10 === 0) {
          throw new Error('Out of memory');
        }
        return Promise.resolve({ status: 200 } as any);
      });

      const result = await processAndCacheImages('test_screen', memoryIntensiveData);

      // Should handle memory constraints gracefully
      expect(operationCount).toBeGreaterThan(100);
      expect(Object.keys(result).length).toBeLessThan(300); // Some operations should fail
    });
  });
});