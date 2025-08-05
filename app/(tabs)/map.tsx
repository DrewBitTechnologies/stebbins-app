import { MileMarkerTrailData, NatureTrailMarkerData, POIMarkerData, SafetyMarkerData, useScreen } from '@/contexts/api';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from '@/contexts/api.config';
import { FontAwesome, FontAwesome6 as FontAwesomeIcon, Ionicons } from '@expo/vector-icons';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import MapboxGL from "@rnmapbox/maps";
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useIsConnected } from 'react-native-offline';

// Initialize Mapbox
if (MAPBOX_ACCESS_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
  console.log('✅ Mapbox access token configured');
} else {
  console.error('❌ MAPBOX_ACCESS_TOKEN not found');
}

const CENTER_LATITUDE = 38.493;
const CENTER_LONGITUDE = -122.104;
const BOUNDS = { ne: [-122.084, 38.525], sw: [-122.124, 38.4623] };
const MAP_PACK = 'stebbins';
const DEFAULT_ZOOM = 13.3;
const MIN_ZOOM = 13;
const MAX_ZOOM = 22;
const getStyleUrl = () => {
  if (MAPBOX_STYLE_URL) {
    return MAPBOX_STYLE_URL;
  } else {
    console.error('❌ MAPBOX_STYLE_URL not found');
    return 'mapbox://styles/mapbox/outdoors-v12'; // fallback
  }
};
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const BLUE = '#022851';

type InfoModalProps = { visible: boolean; onClose: () => void; };
type AnyMarker = NatureTrailMarkerData | SafetyMarkerData | POIMarkerData;
type MarkerDetailModalProps = {
  marker: AnyMarker | null;
  imageUri: string | null | undefined;
  iconUri: string | null | undefined;
  onClose: () => void;
};
interface DisplayMarker {
  id: string;
  coordinate: [number, number];
  label: string;
  onPress?: () => void;
  iconUri?: string | null;
}

