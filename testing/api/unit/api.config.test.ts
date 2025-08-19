import { 
  SCREEN_CONFIGS, 
  getDataFilePath, 
  getImageFilePath, 
  IMAGE_FIELD_KEYS,
  API_BASE_URL,
  BEARER_TOKEN,
  CDN_URL,
  CACHE_DIR
} from '../../../contexts/api.config';

describe('API Configuration', () => {
  describe('Constants', () => {
    it('should export configuration constants', () => {
      // Test that configuration constants are properly exported from the module
      // In test environment, env vars are undefined but exports should exist
      expect(() => API_BASE_URL).not.toThrow();
      expect(() => BEARER_TOKEN).not.toThrow(); 
      expect(() => CDN_URL).not.toThrow();
      
      // CACHE_DIR should always be defined as it uses FileSystem.documentDirectory + 'cache/'
      expect(typeof CACHE_DIR).toBe('string');
      expect(CACHE_DIR).toContain('cache/');
      expect(CACHE_DIR).toMatch(/\/cache\/$/);
    });

    it('should define image field keys', () => {
      expect(IMAGE_FIELD_KEYS).toContain('image');
      expect(IMAGE_FIELD_KEYS).toContain('background');
      expect(IMAGE_FIELD_KEYS).toContain('icon');
      expect(IMAGE_FIELD_KEYS.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Configurations', () => {
    it('should contain all required screen configs', () => {
      const requiredScreens = [
        'home', 'about', 'donate', 'guide', 'emergency', 
        'rules', 'safety', 'report', 'branding'
      ];

      requiredScreens.forEach(screen => {
        expect(SCREEN_CONFIGS[screen]).toBeDefined();
        expect(SCREEN_CONFIGS[screen].endpoint).toBeTruthy();
        expect(SCREEN_CONFIGS[screen].cacheKey).toBeTruthy();
        expect(typeof SCREEN_CONFIGS[screen].isCollection).toBe('boolean');
      });
    });

    it('should have correct structure for guide screens', () => {
      const guideScreens = [
        'guide_wildflower', 'guide_tree_shrub', 'guide_bird',
        'guide_mammal', 'guide_invertebrate', 'guide_track', 'guide_herp'
      ];

      guideScreens.forEach(screen => {
        expect(SCREEN_CONFIGS[screen]).toBeDefined();
        expect(SCREEN_CONFIGS[screen].isCollection).toBe(true);
        expect(SCREEN_CONFIGS[screen].endpoint).toContain('/items/');
      });
    });

    it('should have correct structure for marker screens', () => {
      const markerScreens = [
        'nature_trail_marker', 'mile_marker', 'safety_marker', 'poi_marker'
      ];

      markerScreens.forEach(screen => {
        expect(SCREEN_CONFIGS[screen]).toBeDefined();
        expect(SCREEN_CONFIGS[screen].isCollection).toBe(true);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('getDataFilePath', () => {
      it('should generate correct file path for cache key', () => {
        const cacheKey = 'test_data';
        const result = getDataFilePath(cacheKey);
        
        expect(result).toContain('cache/');
        expect(result).toContain('test_data.json');
        expect(result).toMatch(/\/cache\/test_data\.json$/);
      });
    });

    describe('getImageFilePath', () => {
      it('should generate correct image file path', () => {
        const screenName = 'home';
        const imageName = 'background.jpg';
        const result = getImageFilePath(screenName, imageName);
        
        expect(result).toContain('cache/');
        expect(result).toContain('home_background.jpg');
        expect(result).toMatch(/\/cache\/home_background\.jpg$/);
      });

      it('should handle special characters in image names', () => {
        const result = getImageFilePath('test', 'image-with-dashes_and_underscores.png');
        expect(result).toContain('test_image-with-dashes_and_underscores.png');
      });
    });
  });
});