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
type ScreenData = HomeData | AboutData | DonateData | GuideData | EmergencyData | RulesData | SafetyData | ReportData | GuideDataItem | GuideDataItems | NatureTrailMarkerData | MileMarkerTrailData | MileMarkers;

// --- UNCHANGED INTERFACES ---
interface ScreenConfig {
  endpoint: string;
  cacheKey: string;
}

interface CachedScreenData {
  data: ScreenData;
  imagePaths?: Record<string, string>;
  lastItemUpdateTimestamp: string | null | {};
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
  home: { endpoint: '/items/home/', cacheKey: 'home_data' },
  about: { endpoint: '/items/about/', cacheKey: 'about_data' },
  donate: { endpoint: '/items/donate/', cacheKey: 'donate_data' },
  guide: { endpoint: '/items/guide/', cacheKey: 'guide_data' },
  emergency: { endpoint: '/items/emergency/', cacheKey: 'emergency_data' },
  rules: { endpoint: '/rules/', cacheKey: 'rules_data' },
  safety: { endpoint: '/items/safety/', cacheKey: 'safety_data' },
  report: { endpoint: '/items/reports/', cacheKey: 'report_data' },
  guide_wildflower: { endpoint: '/items/wildflower/', cacheKey: 'guide_wildflower' },
  guide_tree_shrub: { endpoint: '/items/tree_shrub/', cacheKey: 'guide_tree_shrub' },
  guide_bird: { endpoint: '/items/bird/', cacheKey: 'guide_bird' },
  guide_mammal: { endpoint: '/items/mammal/', cacheKey: 'guide_mammal' },
  guide_invertebrate: { endpoint: '/items/invertebrate/', cacheKey: 'guide_invertebrate' },
  guide_track: { endpoint: '/items/track/', cacheKey: 'guide_track' },
  guide_herp: { endpoint: '/items/herp/', cacheKey: 'guide_herp' },
  nature_trail_marker: { endpoint: '/items/nature_trail_marker/', cacheKey: 'nature_trail_marker' },
  mile_marker: { endpoint: '/items/mile_marker/', cacheKey: 'mile_marker' }
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
      const downloadResult = await FileSystem.downloadAsync(
        `${API_BASE_URL}/assets/${imageName}`,
        localPath,
        { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
      );
      return downloadResult.status === 200 ? localPath : undefined;
    } catch (error) {
      console.log(`Error downloading image ${imageName}:`, error);
    }
    return undefined;
  };

  // In: ApiContext.tsx

