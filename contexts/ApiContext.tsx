import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';

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

export interface GuideDataItem{
  id: number;
  date_created: string;
  date_updated: string;
  common_name: string;
  latin_name: string;
  description: string;
  color: string[];
  season: string[];
  image: string | null;
}

export type GuideDataItems = GuideDataItem[];

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

export interface NatureTrailMarkerData {
  id: number;
  date_created: string;
  date_updated: string;
  latitude: number;
  longitude: number;
  common_name: string;
  latin_name: string;
  description: string;
  image: string | null;
  marker_id: string;
  color: string[];
  season: string[];
}

export interface MileMarkerTrailData {
  id: number;
  date_created: string;
  date_updated: string;
  latitude: number;
  longitude: number;
  value: number;
}

export type MileMarkers = MileMarkerTrailData[];

type ScreenData = HomeData
                  | AboutData
                  | DonateData
                  | GuideData
                  | EmergencyData
                  | RulesData
                  | SafetyData
                  | ReportData
                  | GuideDataItem
                  | GuideDataItems
                  | NatureTrailMarkerData
                  | MileMarkerTrailData
                  | MileMarkers;

interface ScreenConfig {
  endpoint: string;
  cacheKey: string;
}

interface CachedScreenData {
  data: ScreenData;
  imagePaths?: Record<string, string>;
  timestamp: number;
}

interface ApiContextType {
  getScreenData: <T extends ScreenData>(screenName: string) => T | null;
  fetchScreenData: <T extends ScreenData>(screenName: string) => Promise<T | null>;
  getImagePath: (screenName: string, imageName: string) => string | undefined;
  isLoading: (screenName: string) => boolean;
  checkAllScreensForUpdates: (onProgress?: (message: string) => void) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.EXPO_PUBLIC_API_KEY;
const CACHE_DIR = FileSystem.documentDirectory + 'cache/';
const COLLECTION_SCREENS = [
  'guide_wildflower', 'guide_tree_shrub', 'guide_bird', 'guide_mammal',
  'guide_invertebrate', 'guide_track', 'guide_herp', 'nature_trail_marker',
  'mile_marker'
];

export const SCREEN_CONFIGS: Record<string, ScreenConfig> = {
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
  },
  guide_wildflower: {
    endpoint: '/items/wildflower/',
    cacheKey: 'guide_wildflower'
  },
  guide_tree_shrub: {
    endpoint: '/items/tree_shrub/',
    cacheKey: 'guide_tree_shrub'
  },
  guide_bird: {
    endpoint: '/items/bird/',
    cacheKey: 'guide_bird'
  },
  guide_mammal: {
    endpoint: '/items/mammal/',
    cacheKey: 'guide_mammal'
  },
  guide_invertebrate: {
    endpoint: '/items/invertebrate/',
    cacheKey: 'guide_invertebrate'
  },
  guide_track: {
    endpoint: '/items/track/',
    cacheKey: 'guide_track'
  },
  guide_herp: {
    endpoint: '/items/herp/',
    cacheKey: 'guide_herp'
  },
  nature_trail_marker: {
    endpoint: '/items/nature_trail_marker/',
    cacheKey: 'nature_trail_marker'
  },
  mile_marker: {
    endpoint: '/items/mile_marker/',
    cacheKey: 'mile_marker'
  }

};

