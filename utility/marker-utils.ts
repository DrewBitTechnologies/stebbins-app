import { NatureTrailMarkerData, SafetyMarkerData, POIMarkerData, MileMarkerTrailData } from '@/contexts/api';

export type AnyMarker = NatureTrailMarkerData | SafetyMarkerData | POIMarkerData;

export interface DisplayMarker {
  id: string;
  coordinate: [number, number];
  label: string;
  onPress?: () => void;
  iconUri?: string | null;
}

export interface MarkerTypes {
  nature: boolean;
  mile: boolean;
  safety: boolean;
  poi: boolean;
}

export const getImagePathForMarker = (
  marker: AnyMarker, 
  forIcon: boolean = false,
  getNatureImagePath: (imageName: string) => string | undefined,
  getSafetyImagePath: (imageName: string) => string | undefined,
  getPoiImagePath: (imageName: string) => string | undefined,
  safetyMarkers?: SafetyMarkerData[],
  poiMarkers?: POIMarkerData[]
): string | null => {
  const field = forIcon ? (marker as SafetyMarkerData).map_icon : marker.image;
  if (!field) return null;

  if ('common_name' in marker) return getNatureImagePath(field) || null;
  if ('map_label' in marker) {
    if (safetyMarkers?.some(m => m.id === marker.id)) return getSafetyImagePath(field) || null;
    if (poiMarkers?.some(m => m.id === marker.id)) return getPoiImagePath(field) || null;
  }
  return null;
};

export const filterNatureMarkersByZoom = (
  markers: NatureTrailMarkerData[], 
  zoomLevel: number
): NatureTrailMarkerData[] => {
  if (zoomLevel < 14.5) {
    return markers.filter(marker => parseInt(marker.marker_id, 10) % 4 === 0);
  } else if (zoomLevel >= 14.5 && zoomLevel < 16) {
    return markers.filter(marker => parseInt(marker.marker_id, 10) % 2 === 0);
  }
  return markers;
};

export const createDisplayMarkers = (
  activeMarkerTypes: MarkerTypes,
  zoomLevel: number,
  natureTrailMarkers?: NatureTrailMarkerData[],
  mileMarkers?: MileMarkerTrailData[],
  safetyMarkers?: SafetyMarkerData[],
  poiMarkers?: POIMarkerData[],
  onMarkerPress: (marker: AnyMarker) => void,
  getSafetyImagePath: (imageName: string) => string | undefined,
  getPoiImagePath: (imageName: string) => string | undefined
): DisplayMarker[] => {
  let markersToDisplay: DisplayMarker[] = [];

  if (activeMarkerTypes.nature && natureTrailMarkers) {
    const filteredNatureMarkers = filterNatureMarkersByZoom(natureTrailMarkers, zoomLevel);
    markersToDisplay.push(...filteredNatureMarkers.map(marker => ({
      id: `nature-${marker.id}`,
      coordinate: [marker.longitude, marker.latitude] as [number, number],
      label: marker.marker_id,
      onPress: () => onMarkerPress(marker),
    })));
  }

  if (activeMarkerTypes.mile && mileMarkers) {
    markersToDisplay.push(...mileMarkers.map(marker => ({
      id: `mile-${marker.id}`,
      coordinate: [marker.longitude, marker.latitude] as [number, number],
      label: marker.value.toString(),
      onPress: undefined,
    })));
  }

  if (activeMarkerTypes.safety && safetyMarkers) {
    markersToDisplay.push(...safetyMarkers.map(marker => ({
      id: `safety-${marker.id}`,
      coordinate: [marker.longitude, marker.latitude] as [number, number],
      label: marker.map_label,
      onPress: () => onMarkerPress(marker),
      iconUri: marker.map_icon ? getSafetyImagePath(marker.map_icon) : null,
    })));
  }

  if (activeMarkerTypes.poi && poiMarkers) {
    markersToDisplay.push(...poiMarkers.map(marker => ({
      id: `poi-${marker.id}`,
      coordinate: [marker.longitude, marker.latitude] as [number, number],
      label: marker.map_label,
      onPress: () => onMarkerPress(marker),
      iconUri: marker.map_icon ? getPoiImagePath(marker.map_icon) : null,
    })));
  }

  return markersToDisplay;
};

export const getMarkerTitle = (marker: AnyMarker): string => {
  return 'common_name' in marker ? marker.common_name : marker.map_label;
};

export const getMarkerSubtitle = (marker: AnyMarker): string | null => {
  return 'latin_name' in marker ? marker.latin_name : null;
};