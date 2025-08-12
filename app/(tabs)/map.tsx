import { MileMarkerTrailData, NatureTrailMarkerData, POIMarkerData, SafetyMarkerData, useScreen } from '@/contexts/api';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from '@/contexts/api.config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import MapboxGL from "@rnmapbox/maps";
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';
import { 
  getStyleUrl, 
  checkMapState, 
  checkMapForUpdate,
  CENTER_LONGITUDE,
  CENTER_LATITUDE,
  DEFAULT_ZOOM,
  BOUNDS,
  MIN_ZOOM
} from '@/utility/mapbox-utils';
import { 
  AnyMarker, 
  MarkerTypes,
  createDisplayMarkers
} from '@/utility/marker-utils';
import { useToast, getMarkerTypeDisplayName } from '@/utility/toast-notifications';
import { getImageSource } from '@/utility/image-source';
import DetailModal from '@/components/detail-modal';
import MarkerDetailCard from '@/components/marker-detail-card';
import InfoModalContent from '@/components/info-modal-content';
import Toast from '@/components/toast';

// Initialize Mapbox
if (MAPBOX_ACCESS_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
} else {
  console.error('❌ MAPBOX_ACCESS_TOKEN not found');
}

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const BLUE = '#022851';



export default function MapScreen() {
  const mapview = useRef<MapboxGL.MapView | null>(null);
  const camera = useRef<MapboxGL.Camera>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapCached, setIsMapCached] = useState<boolean | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<AnyMarker | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { showToast } = useToast();
  const [locationPermission, setLocationPermission] = useState(false);

  const [activeMarkerTypes, setActiveMarkerTypes] = useState<MarkerTypes>({
    nature: true,
    mile: true,
    safety: true,
    poi: true,
  });

  const { data: natureTrailMarkers, getImagePath: getNatureImagePath } = useScreen<NatureTrailMarkerData[]>('nature_trail_marker');
  const { data: mileMarkers } = useScreen<MileMarkerTrailData[]>('mile_marker');
  const { data: safetyMarkers, getImagePath: getSafetyImagePath } = useScreen<SafetyMarkerData[]>('safety_marker');
  const { data: poiMarkers, getImagePath: getPoiImagePath } = useScreen<POIMarkerData[]>('poi_marker');

  useEffect(() => {
    // Set up network info listener
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
      const mapCached = await checkMapState(isConnected);
      setIsMapCached(mapCached);

      // 3. All checks are done, stop loading
      setIsLoading(false);
    };

    if (isConnected !== null) { // Wait for network state to be determined
      initializeApp();
    }
  }, [isConnected]);

  const selectedMarkerImageSource = selectedMarker ? 
    getImageSource(selectedMarker, 'image', 
      'common_name' in selectedMarker ? getNatureImagePath :
      safetyMarkers?.some(m => m.id === selectedMarker.id) ? getSafetyImagePath :
      getPoiImagePath) : null;
  const selectedMarkerImageUri = selectedMarkerImageSource && typeof selectedMarkerImageSource === 'object' && 'uri' in selectedMarkerImageSource ? selectedMarkerImageSource.uri : null;
    
  const selectedMarkerIconSource = selectedMarker && 'map_icon' in selectedMarker ? 
    getImageSource(selectedMarker, 'map_icon',
      safetyMarkers?.some(m => m.id === selectedMarker.id) ? getSafetyImagePath :
      getPoiImagePath) : null;
  const selectedMarkerIconUri = selectedMarkerIconSource && typeof selectedMarkerIconSource === 'object' && 'uri' in selectedMarkerIconSource ? selectedMarkerIconSource.uri : null;

  const displayedMarkers = useMemo(() => {
    if (isLoading) return []; // Don't compute markers while loading

    return createDisplayMarkers(
      activeMarkerTypes,
      zoomLevel,
      natureTrailMarkers || undefined,
      mileMarkers || undefined,
      safetyMarkers || undefined,
      poiMarkers || undefined,
      setSelectedMarker,
      getSafetyImagePath,
      getPoiImagePath
    );
  }, [isLoading, activeMarkerTypes, zoomLevel, natureTrailMarkers, mileMarkers, safetyMarkers, poiMarkers]);

  const handleMapUpdate = () => {
    checkMapForUpdate(
      isConnected, 
      getStyleUrl(MAPBOX_STYLE_URL), 
      () => {}, // onSuccess callback if needed
      setMapKey
    );
  };

  const handleResetZoom = () => {
    camera.current?.setCamera({
      centerCoordinate: [CENTER_LONGITUDE, CENTER_LATITUDE],
      zoomLevel: DEFAULT_ZOOM,
      animationDuration: 1000,
    });
  };

  const handleResetOrientation = () => {
    camera.current?.setCamera({
      heading: 0,
      animationDuration: 1000,
    });
  };

  const onCameraChanged = (event: any) => {
    setZoomLevel(event.properties.zoom);
  };

  const toggleInfoModal = () => setInfoModalVisible(!isInfoModalVisible);

  const toggleMarkerType = (type: keyof MarkerTypes) => {
    const willBeActive = !activeMarkerTypes[type];
    const typeName = getMarkerTypeDisplayName(type);
    
    showToast(
      `${willBeActive ? 'Showing' : 'Hiding'} ${typeName} Markers`,
      setToastMessage
    );

    setActiveMarkerTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (isMapCached === true || isConnected) {
    return (
      <View style={styles.page}>
        <DetailModal 
          visible={isInfoModalVisible} 
          onClose={toggleInfoModal}
          variant="default"
        >
          <InfoModalContent />
        </DetailModal>
        
        <DetailModal
          visible={!!selectedMarker}
          onClose={() => setSelectedMarker(null)}
        >
          {selectedMarker && (
            <MarkerDetailCard
              marker={selectedMarker}
              imageUri={selectedMarkerImageUri}
              iconUri={selectedMarkerIconUri}
            />
          )}
        </DetailModal>
        <View style={styles.container}>
          <MapboxGL.MapView
            key={mapKey}
            ref={mapview}
            style={styles.map}
            styleURL={getStyleUrl(MAPBOX_STYLE_URL)}
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
            <Pressable style={[styles.mapActionButton, styles.mapButtonTop]} onPress={handleMapUpdate}>
              <Ionicons name="cloud-download" size={25} color={BLUE} />
            </Pressable>
            <Pressable style={[styles.mapActionButton, styles.mapButtonMiddle]} onPress={handleResetZoom}>
              <Ionicons name="contract" size={25} color={BLUE} />
            </Pressable>
            <Pressable style={[styles.mapActionButton, styles.mapButtonMiddle]} onPress={handleResetOrientation}>
              <Ionicons name="compass" size={25} color={BLUE} />
            </Pressable>
            <Pressable style={[styles.mapActionButton, styles.mapButtonBottom]} onPress={toggleInfoModal}>
              <Ionicons name="help-circle" size={25} color={BLUE} />
            </Pressable>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity style={[styles.toggleButton, activeMarkerTypes.nature && styles.toggleButtonActive]} onPress={() => toggleMarkerType('nature')}>
                <Ionicons name="leaf" size={25} color={activeMarkerTypes.nature ? '#fff' : BLUE} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleButton, activeMarkerTypes.mile && styles.toggleButtonActive]} onPress={() => toggleMarkerType('mile')}>
                <MaterialCommunityIcons name="map-marker-radius" size={25} color={activeMarkerTypes.mile ? '#fff' : BLUE} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleButton, activeMarkerTypes.safety && styles.toggleButtonActive]} onPress={() => toggleMarkerType('safety')}>
                <Ionicons name="shield-checkmark" size={25} color={activeMarkerTypes.safety ? '#fff' : BLUE} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleButton, activeMarkerTypes.poi && styles.toggleButtonActive]} onPress={() => toggleMarkerType('poi')}>
                <Ionicons name="flag" size={25} color={activeMarkerTypes.poi ? '#fff' : BLUE} />
            </TouchableOpacity>
          </View>

          <Toast message={toastMessage} />

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
  markerWrapper: { alignItems: 'center' },
  markerContainer: { backgroundColor: '#fff', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderColor: BLUE, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3, elevation: 5, padding: 2 },
  markerText: { color: BLUE, fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  markerPin: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10, borderStyle: 'solid', backgroundColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: BLUE },
  customMarkerIcon: { width: 36, height: 36, resizeMode: 'contain' },
  toggleContainer: { position: 'absolute', bottom: 30, alignSelf: 'center', flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, padding: 4 },
  toggleButton: { width: 50, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 2 },
  toggleButtonActive: { backgroundColor: BLUE },
});