import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';

// Screen-specific data interfaces
export interface HomeData {
  reserve_status: string;
  background?: string;
}

export interface AboutData {
  text: string;
  link_text: string;
  link: string;
  background?: string;
}

// Add more screen data types as needed
// interface RulesData {
//   title: string;
//   rules: string[];
//   background?: string;
// }

// Union type for all screen data
type ScreenData = HomeData | AboutData;

// Screen configuration
interface ScreenConfig {
  endpoint: string;
  cacheKey: string;
}

// Context state for cached data
interface CachedScreenData {
  data: ScreenData;
  backgroundPath?: string;
  timestamp: number;
}

interface ApiContextType {
  getScreenData: <T extends ScreenData>(screenName: string) => T | null;
  fetchScreenData: <T extends ScreenData>(screenName: string) => Promise<T | null>;
  getBackgroundPath: (screenName: string) => string | undefined;
  isLoading: (screenName: string) => boolean;
}

// Create context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Constants
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.EXPO_PUBLIC_API_KEY;
const CACHE_DIR = FileSystem.documentDirectory + 'cache/';

// Screen configurations - easy to add new screens here
const SCREEN_CONFIGS: Record<string, ScreenConfig> = {
  home: {
    endpoint: '/items/home/',
    cacheKey: 'home_data'
  },
  about: {
    endpoint: '/items/about/',
    cacheKey: 'about_data'
  },
  // Add new screens like this:
  // rules: {
  //   endpoint: '/items/rules/',
  //   cacheKey: 'rules_data'
  // },
};

export function ApiProvider({ children }: { children: ReactNode }) {
  const [screenDataCache, setScreenDataCache] = useState<Record<string, CachedScreenData>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Ensure cache directory exists
  const ensureCacheDir = async () => {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  };

  // File paths
  const getDataFilePath = (cacheKey: string) => `${CACHE_DIR}${cacheKey}.json`;
  const getImageFilePath = (screenName: string, imageName: string) => `${CACHE_DIR}${screenName}_${imageName}`;

  // Load cached data for a screen
  const loadCachedData = async (screenName: string): Promise<CachedScreenData | null> => {
    try {
      const config = SCREEN_CONFIGS[screenName];
      if (!config) return null;

      const filePath = getDataFilePath(config.cacheKey);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists) {
        const cachedData = await FileSystem.readAsStringAsync(filePath);
        return JSON.parse(cachedData) as CachedScreenData;
      }
    } catch (error) {
      console.log(`Error loading cached data for ${screenName}:`, error);
    }
    return null;
  };

  // Save data to cache
  const saveToCache = async (screenName: string, data: CachedScreenData) => {
    try {
      await ensureCacheDir();
      const config = SCREEN_CONFIGS[screenName];
      if (!config) return;

      const filePath = getDataFilePath(config.cacheKey);
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));
    } catch (error) {
      console.log(`Error saving to cache for ${screenName}:`, error);
    }
  };

  // Download and cache background image
  const downloadBackgroundImage = async (screenName: string, imageName: string): Promise<string | undefined> => {
    try {
      await ensureCacheDir();
      
      const localPath = getImageFilePath(screenName, imageName);
      
      // Check if image already exists
      const imageInfo = await FileSystem.getInfoAsync(localPath);
      if (imageInfo.exists) {
        return localPath;
      }

      // Download image
      const downloadResult = await FileSystem.downloadAsync(
        `${API_BASE_URL}/assets/${imageName}`,
        localPath,
        {
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
          },
        }
      );

      if (downloadResult.status === 200) {
        return localPath;
      }
    } catch (error) {
      console.log(`Error downloading background image for ${screenName}:`, error);
    }
    return undefined;
  };

  // Set loading state
  const setLoading = (screenName: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [screenName]: loading }));
  };

  // Main fetch function
  const fetchScreenData = async <T extends ScreenData>(screenName: string): Promise<T | null> => {
    const config = SCREEN_CONFIGS[screenName];
    if (!config) {
      console.log(`No configuration found for screen: ${screenName}`);
      return null;
    }

    setLoading(screenName, true);

    try {
      // First, try to load cached data
      const cachedData = await loadCachedData(screenName);
      if (cachedData) {
        setScreenDataCache(prev => ({ ...prev, [screenName]: cachedData }));
      }

      // Fetch fresh data from API
      const response = await fetch(`${API_BASE_URL}${config.endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      const screenData = res.data as T;

      // Handle background image if it exists
      let backgroundPath: string | undefined;
      if ('background' in screenData && screenData.background) {
        backgroundPath = await downloadBackgroundImage(screenName, screenData.background);
      }

      const cacheData: CachedScreenData = {
        data: screenData,
        backgroundPath,
        timestamp: Date.now(),
      };

      // Save to cache and update state
      await saveToCache(screenName, cacheData);
      setScreenDataCache(prev => ({ ...prev, [screenName]: cacheData }));

      return screenData;

    } catch (error) {
      console.log(`Error fetching data for ${screenName}:`, error);
      
      // If fetch fails and we don't have cached data yet, try to load it
      if (!screenDataCache[screenName]) {
        const cachedData = await loadCachedData(screenName);
        if (cachedData) {
          setScreenDataCache(prev => ({ ...prev, [screenName]: cachedData }));
          return cachedData.data as T;
        }
      }

      return screenDataCache[screenName]?.data as T || null;
    } finally {
      setLoading(screenName, false);
    }
  };

  // Get screen data
  const getScreenData = <T extends ScreenData>(screenName: string): T | null => {
    const cached = screenDataCache[screenName];
    return cached ? (cached.data as T) : null;
  };

  // Get background path for a screen
  const getBackgroundPath = (screenName: string): string | undefined => {
    return screenDataCache[screenName]?.backgroundPath;
  };

  // Check if screen is loading
  const isLoading = (screenName: string): boolean => {
    return loadingStates[screenName] || false;
  };

  const value: ApiContextType = {
    getScreenData,
    fetchScreenData,
    getBackgroundPath,
    isLoading,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

// Hook to use the context
export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

// Convenience hook for any screen
export function useScreen<T extends ScreenData>(screenName: string) {
  const api = useApi();
  
  return {
    data: api.getScreenData<T>(screenName),
    backgroundPath: api.getBackgroundPath(screenName),
    isLoading: api.isLoading(screenName),
    fetch: () => api.fetchScreenData<T>(screenName),
  };
}