import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AnyMarker, getMarkerTitle, getMarkerSubtitle } from '@/utility/marker-utils';

interface MarkerDetailCardProps {
  marker: AnyMarker;
  imageUri: string | null | undefined;
  iconUri: string | null | undefined;
}

export default function MarkerDetailCard({ 
  marker, 
  imageUri, 
  iconUri 
}: MarkerDetailCardProps) {
  const title = getMarkerTitle(marker);
  const subtitle = getMarkerSubtitle(marker);

  return (
    <View style={styles.container}>
      {imageUri && (
        <GestureHandlerRootView style={styles.imageContainer}>
          <ImageZoom
            uri={imageUri}
            style={styles.image}
            isDoubleTapEnabled={true}
            isPanEnabled={true}
            resizeMode="cover"
          />
        </GestureHandlerRootView>
      )}

      <View style={styles.titleSection}>
        {iconUri && (
          <Image 
            source={{ uri: iconUri }} 
            style={styles.icon} 
          />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.commonName}>{title}</Text>
          {subtitle && (
            <Text style={styles.latinName}>{subtitle}</Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {marker.description && (
          <Text style={styles.description}>{marker.description}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20, // Space for close button
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
  },
  commonName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  latinName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  imageContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingTop: 0,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});