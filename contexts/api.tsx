// src/api/ApiContext.tsx

import React, { createContext, ReactNode, useContext, useState } from 'react';
import { getImageFilePath, SCREEN_CONFIGS, CONCURRENT_SCREENS } from './api.config';
import * as ApiService from './api.service';
import { usePolling } from '../hooks/usePolling';
import { useBatchedUpdates } from '../hooks/useBatchedUpdates';

// --- TYPE DEFINITIONS ---
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
  safety_bullet_points: string;
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
export interface SafetyMarkerData {
  id: number;
  date_created: string;
  date_updated: string | null;
  description: string;
  map_icon: string | null;
  latitude: number;
  longitude: number;
  map_label: string;
  image: string | null;
}
export interface POIMarkerData {
  id: number;
  date_created: string;
  date_updated: string | null;
  description: string | null;
  map_icon: string | null;
  latitude: number;
  longitude: number;
  map_label: string;
  image: string | null;
}
export interface UpdateData {
  id: number;
  date_updated: string;
  update_signal: string;
}

export interface BrandingData {
  id: number;
  date_created: string;
  date_updated: string;
  header_image: string;
  splash_image: string;
}

export type MileMarkers = MileMarkerTrailData[];
export type POIMarkers = POIMarkerData[];
export type SafetyMarkers = SafetyMarkerData[];

export type ScreenData = HomeData | 
                         AboutData | 
                         DonateData | 
                         GuideData | 
                         EmergencyData | 
                         RulesData | 
                         SafetyData | 
                         ReportData | 
                         GuideDataItem | 
                         GuideDataItems | 
                         NatureTrailMarkerData | 
                         MileMarkerTrailData | 
                         MileMarkers | 
                         SafetyMarkers | 
                         POIMarkers | 
                         UpdateData |
                         BrandingData;

export interface CachedScreenData {
  data: ScreenData;
  imagePaths?: Record<string, string>;
  lastItemUpdateTimestamp: string;
}

// --- CONTEXT DEFINITION ---
interface ApiContextType {
  getScreenData: <T extends ScreenData>(screenName: string) => T | null;
  fetchScreenData: <T extends ScreenData>(screenName: string) => Promise<T | null>;
  getImagePath: (screenName: string, imageName: string) => string | undefined;
  isLoading: (screenName: string) => boolean;
  fullSync: (onProgress?: (message: string) => void) => Promise<void>;
  checkForUpdates: (onProgress?: (message: string) => void) => Promise<void>;
  // Batched versions for manual refresh (battery efficient)
  batchedCheckForUpdates: (onProgress?: (message: string) => void) => Promise<void>;
  batchedFullSync: (onProgress?: (message: string) => void) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

// --- API PROVIDER COMPONENT ---
export function ApiProvider({ children }: { children: ReactNode }) {
  const [screenDataCache, setScreenDataCache] = useState<Record<string, CachedScreenData>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);

  // Batching system for efficient updates
  const { addToBatch } = useBatchedUpdates();

