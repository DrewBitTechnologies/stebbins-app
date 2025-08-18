import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ColorPalette } from '@/assets/dev/color_palette';

export default function InfoModalContent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Controls & Markers</Text>
      
      <Text style={styles.sectionTitle}>Map Controls</Text>
      
      <View style={styles.iconRow}>
        <Ionicons name="cloud-download" size={25} color={ColorPalette.primary_blue} style={styles.icon} />
        <Text style={styles.buttonText}>
          Deletes and redownloads the offline map to ensure all trail data is up to date.
        </Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="contract" size={25} color={ColorPalette.primary_blue} style={styles.icon} />
        <Text style={styles.buttonText}>
          Resets the map view to the initial zoom level and center position.
        </Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="compass" size={25} color={ColorPalette.primary_blue} style={styles.icon} />
        <Text style={styles.buttonText}>
          Reorients the map where north is towards the top of the screen.
        </Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="help-circle" size={25} color={ColorPalette.primary_blue} style={styles.icon} />
        <Text style={styles.buttonText}>
          Opens this help screen with all icon descriptions.
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>Marker Filters</Text>
      
      <View style={styles.iconRow}>
        <Ionicons name="leaf" size={25} color={ColorPalette.primary_blue} style={styles.icon} />
        <Text style={styles.buttonText}>
          Toggle nature trail markers - show or hide plant and wildlife information points.
        </Text>
      </View>
      
      <View style={styles.iconRow}>
        <MaterialCommunityIcons name="map-marker" size={25} color={ColorPalette.primary_blue} style={styles.icon} />
        <Text style={styles.buttonText}>
          Toggle mile markers - show or hide distance markers along the trail.
        </Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="shield-checkmark" size={25} color={ColorPalette.primary_blue} style={styles.icon} />
        <Text style={styles.buttonText}>
          Toggle safety markers - show or hide emergency and safety information points.
        </Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="flag" size={25} color={ColorPalette.primary_blue} style={styles.icon} />
        <Text style={styles.buttonText}>
          Toggle points of interest - show or hide notable locations and landmarks.
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>Map Features</Text>
      
      <View style={styles.iconRow}>
        <View style={styles.locationDot} />
        <Text style={styles.buttonText}>
          Your current location (requires location permission).
        </Text>
      </View>
      
      <View style={styles.iconRow}>
        <View style={styles.pinchGesture} />
        <Text style={styles.buttonText}>
          Pinch to zoom in/out, tap markers for details, drag to pan around the map.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20, // Space for close button
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ColorPalette.text_primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ColorPalette.primary_blue,
    marginTop: 15,
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  icon: {
    marginRight: 20,
    width: 25,
    textAlign: 'center',
  },
  buttonText: {
    lineHeight: 22,
    fontSize: 15,
    flex: 1,
    color: ColorPalette.text_primary,
  },
  markerContainer: {
    backgroundColor: ColorPalette.white,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: ColorPalette.primary_blue,
    borderWidth: 2,
    marginRight: 20,
  },
  markerText: {
    color: ColorPalette.primary_blue,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  locationDot: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#007AFF',
    marginRight: 20,
    borderWidth: 3,
    borderColor: ColorPalette.white,
    shadowColor: ColorPalette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  pinchGesture: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(2, 40, 81, 0.1)',
    borderColor: ColorPalette.primary_blue,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginRight: 20,
  },
});