import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';

// Screen-specific data interfaces
export interface HomeData {
  id: number;
  date_created: string;
  date_updated: string;
  reserve_status: string;
  background?: string;
}

export interface AboutData {
  id: number;
  date_created: string;
  date_updated: string;
  text: string;
  link_text: string;
  link: string;
  background?: string;
}

// Add more screen data types as needed
export interface DonateData {
  id: number;
  date_created: string;
  date_updated: string;
  text: string;
  link: string;
  background?: string;
}

export interface GuideData{
  id: number;
  date_created: string;
  date_updated: string;
  background?: string;
}

export interface EmergencyData{
  id: number;
  date_created: string;
  date_updated: string;
  contact_1_message: string;
  contact_1_number: string;
  contact_2_message: string;
  contact_2_number: string;
  background?: string;
}

export interface Rule {
  id: number;
  date_created: string;
  date_updated: string | null;
  icon: string;
  text: string;
}

export interface RulesData{
  id: number;
  date_created: string;
  date_updated: string;
  background?: string;
  rules_image?: string;
  rules: Rule[];
}

export interface SafetyData {
  id: number;
  date_created: string;
  date_updated: string;
  background?: string;
  safety_image?: string;
  emergency_contact: string;
  safety_bulletpoints: string;
}

export interface ReportData {
  id: number;
  date_created: string;
  date_updated: string;
  background?: string;
  instruction_text: string;
  file_upload_text: string;
  contact_info_text: string;
  description_text: string;
}

// Union type for all screen data
type ScreenData = HomeData 
                  | AboutData 
                  | DonateData
                  | GuideData
                  | EmergencyData
                  | RulesData
                  | SafetyData
                  | ReportData;

// Screen configuration
interface ScreenConfig {
  endpoint: string;
  cacheKey: string;
}

// Context state for cached data - simplified with unified image handling
interface CachedScreenData {
  data: ScreenData;
  imagePaths?: Record<string, string>; // All images including background
  timestamp: number;
}

interface ApiContextType {
  getScreenData: <T extends ScreenData>(screenName: string) => T | null;
  fetchScreenData: <T extends ScreenData>(screenName: string) => Promise<T | null>;
  getImagePath: (screenName: string, imageName: string) => string | undefined; // Unified image getter
  isLoading: (screenName: string) => boolean;
}

// Create context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Constants
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.EXPO_PUBLIC_API_KEY;
const CACHE_DIR = FileSystem.documentDirectory + 'cache/';

// Screen configurations
const SCREEN_CONFIGS: Record<string, ScreenConfig> = {
  home: {
    endpoint: '/items/home/',
    cacheKey: 'home_data'
  },
  about: {
    endpoint: '/items/about/',
    cacheKey: 'about_data'
  },
  donate: {
    endpoint: '/items/donate/',
    cacheKey: 'donate_data'
  },
  guide: {
   endpoint: '/items/guide/',
   cacheKey: 'guide_data'
  },
  emergency: {
    endpoint: '/items/emergency/',
    cacheKey: 'emergency_data'
  },
  rules: {
    endpoint: '/rules/',
    cacheKey: 'rules_data'
  },
  safety: {
    endpoint: '/items/safety/',
    cacheKey: 'safety_data'
  },
  report: {
    endpoint: '/items/reports/',
    cacheKey: 'report_data'
  }

  // Add new screens like this:
  // screen: {
  //   endpoint: '/endpoint/screen/',
  //   cacheKey: 'screen_data'
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

  // Download and cache image
  const downloadImage = async (screenName: string, imageName: string): Promise<string | undefined> => {
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
      console.log(`Error downloading image ${imageName} for ${screenName}:`, error);
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

      // Handle all screen images in one unified approach
      let imagePaths: Record<string, string> = {};

      // Handle background image if it exists (use 'background' as key)
      if ('background' in screenData && screenData.background) {
        const backgroundPath = await downloadImage(screenName, screenData.background);
        if (backgroundPath) {
          imagePaths['background'] = backgroundPath;
        }
      }

      // Handle screen-specific images

      // Handle screen-specific images
      if (screenName === 'rules') {
        // Handle rules image
        if ('rules_image' in screenData && screenData.rules_image) {
          const rulesImagePath = await downloadImage(screenName, screenData.rules_image);
          if (rulesImagePath) {
            imagePaths['rules_image'] = rulesImagePath;
          }
        }

        // Handle rules icons
        if ('rules' in screenData && Array.isArray((screenData as RulesData).rules)) {
          const rules = (screenData as RulesData).rules;
          for (const rule of rules) {
            if (rule.icon) {
              const iconPath = await downloadImage(screenName, rule.icon);
              if (iconPath) {
                imagePaths[rule.icon] = iconPath;
              }
            }
          }
        }
      }

      // Add safety screen handling
      if (screenName === 'safety') {
        // Handle safety image
        if ('safety_image' in screenData && screenData.safety_image) {
          const safetyImagePath = await downloadImage(screenName, screenData.safety_image);
          if (safetyImagePath) {
            imagePaths['safety_image'] = safetyImagePath;
          }
        }
      }

      const cacheData: CachedScreenData = {
        data: screenData,
        imagePaths: Object.keys(imagePaths).length > 0 ? imagePaths : undefined,
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

  // Unified function to get any image path by name
  const getImagePath = (screenName: string, imageName: string): string | undefined => {
    return screenDataCache[screenName]?.imagePaths?.[imageName];
  };

  // Check if screen is loading
  const isLoading = (screenName: string): boolean => {
    return loadingStates[screenName] || false;
  };

  const value: ApiContextType = {
    getScreenData,
    fetchScreenData,
    getImagePath, // Unified image path getter
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
    getImagePath: (imageName: string) => api.getImagePath(screenName, imageName), // Get any image by name
    isLoading: api.isLoading(screenName),
    fetch: () => api.fetchScreenData<T>(screenName),
  };
}