  // Background update checker - uses efficient single endpoint check
  const backgroundUpdateCheck = async (): Promise<boolean> => {
    // Only run background polling if initial load is complete
    if (!initialLoadCompleted) {
      console.log('⏳ Skipping background poll - initial load not complete');
      return false;
    }

    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔄 [${timestamp}] Background polling started - checking for updates via single endpoint`);

    return new Promise<boolean>((resolve) => {
      let foundUpdates = false;

      // Add single high-priority update check to batch
      addToBatch(
        'global-update-check',
        async () => {
          console.log('🔍 [HIGH] Running global update check...');
          
          // Use the existing checkForUpdates logic but with custom logging
          await checkForUpdates((message: string) => {
            console.log(`📡 Update check: ${message}`);
            
            // Detect if updates were found based on progress messages
            if (message.includes('🔄 Updates available') || 
                message.includes('Running full sync') ||
                message.includes('Resync signal received') ||
                message.includes('Wiping cache')) {
              foundUpdates = true;
            }
          });
          
          console.log(`✅ Global update check completed${foundUpdates ? ' (updates found)' : ' (no updates)'}`);
          resolve(foundUpdates);
        },
        'high'
      );
    });
  };

  // Background polling system - only enabled after initial load completes
  usePolling(backgroundUpdateCheck, {
    baseInterval: 10000,      // 10 seconds
    maxJitter: 5000,          // +/- 5 seconds jitter
    enabled: initialLoadCompleted, // Only enable after initial load
    runImmediately: false     // Don't run on mount
  });

  const setLoading = (screenName: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [screenName]: loading }));
  };

  const fetchScreenData = async <T extends ScreenData>(screenName:string): Promise<T | null> => {
    const config = SCREEN_CONFIGS[screenName];
    if (!config) return null;

    setLoading(screenName, true);
    try {
      const data = await ApiService.fetchFullData<T>(config.endpoint);
      if (!data) throw new Error("No data received from API.");

      const dataArray = Array.isArray(data) ? data : [data];
      const imagePaths = await ApiService.processAndCacheImages(screenName, dataArray);
      
      const newTimestamp = (data as any)?.date_updated || '';
      const cacheData: CachedScreenData = {
        data: data,
        imagePaths,
        lastItemUpdateTimestamp: newTimestamp,
      };

      await ApiService.saveToCache(config.cacheKey, cacheData);
      setScreenDataCache(prev => ({ ...prev, [screenName]: cacheData }));
      return data;
    } catch (error) {
      // Fetch failed, try cache
      const cachedData = await ApiService.loadFromCache(config.cacheKey);
      if (cachedData) {
        setScreenDataCache(prev => ({ ...prev, [screenName]: cachedData }));
        return cachedData.data as T;
      }
      return null;
    } finally {
      setLoading(screenName, false);
    }
  };

  const saveLastSyncDate = async (dateString: string) => {
    try {
      const cacheData: CachedScreenData = {
        data: { id: 0, date_updated: dateString, update_signal: 'sync' } as UpdateData,
        lastItemUpdateTimestamp: dateString
      };
      await ApiService.saveToCache('lastSyncDate', cacheData);
    } catch (error) {
      // Failed to save sync date
    }
  };

  const getLastSyncDate = async (): Promise<string | null> => {
    try {
      const cacheData = await ApiService.loadFromCache('lastSyncDate');
      return cacheData?.lastItemUpdateTimestamp || null;
    } catch (error) {
      // Failed to load sync date
      return null;
    }
  };


  const loadAllCachedData = async (onProgress?: (message: string) => void) => {
    for (const screenName of Object.keys(SCREEN_CONFIGS)) {
      try {
        const config = SCREEN_CONFIGS[screenName];
        const cachedData = await ApiService.loadFromCache(config.cacheKey);
        if (cachedData) {
          setScreenDataCache(prev => ({ ...prev, [screenName]: cachedData }));
          onProgress?.(`✅ [${screenName}] Loaded from cache.`);
        }
      } catch (error) {
        // Failed to load cached data
      }
    }
    setInitialLoadCompleted(true);
  };

  const checkForUpdates = async (onProgress?: (message: string) => void) => {
    try {
      onProgress?.('Checking for updates...');
      
      const response = await ApiService.fetchFullData<UpdateData>('/items/update/');

      if (!response) {
        onProgress?.('Failed to check for updates. Running full sync...');
        await fullSync(onProgress);
        return;
      }

      if (!response.date_updated) {
        onProgress?.('No update date from server. Running full sync...');
        await fullSync(onProgress);
        return;
      }

      const lastSyncDateString = await getLastSyncDate();

      const serverUpdateDate = new Date(response.date_updated);
      if (isNaN(serverUpdateDate.getTime())) {
        onProgress?.('Invalid server date format. Running full sync...');
        await fullSync(onProgress);
        return;
      }

      const localSyncDate = lastSyncDateString ? new Date(lastSyncDateString) : new Date(0);
      if (lastSyncDateString && isNaN(localSyncDate.getTime())) {
        onProgress?.('Invalid local sync date. Running full sync...');
        await fullSync(onProgress);
        return;
      }

      const cacheIsValid = await ApiService.performCacheIntegrityCheck();

      if (!cacheIsValid) {
        onProgress?.('🔄 Cache integrity checks failed. Running full sync...');
        await ApiService.wipeCache();
        await fullSync(onProgress);
        return;
      }

      if ((response.update_signal === 'resync') && (localSyncDate <= serverUpdateDate)) {
        onProgress?.('🔄 Resync signal received. Wiping cache and redownloading data...');
        await ApiService.wipeCache();
        await fullSync(onProgress);
        return;
      }
      
      onProgress?.(`Server last update: ${serverUpdateDate.toISOString()}`);
      onProgress?.(`Local last sync: ${localSyncDate.toISOString()}`);

      if (localSyncDate >= serverUpdateDate) {
        if (!initialLoadCompleted) {
          onProgress?.('✅ App is up to date. Loading cached data...');
          await loadAllCachedData(onProgress);
        } else {
          onProgress?.('✅ App is up to date.');
        }
        return;
      }

      onProgress?.('🔄 Updates available. Running full sync...');
      await fullSync(onProgress);
      return;
    } catch (error) {

      onProgress?.('❌ Error checking updates. Running full sync...');
      await fullSync(onProgress);
      return;
    }
  };

  const fullSync = async (onProgress?: (message: string) => void) => {
    await ApiService.ensureCacheDir();
    
    const screenNames = Object.keys(SCREEN_CONFIGS);
    
    const processScreenBatch = async (screenBatch: string[]) => {
      const batchPromises = screenBatch.map(async (screenName) => {
        setLoading(screenName, true);
        const config = SCREEN_CONFIGS[screenName];
        try {
          onProgress?.(`[${screenName}] Checking for updates...`);
          
          if (config.isCollection) {
            const localCache = await ApiService.loadFromCache(config.cacheKey);
            const remoteItems = await ApiService.fetchMetadata(config.endpoint);

            if (!localCache || !Array.isArray(localCache.data)) {
              onProgress?.(`[${screenName}] 🔄 Stale cache. Fetching updates...`);
              await fetchScreenData(screenName);
              return;
            }

            const { itemsToFetchIds, itemsToDeleteIds, remoteItemMap } = ApiService.determineSyncActions(localCache.data as any[], remoteItems);

            if (itemsToFetchIds.length === 0 && itemsToDeleteIds.length === 0) {
              onProgress?.(`[${screenName}] ✅ Cache is up to date.`);
              setScreenDataCache(prev => ({ ...prev, [screenName]: localCache }));
              return;
            }

            onProgress?.(`[${screenName}] 🔄 Syncing: ${itemsToFetchIds.length} new/updated, ${itemsToDeleteIds.length} to delete.`);
            
            const fetchedItems = await ApiService.fetchItemsByIds(config.endpoint, itemsToFetchIds);
            const updatedData = ApiService.mergeUpdates(localCache.data, fetchedItems, itemsToDeleteIds);
            const imagePaths = await ApiService.processAndCacheImages(screenName, fetchedItems, localCache.imagePaths);
            const latestTimestamp = Array.from(remoteItemMap.values()).sort().pop() || null;

            const newCacheData: CachedScreenData = { data: updatedData, imagePaths, lastItemUpdateTimestamp: latestTimestamp };
            await ApiService.saveToCache(config.cacheKey, newCacheData);
            setScreenDataCache(prev => ({ ...prev, [screenName]: newCacheData }));

          } else {
            const localCache = await ApiService.loadFromCache(config.cacheKey);
            const remoteMetadata = await ApiService.fetchSingletonMetadata(config.endpoint);
            

            if (localCache?.data && remoteMetadata && 
                new Date(localCache.lastItemUpdateTimestamp) >= new Date(remoteMetadata.date_updated)) {
              
              onProgress?.(`[${screenName}] ✅ Cache is up to date.`);
              
              setScreenDataCache(prev => ({ ...prev, [screenName]: localCache }));
              return;
            }

            onProgress?.(`[${screenName}] 🔄 Stale cache. Fetching updates...`);
            await fetchScreenData(screenName);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          onProgress?.(`[${screenName}] ❌ Error: ${errorMessage}. Loading from cache.`);
          const cachedData = await ApiService.loadFromCache(config.cacheKey);
          if (cachedData) {
            setScreenDataCache(prev => ({ ...prev, [screenName]: cachedData }));
          }
        } finally {
          setLoading(screenName, false);
        }
      });

      await Promise.allSettled(batchPromises);
    };

    await ApiService.processBatch(screenNames, CONCURRENT_SCREENS, processScreenBatch);

    setInitialLoadCompleted(true);
    await saveLastSyncDate(new Date().toISOString());
    const currentVersion = ApiService.getCurrentAppVersion();
    await ApiService.saveCacheVersion(currentVersion);
  };
  
  const getScreenData = <T extends ScreenData>(screenName: string): T | null => {
    return screenDataCache[screenName]?.data as T || null;
  };

  const getImagePath = (screenName: string, imageName: string): string | undefined => {
    // First, check the reliable map of cached paths
    const cachedPath = screenDataCache[screenName]?.imagePaths?.[imageName];
    if (cachedPath) {
      return cachedPath;
    }
    // Restore the fallback for robustness
    if (imageName) {
      return getImageFilePath(screenName, imageName.split('/').pop() || imageName);
    }

    return undefined;
  };

  const isLoading = (screenName: string): boolean => !!loadingStates[screenName];

  // Batched version of checkForUpdates for manual refresh
  const batchedCheckForUpdates = async (onProgress?: (message: string) => void) => {
    console.log('🔄 Manual refresh requested - using batched update check');
    
    return new Promise<void>((resolve, reject) => {
      addToBatch(
        'manual-update-check',
        async () => {
          try {
            onProgress?.('🔄 Starting batched update check...');
            await checkForUpdates(onProgress);
            onProgress?.('✅ Batched update check completed');
            resolve();
          } catch (error) {
            onProgress?.('❌ Batched update check failed');
            reject(error);
          }
        },
        'high' // High priority for user-initiated actions
      );
    });
  };

  // Batched version of fullSync for manual refresh
  const batchedFullSync = async (onProgress?: (message: string) => void) => {
    console.log('🔄 Manual full sync requested - using batched approach');
    
    return new Promise<void>((resolve, reject) => {
      addToBatch(
        'manual-full-sync',
        async () => {
          try {
            onProgress?.('🔄 Starting batched full sync...');
            await fullSync(onProgress);
            onProgress?.('✅ Batched full sync completed');
            resolve();
          } catch (error) {
            onProgress?.('❌ Batched full sync failed');
            reject(error);
          }
        },
        'high' // High priority for user-initiated actions
      );
    });
  };

  const value: ApiContextType = {
    getScreenData,
    fetchScreenData,
    getImagePath,
    isLoading,
    fullSync,
    checkForUpdates,
    batchedCheckForUpdates,
    batchedFullSync,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

// --- HOOKS ---
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
  };
}