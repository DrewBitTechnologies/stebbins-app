// src/api/ApiContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getImageFilePath, SCREEN_CONFIGS } from './api.config';
import * as ApiService from './api.service';

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
export type MileMarkers = MileMarkerTrailData[];
export type POIMarkers = POIMarkerData[];
export type SafetyMarkers = SafetyMarkerData[];

export type ScreenData = HomeData | AboutData | DonateData | GuideData | EmergencyData | RulesData | SafetyData | ReportData | GuideDataItem | GuideDataItems | NatureTrailMarkerData | MileMarkerTrailData | MileMarkers | SafetyMarkers | POIMarkers;

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
  checkAllScreensForUpdates: (onProgress?: (message: string) => void) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

// --- API PROVIDER COMPONENT ---
export function ApiProvider({ children }: { children: ReactNode }) {
  const [screenDataCache, setScreenDataCache] = useState<Record<string, CachedScreenData>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

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
      console.error(`Error fetching full data for ${screenName}:`, error);
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

  const checkAllScreensForUpdates = async (onProgress?: (message: string) => void) => {
    for (const screenName of Object.keys(SCREEN_CONFIGS)) {
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
            continue;
          }

          const { itemsToFetchIds, itemsToDeleteIds, remoteItemMap } = ApiService.determineSyncActions(localCache.data as any[], remoteItems);

          if (itemsToFetchIds.length === 0 && itemsToDeleteIds.length === 0) {
            onProgress?.(`[${screenName}] ✅ Cache is up to date.`);
            setScreenDataCache(prev => ({ ...prev, [screenName]: localCache }));
            continue;
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
          
          console.log(localCache?.lastItemUpdateTimestamp);

          if (localCache?.data && remoteMetadata && 
              new Date(localCache.lastItemUpdateTimestamp) >= new Date(remoteMetadata.date_updated)) {
            
            onProgress?.(`[${screenName}] ✅ Cache is up to date.`);
            
            setScreenDataCache(prev => ({ ...prev, [screenName]: localCache }));
            continue;
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
    }
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

  const value: ApiContextType = {
    getScreenData,
    fetchScreenData,
    getImagePath,
    isLoading,
    checkAllScreensForUpdates,
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
    fetch: () => api.fetchScreenData<T>(screenName),
  };
}