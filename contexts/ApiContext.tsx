import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';

// Types
interface HomeData {
  reserve_status: string;
  backgroundPath?: string;
}

interface ApiContextType {
  homeData: HomeData | null;
  isLoading: boolean;
  fetchHomeData: () => Promise<void>;
}

// Create context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Constants
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
const BEARER_TOKEN = process.env.EXPO_PUBLIC_API_KEY
const CACHE_DIR = FileSystem.documentDirectory + 'cache/';
const HOME_DATA_FILE = CACHE_DIR + 'home_data.json';
const BACKGROUND_IMAGE_FILE = CACHE_DIR + 'background_image.jpg';

// Provider component
export function ApiProvider({ children }: { children: ReactNode }) {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ensure cache directory exists
  const ensureCacheDir = async () => {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  };

  // Load cached data
  const loadCachedData = async (): Promise<HomeData | null> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(HOME_DATA_FILE);
      if (fileInfo.exists) {
        const cachedData = await FileSystem.readAsStringAsync(HOME_DATA_FILE);
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.log('Error loading cached data:', error);
    }
    return null;
  };

  // Save data to cache
  const saveToCache = async (data: HomeData) => {
    try {
      await ensureCacheDir();
      await FileSystem.writeAsStringAsync(HOME_DATA_FILE, JSON.stringify(data));
    } catch (error) {
      console.log('Error saving to cache:', error);
    }
  };

  // Download and cache background image
  const downloadBackgroundImage = async (backgroundImageName: string): Promise<string | undefined> => {
    try {
      await ensureCacheDir();
      
      // Check if image already exists
      // Need more fleshed out chaching 
      // Maybe we check the time stamp of the home data agains the new data
      
      // const imageInfo = await FileSystem.getInfoAsync(BACKGROUND_IMAGE_FILE);
      // if (imageInfo.exists) {
      //   return BACKGROUND_IMAGE_FILE;
      // }

      // Download image
      const downloadResult = await FileSystem.downloadAsync(
        `${API_BASE_URL}/assets/${backgroundImageName}`,
        BACKGROUND_IMAGE_FILE,
        {
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
          },
        }
      );

      if (downloadResult.status === 200) {
        return BACKGROUND_IMAGE_FILE;
      }

    } catch (error) {
      console.log('Error downloading background image:', error);
    }
    return undefined;
  };

  // Main fetch function
  const fetchHomeData = async () => {
    setIsLoading(true);
    
    try {
      // First, try to load cached data
      const cachedData = await loadCachedData();

      if (cachedData) {
        setHomeData(cachedData);
      }

      // Fetch fresh data from API
      const response = await fetch(`${API_BASE_URL}/items/home/`, {
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
      
      // If there's a background image, download it
      let backgroundImagePath: string | undefined;
      
      if (res.data.background) {
        backgroundImagePath = await downloadBackgroundImage(res.data.background);
      }

      const homeData: HomeData = {
        reserve_status: res.data.reserve_status || 'No status available',
        backgroundPath: backgroundImagePath,
      };

      // Save to cache and update state
      await saveToCache(homeData);
      setHomeData(homeData);

    } catch (error) {
      console.log('Error fetching home data:', error);
      
      // If fetch fails and we don't have cached data yet, try to load it
      if (!homeData) {
        const cachedData = await loadCachedData();
        if (cachedData) {
          setHomeData(cachedData);
        } else {
          // Fallback data if everything fails
          setHomeData({
            reserve_status: 'Unable to load reserve status. Please check your connection.',
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value: ApiContextType = {
    homeData,
    isLoading,
    fetchHomeData,
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