export function ApiProvider({ children }: { children: ReactNode }) {
  const [screenDataCache, setScreenDataCache] = useState<Record<string, CachedScreenData>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const ensureCacheDir = async () => {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  };

  const getDataFilePath = (cacheKey: string) => `${CACHE_DIR}${cacheKey}.json`;
  const getImageFilePath = (screenName: string, imageName: string) => `${CACHE_DIR}${screenName}_${imageName}`;

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

  const downloadImage = async (screenName: string, imageName: string): Promise<string | undefined> => {
    try {
      await ensureCacheDir();

      const localPath = getImageFilePath(screenName, imageName);
      const imageInfo = await FileSystem.getInfoAsync(localPath);
      if (imageInfo.exists) {
        return localPath;
      }
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

  const setLoading = (screenName: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [screenName]: loading }));
  };

  const fetchScreenData = async <T extends ScreenData>(screenName: string): Promise<T | null> => {
    const config = SCREEN_CONFIGS[screenName];

    if (!config) {
      console.log(`No configuration found for screen: ${screenName}`);
      return null;
    }

    setLoading(screenName, true);

    try {
      const cachedData = await loadCachedData(screenName);
      if (cachedData) {
        setScreenDataCache(prev => ({ ...prev, [screenName]: cachedData }));
      }
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
      let parsedData = screenData;
      let imagePaths: Record<string, string> = {};

      if (Array.isArray(screenData)) {
        parsedData = await Promise.all(
          screenData.map(async (item: any) => {
            if (item.image) {
              const localPath = await downloadImage(screenName, item.image);
              if (localPath) {
                imagePaths[item.image] = localPath;
                item.image = localPath;
              }
            }
            return item;
          })
        ) as T;
      }

      if ('background' in screenData && typeof screenData.background === 'string') {
        const backgroundPath = await downloadImage(screenName, screenData.background);
        if (backgroundPath) {
          imagePaths['background'] = backgroundPath;
        }
      }

      if (screenName === 'rules' && 'rules_image' in screenData && typeof screenData.rules_image === 'string') {
        const rulesImagePath = await downloadImage(screenName, screenData.rules_image);
        if (rulesImagePath) {
          imagePaths['rules_image'] = rulesImagePath;
        }

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

      if (screenName === 'safety' && 'safety_image' in screenData && typeof screenData.safety_image === 'string') {
        const safetyImagePath = await downloadImage(screenName, screenData.safety_image);
        if (safetyImagePath) {
          imagePaths['safety_image'] = safetyImagePath;
        }
      }

      const cacheData: CachedScreenData = {
        data: parsedData,
        imagePaths: Object.keys(imagePaths).length > 0 ? imagePaths : undefined,
        timestamp: Date.now(),
      };

      await saveToCache(screenName, cacheData);
      setScreenDataCache(prev => ({ ...prev, [screenName]: cacheData }));

      return screenData;
    } catch (error) {
      console.log(`Error fetching data for ${screenName}:`, error);
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

  const checkAllScreensForUpdates = async (onProgress?: (message: string) => void) => {
    const screens = Object.keys(SCREEN_CONFIGS);

    for (const screenName of screens) {
      try {
        onProgress?.(`[${screenName}] Checking for updates...`);
        const config = SCREEN_CONFIGS[screenName];
        const localCache = await loadCachedData(screenName);

        if (!localCache) {
          onProgress?.(`[${screenName}] No local cache found. Fetching...`);
          await fetchScreenData(screenName);
          continue;
        }

        let metaQuery = 'fields=date_updated';
        if (COLLECTION_SCREENS.includes(screenName)) {
          metaQuery = 'sort=-date_updated&limit=1&fields=date_updated';
        }

        const response = await fetch(`${API_BASE_URL}${config.endpoint}?${metaQuery}`, {
          headers: { 'Authorization': `Bearer ${BEARER_TOKEN}` },
        });
        if (!response.ok) throw new Error(`API timestamp check failed with status ${response.status}`);
        const remoteMetadata = await response.json();

        let latestRemoteTimestamp: string | null = null;

        if (Array.isArray(remoteMetadata.data) && remoteMetadata.data.length > 0) {
          latestRemoteTimestamp = remoteMetadata.data[0].date_updated;
        } else if (remoteMetadata.data?.date_updated) {
          latestRemoteTimestamp = remoteMetadata.data.date_updated;
        }

        if (latestRemoteTimestamp && new Date(latestRemoteTimestamp) > new Date(localCache.timestamp)) {
          onProgress?.(`[${screenName}] ✨ New data found! Fetching updates...`);
          await fetchScreenData(screenName);
        } else {
          onProgress?.(`[${screenName}] ✅ Cache is up to date. Loading from disk...`);
          setScreenDataCache(prev => ({ ...prev, [screenName]: localCache }));
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        onProgress?.(`[${screenName}] ❌ Error checking for updates. Using cached data. Error: ${errorMessage}`);
        if (!screenDataCache[screenName]) {
          const cachedData = await loadCachedData(screenName);
          if (cachedData) {
            setScreenDataCache(prev => ({ ...prev, [screenName]: cachedData }));
          }
        }
      }
    }
  };

  const getScreenData = <T extends ScreenData>(screenName: string): T | null => {
    const cached = screenDataCache[screenName];
    return cached ? (cached.data as T) : null;
  };

  const getImagePath = (screenName: string, imageName: string): string | undefined => {
    return screenDataCache[screenName]?.imagePaths?.[imageName];
  };

  const isLoading = (screenName: string): boolean => {
    return loadingStates[screenName] || false;
  };

  const value: ApiContextType = {
    getScreenData,
    fetchScreenData,
    getImagePath,
    isLoading,
    checkAllScreensForUpdates,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

export function useScreen<T extends ScreenData>(screenName: string) {
  const api = useApi();
  return {
    data: api.getScreenData<T>(screenName),
    getImagePath: (imageName: string) => api.getImagePath(screenName, imageName),
    isLoading: api.isLoading(screenName),
    fetch: () => api.fetchScreenData<T>(screenName),
  };
}