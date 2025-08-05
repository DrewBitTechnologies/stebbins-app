import MapboxGL from "@rnmapbox/maps";
import { Alert } from 'react-native';

export const MAP_PACK = 'stebbins';
export const CENTER_LATITUDE = 38.493;
export const CENTER_LONGITUDE = -122.104;
export const BOUNDS = { ne: [-122.084, 38.525], sw: [-122.124, 38.4623] };
export const DEFAULT_ZOOM = 13.3;
export const MIN_ZOOM = 13;
export const MAX_ZOOM = 22;

export const getStyleUrl = (MAPBOX_STYLE_URL?: string) => {
  if (MAPBOX_STYLE_URL) {
    return MAPBOX_STYLE_URL;
  } else {
    return 'mapbox://styles/mapbox/outdoors-v12'; // fallback
  }
};

export const deleteMap = async (): Promise<void> => {
  try {
    await MapboxGL.offlineManager.deletePack(MAP_PACK);
  } catch (error: any) {
    throw new Error(`Error deleting offline map: ${error.message}`);
  }
};

export const downloadOfflineMap = async (styleURL: string): Promise<void> => {
  try {
    await MapboxGL.offlineManager.createPack({
      name: MAP_PACK, 
      styleURL, 
      minZoom: MIN_ZOOM, 
      maxZoom: MAX_ZOOM, 
      bounds: [BOUNDS.sw, BOUNDS.ne]
    },
    (offlineRegion, status) => {
      // Progress callback - could be used for progress indicators
    },
    (offlineRegion, err) => {
      // Error callback
      if (err) throw new Error(`Offline pack download error: ${err}`);
    });
  } catch (error: any) {
    throw new Error(`Error initiating offline region download: ${error.message}`);
  }
};

export const isMapDownloaded = async (): Promise<boolean> => {
  try {
    const pack = await MapboxGL.offlineManager.getPack(MAP_PACK);
    return !!pack;
  } catch (error: any) {
    return false;
  }
};

export const checkMapState = async (isConnected: boolean): Promise<boolean> => {
  try {
    if (!await isMapDownloaded()) {
      if (isConnected) {
        // Note: Caller should provide styleURL when calling downloadOfflineMap
        return true; // Map needs to be downloaded
      } else {
        return false; // No map and no connection
      }
    } else {
      return true; // Map is cached
    }
  } catch (error: any) {
    return false;
  }
};

export const checkMapForUpdate = async (
  isConnected: boolean, 
  styleURL: string,
  onSuccess: () => void,
  setMapKey: (fn: (prev: number) => number) => void
): Promise<void> => {
  if (isConnected) {
    try {
      await deleteMap();
      await downloadOfflineMap(styleURL);
      Alert.alert("Map Updated", "The offline map has been successfully updated.");
      setMapKey(prevKey => prevKey + 1);
      onSuccess();
    } catch (error: any) {
      Alert.alert("Error", `Failed to update map: ${error.message}`);
    }
  } else {
    Alert.alert("No Connection", "An internet connection is required to update the map.");
  }
};

export const resetCamera = (
  camera: React.RefObject<MapboxGL.Camera>
): void => {
  camera.current?.setCamera({
    centerCoordinate: [CENTER_LONGITUDE, CENTER_LATITUDE],
    zoomLevel: DEFAULT_ZOOM,
    animationDuration: 1000,
  });
};