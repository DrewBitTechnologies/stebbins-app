import { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, AppState } from 'react-native';
import MapboxGL from "@rnmapbox/maps";
import { useIsConnected } from 'react-native-offline';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import * as Location from 'expo-location';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

const MAX_LATITUDE = 38.525;
const MIN_LATITUDE = 38.4623;
const MAX_LONGITUDE = -122.084;
const MIN_LONGITUDE = -122.124;
const CENTER_LATITUDE = 38.493;
const CENTER_LONGITUDE = -122.104;

const BOUNDS = {
    ne: [MAX_LONGITUDE, MAX_LATITUDE],
    sw: [MIN_LONGITUDE, MIN_LATITUDE],
};

const MAP_PACK = 'stebbins-test';
const DEFAULT_ZOOM = 13.3;
const MIN_ZOOM = 13;
const MAX_ZOOM = 22;
const STYLE_URL = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL;

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

const UserLocationDot = () => (
    <View style={styles.userLocationDot} />
);

export default function MapScreen() {
    const mapview = useRef<MapboxGL.MapView | null>(null);
    const [isMapCached, setIsMapCached] = useState<boolean | null>(null);
    const isConnected = useIsConnected();
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

    useEffect(() => {
        const requestLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);
        };

        requestLocation();

        const locationSubscription = Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 1000,
                distanceInterval: 1,
            },
            (newLocation) => {
                setUserLocation(newLocation);
            }
        );
        
        return () => {
            if (locationSubscription) {
                (async () => (await locationSubscription).remove())();
            }
        };
    }, []);

    const downloadOfflineMap = async () => {
        try {
            const progressListener = (offlineRegion: any, status: any) => console.log('Offline pack download progress:', offlineRegion.name, status.percentage);
            const errorListener = (offlineRegion: any, error: any) => console.error('Offline pack download error:', offlineRegion.name, error);
            await MapboxGL.offlineManager.createPack({
                name: MAP_PACK,
                styleURL: STYLE_URL,
                minZoom: MIN_ZOOM,
                maxZoom: MAX_ZOOM,
                bounds: [[MIN_LONGITUDE, MIN_LATITUDE], [MAX_LONGITUDE, MAX_LATITUDE]]
            }, progressListener, errorListener);
            console.log('Offline region downloaded successfully');
        } catch (error) {
            console.error('Error initiating offline region download:', error);
        }
    };

    const isMapDownloaded = async () => {
        try {
            return await MapboxGL.offlineManager.getPack(MAP_PACK);
        } catch (error) {
            console.error('Error getting offline map:', error);
            return null;
        }
    };
    
    const checkMapState = async () => {
        try {
            if (!await isMapDownloaded()) {
                if (isConnected) {
                    await downloadOfflineMap();
                    console.log("Offline map not found, downloading map now");
                    setIsMapCached(true);
                } else {
                    console.log("Not connected to internet, map will not be downloaded. Displaying static image.");
                    setIsMapCached(false);
                }
            } else {
                console.log("Offline map found. Using cached map.");
                setIsMapCached(true);
            }
        } catch (error) {
            console.error('Error checking offline map state:', error);
            setIsMapCached(false);
        }
    };

    const mapLoadError = () => {
        console.log("Map load failed.");
    };

    useEffect(() => {
        if (isMapCached === null) {
            checkMapState();
        }
    }, [isMapCached]);


    if (isMapCached || isConnected) {
        return (
            <View style={styles.page}>
                <View style={styles.container}>
                    <MapboxGL.MapView
                        style={styles.map}
                        zoomEnabled={true}
                        styleURL={STYLE_URL}
                        rotateEnabled={true}
                        pitchEnabled={false}
                        compassEnabled={true}
                        attributionPosition={{ bottom: 8, right: 8 }}
                        compassViewPosition={1}
                        ref={mapview}
                        onMapLoadingError={mapLoadError}
                    >
                        <MapboxGL.Camera
                            zoomLevel={DEFAULT_ZOOM}
                            centerCoordinate={[CENTER_LONGITUDE, CENTER_LATITUDE]}
                            animationMode={'none'}
                            maxBounds={BOUNDS}
                            maxZoomLevel={MAX_ZOOM}
                            minZoomLevel={MIN_ZOOM}
                        />
                        
                        {userLocation?.coords && (
                            <MapboxGL.PointAnnotation
                                id="user-location"
                                coordinate={[userLocation.coords.longitude, userLocation.coords.latitude]}
                            >
                                <UserLocationDot />
                            </MapboxGL.PointAnnotation>
                        )}
                    </MapboxGL.MapView>
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
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#CCCCCC",
        overflow: 'hidden'
    },
    page: {
        flex: 1,
        flexDirection: "column"
    },
    map: {
        flex: 1
    },
    offlineMapImage: {
        width: DEVICE_WIDTH,
        height: DEVICE_HEIGHT
    },
    userLocationDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        borderColor: 'white',
        borderWidth: 2,
    },
});