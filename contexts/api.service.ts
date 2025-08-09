import * as FileSystem from 'expo-file-system';
import * as Application from 'expo-application';
import { CachedScreenData, ScreenData } from './api';
import { API_BASE_URL, BEARER_TOKEN, CDN_URL, CACHE_DIR, IMAGE_FIELD_KEYS, getDataFilePath, getImageFilePath } from './api.config';

// --- File System Operations ---
export const ensureCacheDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
};

export const saveToCache = async (cacheKey: string, data: CachedScreenData) => {
  try {
    await ensureCacheDir();
    const filePath = getDataFilePath(cacheKey);
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));
  } catch (error) {
    // Cache save failed - continue without cache
  }
};

export const loadFromCache = async (cacheKey: string): Promise<CachedScreenData | null> => {
  try {
    const filePath = getDataFilePath(cacheKey);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      const cachedData = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(cachedData) as CachedScreenData;
    }
  } catch (error) {
    // Cache load failed - return null
  }
  return null;
};

// --- API & Image Processing ---
const fetchFromApi = async (endpoint: string) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const result = await response.json();
        return result.data;
    } catch (error) {
        throw error;
    }
}

export const fetchFullData = async <T extends ScreenData>(endpoint: string): Promise<T | null> => {
    return await fetchFromApi(endpoint) as T | null;
}

export const fetchMetadata = async (endpoint: string): Promise<{ id: number; date_updated: string }[]> => {
    return await fetchFromApi(`${endpoint}?fields=id,date_updated`);
}

export const fetchItemsByIds = async <T>(endpoint: string, ids: (string | number)[]): Promise<T[]> => {
    if (ids.length === 0) return [];
    return await fetchFromApi(`${endpoint}?filter[id][_in]=${ids.join(',')}`);
}

