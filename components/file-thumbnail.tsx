import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getFileSizeDisplay } from '@/utility/image-processing';

interface FileThumbnailProps {
  file: ImagePicker.ImagePickerAsset;
  index: number;
  onRemove: (index: number) => void;
}

export default function FileThumbnail({ file, index, onRemove }: FileThumbnailProps) {
  const isVideo = file.type === 'video';

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {isVideo ? (
          <View style={styles.videoThumbnail}>
            <Ionicons name="videocam" size={24} color="white" />
          </View>
        ) : (
          <Image source={{ uri: file.uri }} style={styles.imageThumbnail} />
        )}
      </View>
      
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.fileName || (isVideo ? 'Video file' : 'Image file')}
        </Text>
        {file.fileSize && (
          <Text style={styles.fileSize}>
            {getFileSizeDisplay(file.fileSize)}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        onPress={() => onRemove(index)} 
        style={styles.removeButton}
      >
        <Ionicons name="close" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  imageContainer: {
    marginRight: 12,
  },
  imageThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  videoThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});