import { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Pressable, Modal, Text, ScrollView, Alert, Image, TouchableOpacity, Animated } from 'react-native';
import MapboxGL from "@rnmapbox/maps";
import { useIsConnected } from 'react-native-offline';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { FontAwesome6 as FontAwesomeIcon, Ionicons } from '@expo/vector-icons';
import { useScreen, NatureTrailMarkerData, MileMarkerTrailData } from '@/contexts/ApiContext';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

// --- Constants ---
const CENTER_LATITUDE = 38.493;
const CENTER_LONGITUDE = -122.104;
const BOUNDS = { ne: [-122.084, 38.525], sw: [-122.124, 38.4623] };
const MAP_PACK = 'stebbins-test';
const DEFAULT_ZOOM = 13.3;
const MIN_ZOOM = 13;
const MAX_ZOOM = 22;
const STYLE_URL = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL;
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const BLUE = '#1D4776';

// --- Prop Types & Helper Components ---
type InfoModalProps = { visible: boolean; onClose: () => void; };
type MarkerDetailModalProps = { marker: NatureTrailMarkerData | null; onClose: () => void; };

interface DisplayMarker {
  id: number;
  coordinate: [number, number];
  label: string;
  onPress?: () => void;
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

const MarkerDetailModal = ({ marker, onClose }: MarkerDetailModalProps) => {
  if (!marker) return null;
  const imageUri = marker.image;

  return (
    <Modal animationType="slide" transparent={true} visible={!!marker} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.markerModalView}>
          <ScrollView contentContainerStyle={styles.markerModalScrollView}>
            <View style={styles.markerModalTitleSection}>
              <Text style={styles.markerModalCommonName}>{marker.common_name}</Text>
              <Text style={styles.markerModalLatinName}>{marker.latin_name}</Text>
            </View>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.markerModalImage} />
            )}
            <View style={styles.markerModalContent}>
              <Text style={styles.markerModalDescription}>{marker.description}</Text>
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