const processAndCacheImages = async (screenName: string, data: any[], existingImagePaths: Record<string, string> = {}) => {
    const imagePaths = { ...existingImagePaths };
    const imageKeys = ['image', 'background', 'rules_image', 'safety_image', 'icon'];
    
    // A new recursive function to handle nested data
    const processItem = async (item: any) => {
        if (!item || typeof item !== 'object') return;

        // Process simple image properties on the item
        for (const key of imageKeys) {
            if (item[key] && typeof item[key] === 'string') {
                const imageId = item[key];
                const localPath = await downloadImage(screenName, imageId);
                if (localPath) {
                    imagePaths[imageId] = localPath;
                    item[key] = localPath;
                }
            }
        }

        // Process properties that are arrays (like 'rules')
        for (const key in item) {
            if (Array.isArray(item[key])) {
                for (const subItem of item[key]) {
                    await processItem(subItem); // Recurse for each item in the array
                }
            }
        }
    };

    for (const topLevelItem of data) {
        await processItem(topLevelItem);
    }
    
    return imagePaths;
};

  const setLoading = (screenName: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [screenName]: loading }));
  };
  
  // --- SIMPLIFIED fetchScreenData FUNCTION ---
  const fetchScreenData = async <T extends ScreenData>(screenName: string): Promise<T | null> => {
    const config = SCREEN_CONFIGS[screenName];
    if (!config) return null;

    setLoading(screenName, true);

    try {
      const response = await fetch(`${API_BASE_URL}${config.endpoint}`, {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const res = await response.json();
      const data = res.data;

      let imagePaths: Record<string, string> = {};
      if (Array.isArray(data)) {
        imagePaths = await processAndCacheImages(screenName, data);
      } else if (data) {
        imagePaths = await processAndCacheImages(screenName, [data]);
      }
      
      // The problematic helper function has been removed.
      // We now set the timestamp to null and let the sync function handle it.
      const cacheData: CachedScreenData = {
        data: data as T,
        imagePaths,
        lastItemUpdateTimestamp: null, // Always set to null here.
      };

      await saveToCache(screenName, cacheData);
      setScreenDataCache(prev => ({ ...prev, [screenName]: cacheData }));
      return data as T;
    } catch (error) {
      console.log(`Error fetching full data for ${screenName}:`, error);
      const cachedData = await loadCachedData(screenName);
      if (cachedData) {
        setScreenDataCache(prev => ({ ...prev, [screenName]: cachedData }));
        return cachedData.data as T;
      }
      return null;
    } finally {
      setLoading(screenName, false);
    }
  };

  const checkAllScreensForUpdates = async (onProgress?: (message: string) => void) => {
    for (const screenName of Object.keys(SCREEN_CONFIGS)) {
      setLoading(screenName, true);
      try {
        onProgress?.(`[${screenName}] Checking for updates...`);
        const config = SCREEN_CONFIGS[screenName];
        const localCache = await loadCachedData(screenName);

        if (COLLECTION_SCREENS.includes(screenName)) {
          const metaResponse = await fetch(
            `${API_BASE_URL}${config.endpoint}?fields=id,date_updated`,
            { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
          );
          if (!metaResponse.ok) throw new Error(`API metadata check failed`);
          const { data: remoteItems } = await metaResponse.json();

          if (!localCache || !Array.isArray(localCache.data)) {
            onProgress?.(`[${screenName}] No local cache. Fetching all...`);
            await fetchScreenData(screenName);
            continue;
          }

          const localData = localCache.data as any[];
          const localItemMap = new Map(localData.map(item => [item.id, item.date_updated]));
          const remoteItemMap = new Map(remoteItems.map((item: any) => [item.id, item.date_updated]));

          const itemsToFetchIds = remoteItems
            .filter((remoteItem: any) => {
              const localTimestamp = localItemMap.get(remoteItem.id);
              return !localTimestamp || new Date(remoteItem.date_updated) > new Date(localTimestamp);
            })
            .map((item: any) => item.id);

          const itemsToDeleteIds = Array.from(localItemMap.keys()).filter(
            localId => !remoteItemMap.has(localId)
          );

          if (itemsToFetchIds.length === 0 && itemsToDeleteIds.length === 0) {
            onProgress?.(`[${screenName}] ✅ Cache is up to date.`);
            setScreenDataCache(prev => ({ ...prev, [screenName]: localCache }));
            continue;
          }

          onProgress?.(`[${screenName}] 🔄 Syncing: ${itemsToFetchIds.length} new/updated, ${itemsToDeleteIds.length} to delete.`);

          let fetchedItems: any[] = [];
          if (itemsToFetchIds.length > 0) {
            const fetchResponse = await fetch(
              `${API_BASE_URL}${config.endpoint}?filter[id][_in]=${itemsToFetchIds.join(',')}`,
              { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
            );
            const { data } = await fetchResponse.json();
            fetchedItems = data || [];
          }

          let updatedData = localData.filter(item => !itemsToDeleteIds.includes(item.id));
          const itemsToUpdateMap = new Map(fetchedItems.map(item => [item.id, item]));

          updatedData = updatedData
            .map(item => itemsToUpdateMap.get(item.id) || item)
            .concat(fetchedItems.filter(item => !localItemMap.has(item.id)));

          const imagePaths = await processAndCacheImages(screenName, fetchedItems, localCache.imagePaths);
          // The sync function is now solely responsible for calculating and storing the correct timestamp.
          const latestTimestamp = Array.from(remoteItemMap.values()).sort().pop() || null;

          const newCacheData: CachedScreenData = {
            data: updatedData,
            imagePaths,
            lastItemUpdateTimestamp: latestTimestamp,
          };

          await saveToCache(screenName, newCacheData);
          setScreenDataCache(prev => ({ ...prev, [screenName]: newCacheData }));
        } else {
          // Singleton screens are simpler, just re-fetch them.
          await fetchScreenData(screenName);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        onProgress?.(`[${screenName}] ❌ Error: ${errorMessage}. Loading from cache.`);
        const cachedData = await loadCachedData(screenName);
        if (cachedData) {
          setScreenDataCache(prev => ({ ...prev, [screenName]: cachedData }));
        }
      } finally {
        setLoading(screenName, false);
      }
    }
  };
  
  const getScreenData = <T extends ScreenData>(screenName: string): T | null => {
    return screenDataCache[screenName]?.data as T || null;
  };

  const getImagePath = (screenName: string, imageName: string): string | undefined => {
    const cached = screenDataCache[screenName];
    if (cached?.imagePaths?.[imageName]) {
      return cached.imagePaths[imageName];
    }
    const potentialPath = getImageFilePath(screenName, imageName.split('/').pop() || imageName);
    return potentialPath;
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

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
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