const InfoModal = ({ visible, onClose }: InfoModalProps) => {
    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.infoModalCloseButton} onPress={onClose}>
                        <Ionicons name="close" size={28} color={BLUE} />
                    </TouchableOpacity>
                    <Text style={styles.infoModalTitle}>Icon Descriptions</Text>
                    <ScrollView>
                        <View style={styles.iconRow}>
                            <FontAwesomeIcon name="download" size={24} color={BLUE} style={styles.icon} />
                            <Text style={styles.buttonText}>Deletes and redownloads the offline map to ensure all trail data is up to date.</Text>
                        </View>
                        <View style={styles.iconRow}>
                            <FontAwesomeIcon name="compress" size={24} color={BLUE} style={styles.icon} />
                            <Text style={styles.buttonText}>Resets the map view to the initial zoom level.</Text>
                        </View>
                         <View style={styles.iconRow}>
                            <Ionicons name="help-circle-sharp" size={24} color={BLUE} style={styles.icon} />
                            <Text style={styles.buttonText}>Opens this help screen.</Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const MarkerDetailModal = ({ marker, imageUri, iconUri, onClose }: MarkerDetailModalProps) => {
  if (!marker) return null;

  const title = 'common_name' in marker ? marker.common_name : marker.map_label;
  const subtitle = 'latin_name' in marker ? marker.latin_name : null;

  return (
    <Modal animationType="slide" transparent={true} visible={!!marker} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.markerModalView}>
          <ScrollView>
            <View style={styles.markerModalTitleSection}>
              {iconUri && <Image source={{ uri: iconUri }} style={styles.markerModalIcon} />}
              <View style={styles.markerModalTextContainer}>
                <Text style={styles.markerModalCommonName}>{title}</Text>
                {subtitle && <Text style={styles.markerModalLatinName}>{subtitle}</Text>}
              </View>
            </View>

            {imageUri && (
              <GestureHandlerRootView style={styles.imageContainer}>
                <ImageZoom
                  uri={imageUri}
                  style={styles.markerModalImage}
                  isDoubleTapEnabled={true}
                  isPanEnabled={true}
                />
              </GestureHandlerRootView>
            )}

            <View style={styles.markerModalContent}>
              {marker.description && <Text style={styles.markerModalDescription}>{marker.description}</Text>}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.markerModalCloseButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={BLUE} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


export default function MapScreen() {
  const mapview = useRef<MapboxGL.MapView | null>(null);
  const camera = useRef<MapboxGL.Camera | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapCached, setIsMapCached] = useState<boolean | null>(null);
  const isConnected = useIsConnected();
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<AnyMarker | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  const [activeMarkerTypes, setActiveMarkerTypes] = useState({
    nature: true,
    mile: true,
    safety: true,
    poi: true,
  });
  const [displayedMarkers, setDisplayedMarkers] = useState<DisplayMarker[]>([]);

  const { data: natureTrailMarkers, getImagePath: getNatureImagePath } = useScreen<NatureTrailMarkerData[]>('nature_trail_marker');
  const { data: mileMarkers } = useScreen<MileMarkerTrailData[]>('mile_marker');
  const { data: safetyMarkers, getImagePath: getSafetyImagePath } = useScreen<SafetyMarkerData[]>('safety_marker');
  const { data: poiMarkers, getImagePath: getPoiImagePath } = useScreen<POIMarkerData[]>('poi_marker');

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Check for location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your position on the map.');
        setLocationPermission(false);
      } else {
        setLocationPermission(true);
      }

      // 2. Check for offline map state
      await checkMapState();

      // 3. All checks are done, stop loading
      setIsLoading(false);
    };

    initializeApp();
  }, [isConnected]); // Re-check if connection status changes

  const selectedMarkerImageUri = selectedMarker?.image ? getImagePathForMarker(selectedMarker) : null;
  const selectedMarkerIconUri = selectedMarker && 'map_icon' in selectedMarker && selectedMarker.map_icon
      ? getImagePathForMarker(selectedMarker, true)
      : null;

  function getImagePathForMarker(marker: AnyMarker, forIcon: boolean = false) {
    const field = forIcon ? (marker as SafetyMarkerData).map_icon : marker.image;
    if (!field) return null;

    if ('common_name' in marker) return getNatureImagePath(field);
    if ('map_label' in marker) {
        if (safetyMarkers?.some(m => m.id === marker.id)) return getSafetyImagePath(field);
        if (poiMarkers?.some(m => m.id === marker.id)) return getPoiImagePath(field);
    }
    return null;
  }

  useEffect(() => {
    if (isLoading) return; // Don't compute markers while loading

    let markersToDisplay: DisplayMarker[] = [];

    if (activeMarkerTypes.nature && natureTrailMarkers) {
      let filteredNatureMarkers = natureTrailMarkers;
      if (zoomLevel < 14.5) {
        filteredNatureMarkers = natureTrailMarkers.filter(marker => parseInt(marker.marker_id, 10) % 4 === 0);
      } else if (zoomLevel >= 14.5 && zoomLevel < 16) {
        filteredNatureMarkers = natureTrailMarkers.filter(marker => parseInt(marker.marker_id, 10) % 2 === 0);
      }
      markersToDisplay.push(...filteredNatureMarkers.map(marker => ({
        id: `nature-${marker.id}`,
        coordinate: [marker.longitude, marker.latitude] as [number, number],
        label: marker.marker_id,
        onPress: () => setSelectedMarker(marker),
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
            onPress: () => setSelectedMarker(marker),
            iconUri: marker.map_icon ? getSafetyImagePath(marker.map_icon) : null,
        })));
    }

    if (activeMarkerTypes.poi && poiMarkers) {
        markersToDisplay.push(...poiMarkers.map(marker => ({
            id: `poi-${marker.id}`,
            coordinate: [marker.longitude, marker.latitude] as [number, number],
            label: marker.map_label,
            onPress: () => setSelectedMarker(marker),
            iconUri: marker.map_icon ? getPoiImagePath(marker.map_icon) : null,
        })));
    }

    setDisplayedMarkers(markersToDisplay);
  }, [isLoading, activeMarkerTypes, zoomLevel, natureTrailMarkers, mileMarkers, safetyMarkers, poiMarkers]);

  const deleteMap = async () => {
    try {
        await MapboxGL.offlineManager.deletePack(MAP_PACK);
    } catch (error: any) {
        console.error('Error deleting offline map:', error.message);
    }
  };

  const downloadOfflineMap = async () => {
    try {
      await MapboxGL.offlineManager.createPack({
        name: MAP_PACK, 
        styleURL: getStyleUrl(), 
        minZoom: MIN_ZOOM, 
        maxZoom: MAX_ZOOM, 
        bounds: [BOUNDS.sw, BOUNDS.ne]
      },
      (offlineRegion, status) => console.log(offlineRegion.name, status.percentage),
      (offlineRegion, err) => console.error('Offline pack download error:', offlineRegion.name, err)
      );
    } catch (error: any) {
      console.error('Error initiating offline region download:', error.message);
    }
  };

  const isMapDownloaded = async () => {
    try {
      return await MapboxGL.offlineManager.getPack(MAP_PACK);
    } catch (error: any) {
      console.error('Error getting offline map:', error.message);
      return null;
    }
  };

  const checkMapState = async () => {
    try {
      if (!await isMapDownloaded()) {
        if (isConnected) {
          await downloadOfflineMap();
          setIsMapCached(true);
        } else {
          setIsMapCached(false);
        }
      } else {
        setIsMapCached(true);
      }
    } catch (error: any) {
      console.error('Error checking offline map state:', error.message);
      setIsMapCached(false);
    }
  };

  const checkMapForUpdate = async () => {
    if (isConnected) {
        try {
            await deleteMap();
            await downloadOfflineMap();
            Alert.alert("Map Updated", "The offline map has been successfully updated.");
            setMapKey(prevKey => prevKey + 1);
        } catch (error: any) {
            Alert.alert("Error", `Failed to update map: ${error.message}`);
        }
    } else {
        Alert.alert("No Connection", "An internet connection is required to update the map.");
    }
  };

  const resetZoom = () => {
    camera.current?.setCamera({
      centerCoordinate: [CENTER_LONGITUDE, CENTER_LATITUDE],
      zoomLevel: DEFAULT_ZOOM,
      animationDuration: 1000,
    });
  };

  const onCameraChanged = (event: any) => {
    setZoomLevel(event.properties.zoom);
  };

  const toggleInfoModal = () => setInfoModalVisible(!isInfoModalVisible);

  const toggleMarkerType = (type: keyof typeof activeMarkerTypes) => {
    if (toastTimer.current) {
        clearTimeout(toastTimer.current);
    }

    const willBeActive = !activeMarkerTypes[type];
    const typeNameMap = {
      nature: 'Nature',
      mile: 'Mile',
      safety: 'Safety',
      poi: 'POI'
    };
    
    setToastMessage(`${willBeActive ? 'Showing' : 'Hiding'} ${typeNameMap[type]} Markers`);
    
    toastTimer.current = setTimeout(() => {
        setToastMessage(null);
        toastTimer.current = null;
    }, 2000);

    setActiveMarkerTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (isMapCached || isConnected) {
    return (
      <View style={styles.page}>
        <InfoModal visible={isInfoModalVisible} onClose={toggleInfoModal} />
        <MarkerDetailModal
            marker={selectedMarker}
            imageUri={selectedMarkerImageUri}
            iconUri={selectedMarkerIconUri}
            onClose={() => setSelectedMarker(null)}
        />
        <View style={styles.container}>
          <MapboxGL.MapView
            key={mapKey}
            ref={mapview}
            style={styles.map}
            styleURL={getStyleUrl()}
            rotateEnabled={true}
            onCameraChanged={onCameraChanged}
          >
            <MapboxGL.Camera
              ref={camera}
              defaultSettings={{ centerCoordinate: [CENTER_LONGITUDE, CENTER_LATITUDE], zoomLevel: DEFAULT_ZOOM }}
              maxBounds={BOUNDS}
              minZoomLevel={MIN_ZOOM}
            />
            
            {locationPermission && <MapboxGL.UserLocation visible={true} />}

            {displayedMarkers.map((marker) => (
              <MapboxGL.MarkerView key={marker.id} id={marker.id} coordinate={marker.coordinate} anchor={{ x: 0.5, y: 1 }}>
                <TouchableOpacity onPress={marker.onPress} disabled={!marker.onPress} style={styles.markerWrapper}>
                  {marker.iconUri ? (
                    <Image source={{ uri: marker.iconUri }} style={styles.customMarkerIcon} />
                  ) : (
                    <>
                      <View style={styles.markerContainer}>
                        <Text style={styles.markerText} adjustsFontSizeToFit numberOfLines={1}>
                          {marker.label}
                        </Text>
                      </View>
                      <View style={styles.markerPin} />
                    </>
                  )}
                </TouchableOpacity>
              </MapboxGL.MarkerView>
            ))}
          </MapboxGL.MapView>
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.mapActionButton, styles.mapButtonTop]} onPress={checkMapForUpdate}>
              <FontAwesomeIcon name="download" size={22} color={BLUE} />
            </Pressable>
            <Pressable style={[styles.mapActionButton, styles.mapButtonMiddle]} onPress={resetZoom}>
              <FontAwesomeIcon name="compress" size={20} color={BLUE} />
            </Pressable>
            <Pressable style={[styles.mapActionButton, styles.mapButtonBottom]} onPress={toggleInfoModal}>
              <Ionicons name="help-circle-sharp" size={28} color={BLUE} />
            </Pressable>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity style={[styles.toggleButton, activeMarkerTypes.nature && styles.toggleButtonActive]} onPress={() => toggleMarkerType('nature')}>
                <FontAwesome name="leaf" size={16} color={activeMarkerTypes.nature ? '#fff' : BLUE} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleButton, activeMarkerTypes.mile && styles.toggleButtonActive]} onPress={() => toggleMarkerType('mile')}>
                <FontAwesomeIcon name="road" size={16} color={activeMarkerTypes.mile ? '#fff' : BLUE} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleButton, activeMarkerTypes.safety && styles.toggleButtonActive]} onPress={() => toggleMarkerType('safety')}>
                <FontAwesomeIcon name="shield-halved" size={16} color={activeMarkerTypes.safety ? '#fff' : BLUE} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleButton, activeMarkerTypes.poi && styles.toggleButtonActive]} onPress={() => toggleMarkerType('poi')}>
                <FontAwesome name="map-marker" size={16} color={activeMarkerTypes.poi ? '#fff' : BLUE} />
            </TouchableOpacity>
          </View>

          {toastMessage && (
            <View style={styles.toastContainer}>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          )}

        </View>
      </View>
    );
  } else {
    return (
      <GestureHandlerRootView style={styles.page}>
        <View style={styles.container}>
          <ImageZoom
            source={require("@/assets/dev/stebbins-map.png")}
            style={styles.offlineMapImage}
            isDoubleTapEnabled={true}
            maxPanPointers={1}
          />
        </View>
      </GestureHandlerRootView>
    );
  }
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f0f0f0' },
  container: { flex: 1, overflow: 'hidden' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  map: { flex: 1 },
  offlineMapImage: { width: DEVICE_WIDTH, height: DEVICE_HEIGHT },
  buttonContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'column',
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mapActionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  mapButtonTop: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mapButtonMiddle: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  mapButtonBottom: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 16, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, maxHeight: '80%', width: '90%' },
  infoModalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  infoModalCloseButton: { position: 'absolute', top: 15, right: 15, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(104, 132, 163, 0.5)', zIndex: 1 },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  icon: { marginRight: 20, width: 25, textAlign: 'center' },
  buttonText: { lineHeight: 25, fontSize: 16, flex: 1 },
  markerWrapper: { alignItems: 'center' },
  markerContainer: { backgroundColor: '#fff', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderColor: BLUE, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3, elevation: 5, padding: 2 },
  markerText: { color: BLUE, fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  markerPin: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10, borderStyle: 'solid', backgroundColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: BLUE },
  customMarkerIcon: { width: 36, height: 36, resizeMode: 'contain' },
  markerModalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 20,
  },
  markerModalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
  },
  markerModalIcon: { width: 40, height: 40, marginRight: 15, resizeMode: 'contain' },
  markerModalTextContainer: { flex: 1 },
  markerModalCommonName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  markerModalLatinName: { fontSize: 16, fontStyle: 'italic', color: '#666' },
  imageContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
  },
  markerModalImage: {
    width: '100%',
    height: '100%',
  },
  markerModalContent: {
    paddingTop: 15,
  },
  markerModalDescription: { fontSize: 16, lineHeight: 24, color: '#444' },
  markerModalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: { position: 'absolute', bottom: 30, alignSelf: 'center', flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, padding: 4 },
  toggleButton: { width: 50, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 2 },
  toggleButtonActive: { backgroundColor: BLUE },
  toastContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 5,
    zIndex: 10,
  },
  toastText: {
    color: 'white',
    fontSize: 14,
  },
});