// --- Main Screen Component ---
export default function MapScreen() {
  const mapview = useRef<MapboxGL.MapView | null>(null);
  const camera = useRef<MapboxGL.Camera | null>(null);
  const [isMapCached, setIsMapCached] = useState<boolean | null>(null);
  const isConnected = useIsConnected();
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<NatureTrailMarkerData | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);

  const [activeMarkerType, setActiveMarkerType] = useState<'nature' | 'mile'>('nature');
  const [displayedMarkers, setDisplayedMarkers] = useState<DisplayMarker[]>([]);
  
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const [natureButtonWidth, setNatureButtonWidth] = useState(0);
  const [mileButtonWidth, setMileButtonWidth] = useState(0);

  const { data: natureTrailMarkers } = useScreen<NatureTrailMarkerData[]>('nature_trail_marker');
  const { data: mileMarkers } = useScreen<MileMarkerTrailData[]>('mile_marker');
  
  useEffect(() => {
    Animated.spring(slideAnimation, {
      toValue: activeMarkerType === 'nature' ? 0 : 1,
      useNativeDriver: false, // Required for animating width/translateX
      bounciness: 8,
    }).start();
  }, [activeMarkerType]);

  const translateX = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, natureButtonWidth],
  });

  const animatedWidth = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [natureButtonWidth, mileButtonWidth],
  });

  useEffect(() => {
    let markersToDisplay: DisplayMarker[] = [];

    if (activeMarkerType === 'nature' && natureTrailMarkers) {
      let filteredNatureMarkers;
      if (zoomLevel < 14.5) {
        filteredNatureMarkers = natureTrailMarkers.filter(marker => parseInt(marker.marker_id, 10) % 4 === 0);
      } else if (zoomLevel >= 14.5 && zoomLevel < 16) {
        filteredNatureMarkers = natureTrailMarkers.filter(marker => parseInt(marker.marker_id, 10) % 2 === 0);
      } else {
        filteredNatureMarkers = natureTrailMarkers;
      }
      markersToDisplay = filteredNatureMarkers.map(marker => ({
        id: marker.id,
        coordinate: [marker.longitude, marker.latitude],
        label: marker.marker_id,
        onPress: () => setSelectedMarker(marker),
      }));
    } else if (activeMarkerType === 'mile' && mileMarkers) {
      markersToDisplay = mileMarkers.map(marker => ({
        id: marker.id,
        coordinate: [marker.longitude, marker.latitude],
        label: marker.value.toString(),
        onPress: undefined,
      }));
    }

    setDisplayedMarkers(markersToDisplay);
  }, [activeMarkerType, zoomLevel, natureTrailMarkers, mileMarkers]);

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
        name: MAP_PACK, styleURL: STYLE_URL, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, bounds: [[-122.124, 38.4623], [-122.084, 38.525]]
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

  useEffect(() => {
    if (isMapCached === null) {
      checkMapState();
    }
  }, [isMapCached]);
  
  const onCameraChanged = (event: any) => {
    setZoomLevel(event.properties.zoom);
  };

  const toggleInfoModal = () => setInfoModalVisible(!isInfoModalVisible);

  if (isMapCached || isConnected) {
    return (
      <View style={styles.page}>
        <InfoModal visible={isInfoModalVisible} onClose={toggleInfoModal} />
        <MarkerDetailModal marker={selectedMarker} onClose={() => setSelectedMarker(null)} />
        <View style={styles.container}>
          <MapboxGL.MapView 
            key={mapKey} 
            ref={mapview} 
            style={styles.map} 
            styleURL={STYLE_URL} 
            rotateEnabled={true}
            onCameraChanged={onCameraChanged}
          >
            <MapboxGL.Camera 
              ref={camera} 
              defaultSettings={{ centerCoordinate: [CENTER_LONGITUDE, CENTER_LATITUDE], zoomLevel: DEFAULT_ZOOM }} 
              maxBounds={BOUNDS} 
              minZoomLevel={MIN_ZOOM}
            />
            {displayedMarkers.map((marker) => (
              <MapboxGL.MarkerView key={`${activeMarkerType}-${marker.id}`} id={marker.id.toString()} coordinate={marker.coordinate} anchor={{ x: 0.5, y: 1 }}>
                <TouchableOpacity onPress={marker.onPress} disabled={!marker.onPress} style={styles.markerWrapper}>
                  <View style={styles.markerContainer}>
                    <Text style={styles.markerText} adjustsFontSizeToFit numberOfLines={1}>
                      {marker.label}
                    </Text>
                  </View>
                  <View style={styles.markerPin} />
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
            <Animated.View style={[styles.slidingToggle, { width: animatedWidth, transform: [{ translateX: translateX }] }]} />
            <Pressable
              style={styles.toggleButton}
              onPress={() => setActiveMarkerType('nature')}
              onLayout={(e) => setNatureButtonWidth(e.nativeEvent.layout.width)}
            >
              <Text style={[styles.toggleButtonText, activeMarkerType === 'nature' && styles.toggleButtonTextActive]}>Nature Trail</Text>
            </Pressable>
            <Pressable
              style={styles.toggleButton}
              onPress={() => setActiveMarkerType('mile')}
              onLayout={(e) => setMileButtonWidth(e.nativeEvent.layout.width)}
            >
              <Text style={[styles.toggleButtonText, activeMarkerType === 'mile' && styles.toggleButtonTextActive]}>Mile Markers</Text>
            </Pressable>
          </View>
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

// --- Styles ---
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f0f0f0' },
  container: { flex: 1, overflow: 'hidden' },
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
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.0)' },
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
  markerModalView: { width: '90%', maxHeight: '80%', backgroundColor: 'white', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, overflow: 'hidden' },
  markerModalScrollView: { paddingBottom: 20 },
  markerModalTitleSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  markerModalCommonName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  markerModalLatinName: { fontSize: 16, fontStyle: 'italic', color: '#666' },
  markerModalImage: { width: '100%', height: 220, backgroundColor: '#e0e0e0', marginBottom: 15 },
  markerModalContent: { paddingHorizontal: 20 },
  markerModalDescription: { fontSize: 16, lineHeight: 24, color: '#444' },
  markerModalCloseButton: { position: 'absolute', top: 15, right: 15, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(104, 132, 163, 0.5)', justifyContent: 'center', alignItems: 'center' },
  toggleContainer: { position: 'absolute', bottom: 30, alignSelf: 'center', flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  slidingToggle: { position: 'absolute', height: '100%', backgroundColor: BLUE, borderRadius: 12 },
  toggleButton: { paddingVertical: 10, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  toggleButtonText: { color: BLUE, fontWeight: '600', fontSize: 14 },
  toggleButtonTextActive: { color: '#fff' },
});