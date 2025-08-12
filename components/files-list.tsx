import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import FileThumbnail from './file-thumbnail';
import { ColorPalette } from '@/assets/dev/color_palette';

interface FilesListProps {
  files: ImagePicker.ImagePickerAsset[];
  onRemoveFile: (index: number) => void;
  onRemoveAll: () => void;
}

export default function FilesList({ files, onRemoveFile, onRemoveAll }: FilesListProps) {
  if (files.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.countContainer}>
          <Ionicons name="documents" size={16} color={ColorPalette.primary_green} style={{ marginRight: 6 }} />
          <Text style={styles.count}>{files.length} file(s) selected</Text>
        </View>
        {files.length > 1 && (
          <TouchableOpacity onPress={onRemoveAll} style={styles.removeAllButton}>
            <Ionicons name="trash" size={14} color={ColorPalette.white} style={{ marginRight: 4 }} />
            <Text style={styles.removeAllButtonText}>Remove All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filesContainer}>
        {files.map((file, index) => (
          <FileThumbnail
            key={index}
            file={file}
            index={index}
            onRemove={onRemoveFile}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: ColorPalette.primary_green,
  },
  removeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.primary_red,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeAllButtonText: {
    color: ColorPalette.white,
    fontSize: 12,
    fontWeight: '600',
  },
  filesContainer: {
    gap: 8,
  },
});