const downloadImage = async (screenName: string, imageName: string): Promise<string | undefined> => {
  try {
    await ensureCacheDir();
    const localPath = getImageFilePath(screenName, imageName);
    
    // Try CDN with common extensions
    const extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG'];
    
    for (const ext of extensions) {
      try {
        const cdnUrl = `${CDN_URL}/${imageName}${ext}`;
        const cdnResult = await FileSystem.downloadAsync(cdnUrl, localPath);
        if (cdnResult.status === 200) {
          return localPath;
        }
      } catch {
        // Continue to next extension
      }
    }
    
    // Fallback to /assets/ endpoint
    const downloadResult = await FileSystem.downloadAsync(
      `${API_BASE_URL}/assets/${imageName}`,
      localPath,
      { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
    );
    return downloadResult.status === 200 ? localPath : undefined;
  } catch (error) {
    // Image download failed
  }
  return undefined;
};

export const processAndCacheImages = async (screenName: string, data: any[], existingImagePaths: Record<string, string> = {}) => {
  const imagePaths = { ...existingImagePaths };
  
  const processItem = async (item: any) => {
      if (!item || typeof item !== 'object') return;

      for (const key of IMAGE_FIELD_KEYS) {
          if (item[key] && typeof item[key] === 'string' && !imagePaths[item[key]]) {
              const imageId = item[key];
              const localPath = await downloadImage(screenName, imageId);
              if (localPath) {
                  
                  imagePaths[imageId] = localPath;
              }
          }
      }

      for (const key in item) {
          if (Array.isArray(item[key])) {
              for (const subItem of item[key]) {
                  await processItem(subItem);
              }
          }
      }
  };

  for (const topLevelItem of data) {
      await processItem(topLevelItem);
  }
  
  return imagePaths;
};

// --- Sync Logic ---

export const fetchSingletonMetadata = async (endpoint: string): Promise<{ date_updated: string } | null> => {
    return await fetchFromApi(`${endpoint}?fields=date_updated`);
}

export const determineSyncActions = (localData: any[], remoteItems: any[]) => {
    const localItemMap = new Map(localData.map(item => [item.id, item.date_updated]));
    const remoteItemMap = new Map(remoteItems.map(item => [item.id, item.date_updated]));

    const itemsToFetchIds = remoteItems
        .filter(remoteItem => {
            // If the item isn't in our local cache at all, fetch it.
            if (!localItemMap.has(remoteItem.id)) {
                return true;
            }
            
            const localTimestamp = localItemMap.get(remoteItem.id);
            const remoteTimestamp = remoteItem.date_updated;

            // If the remote timestamp is null, we can't be "more updated". Don't fetch.
            if (remoteTimestamp === null) {
                return false;
            }
            
            // If local is null but remote has a new timestamp, fetch it.
            if (localTimestamp === null) {
                return true;
            }
            
            // Both have timestamps, so compare them directly.
            return new Date(remoteTimestamp) > new Date(localTimestamp);
        })
        .map(item => item.id);

    const itemsToDeleteIds = Array.from(localItemMap.keys()).filter(
        localId => !remoteItemMap.has(localId)
    );

    return { itemsToFetchIds, itemsToDeleteIds, remoteItemMap };
}

export const mergeUpdates = (localData: any[], fetchedItems: any[], itemsToDeleteIds: (string | number)[]) => {
    // 1. Create a map of the newly fetched items for quick lookup.
    const fetchedItemsMap = new Map(fetchedItems.map(item => [item.id, item]));

    // 2. Filter out deleted items and update existing items from the local data.
    const updatedLocalData = localData
        .filter(item => !itemsToDeleteIds.includes(item.id))
        .map(item => fetchedItemsMap.get(item.id) || item); // Replace with fetched item if it exists, otherwise keep local.

    // 3. Identify brand new items that were not in the original local data.
    const localDataMap = new Map(localData.map(item => [item.id, item]));
    const newItems = fetchedItems.filter(item => !localDataMap.has(item.id));

    // 4. Combine the updated list with the brand new items.
    return [...updatedLocalData, ...newItems];
};

// --- App Version & Cache Management ---

const VERSION_FILE_PATH = `${CACHE_DIR}/app_version.json`;

export const getCurrentAppVersion = () => {
    const version = Application.nativeApplicationVersion || '1.0.0';
    const buildNumber = Application.nativeBuildVersion || '1';
    return `${version}-${buildNumber}`;
};

export const getCacheVersion = async (): Promise<string | null> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(VERSION_FILE_PATH);
        if (fileInfo.exists) {
            const versionData = await FileSystem.readAsStringAsync(VERSION_FILE_PATH);
            const parsed = JSON.parse(versionData);
            return parsed.version || null;
        }
    } catch (error) {
        console.warn('Failed to read cache version:', error);
    }
    return null;
};

export const saveCacheVersion = async (version: string) => {
    try {
        await ensureCacheDir();
        const versionData = {
            version,
            timestamp: new Date().toISOString()
        };
        await FileSystem.writeAsStringAsync(VERSION_FILE_PATH, JSON.stringify(versionData));
    } catch (error) {
        console.warn('Failed to save cache version:', error);
    }
};

export const isCacheVersionValid = async (): Promise<boolean> => {
    try {
        const currentVersion = getCurrentAppVersion();
        const cachedVersion = await getCacheVersion();
        
        if (!cachedVersion) {
            console.log('No cached version found - cache invalid');
            return false;
        }
        
        const isValid = currentVersion === cachedVersion;
        console.log(`Version check: current=${currentVersion}, cached=${cachedVersion}, valid=${isValid}`);
        return isValid;
    } catch (error) {
        console.warn('Failed to validate cache version:', error);
        return false;
    }
};

export const wipeCache = async () => {
    try {
        console.log('🗑️ Wiping entire cache directory...');
        const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
        if (dirInfo.exists) {
            await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
            console.log('✅ Cache directory wiped successfully');
        }
        // Recreate the cache directory
        await ensureCacheDir();
        console.log('✅ Cache directory recreated');
    } catch (error) {
        console.error('❌ Failed to wipe cache:', error);
        throw error;
    }
};