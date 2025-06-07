import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ImageBackground, Image, Alert
} from 'react-native';
import { useScreen, ReportData } from '@/contexts/ApiContext';
import * as ImagePicker from 'expo-image-picker';

export default function ReportScreen() {
  const { data, getImagePath } = useScreen<ReportData>('report');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Define getBackgroundSource as a proper function
  const getBackgroundSource = () => { // <--- This line was missing or malformed
    const backgroundPath = getImagePath('background');
    
    if (backgroundPath) {
      return { uri: backgroundPath };
    }
    return require("@/assets/dev/fallback.jpeg");
  };

  const pickFile = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Permission to access media library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true, // Enable multiple selection
      });

      if (result.canceled) {
        console.log('User canceled file selection');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const validFiles: ImagePicker.ImagePickerAsset[] = [];
        const maxSizeInMB = 50;
        
        for (const selectedFile of result.assets) {
          const fileSizeInMB = (selectedFile.fileSize || 0) / (1024 * 1024);
          
          if (selectedFile.fileSize && fileSizeInMB > maxSizeInMB) {
            Alert.alert(
              'File Too Large', 
              `File "${selectedFile.fileName || 'Unknown'}" (${fileSizeInMB.toFixed(1)}MB) exceeds the ${maxSizeInMB}MB limit and was skipped.`
            );
            continue;
          }
          
          validFiles.push(selectedFile);
        }

        if (validFiles.length > 0) {
          // Add new files to existing files array
          setFiles(prevFiles => [...prevFiles, ...validFiles]);
          console.log(`${validFiles.length} file(s) selected`);
        }
      }

    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'An error occurred while selecting the file. Please try again.');
    }
  };

  const removeFile = (indexToRemove: number) => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove))
        }
      ]
    );
  };

  const removeAllFiles = () => {
    Alert.alert(
      'Remove All Files',
      'Are you sure you want to remove all selected files?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove All', style: 'destructive', onPress: () => setFiles([]) }
      ]
    );
  };

  const getFileSizeDisplay = (fileSize?: number) => {
    if (!fileSize) return '';
    const sizeInMB = fileSize / (1024 * 1024);
    return sizeInMB > 1 ? `${sizeInMB.toFixed(1)}MB` : `${(fileSize / 1024).toFixed(0)}KB`;
  };

  const handleSubmit = () => {
    // You can customize this function to handle the form submission
    // For now, it just shows the collected data
    const formData = {
      files: files,
      description: description,
      contact: contact
    };
    
    console.log('Submitting form data:', formData);
    Alert.alert('Form Submitted', `Successfully submitted with ${files.length} file(s)`);
  };
    // The previous 'return' statements here were part of an incomplete function definition.
    // They are now correctly placed inside the `getBackgroundSource` function defined above.

  const renderThumbnail = (file: ImagePicker.ImagePickerAsset, index: number) => {
    const isVideo = file.type?.includes('video');

    return (
      <View key={index} style={styles.thumbnailContainer}>
        {isVideo ? (
          <View style={styles.videoThumbnail}>
            <Text style={styles.videoIcon}>🎬</Text>
            <Text style={styles.videoText}>Video</Text>
          </View>
        ) : (
          <Image source={{ uri: file.uri }} style={styles.imageThumbnail} />
        )}
        
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.fileName || (isVideo ? 'Video file' : 'Image file')}
          </Text>
          {file.fileSize && (
            <Text style={styles.fileSize}>{getFileSizeDisplay(file.fileSize)}</Text>
          )}
        </View>
        
        <TouchableOpacity onPress={() => removeFile(index)} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilesList = () => {
    if (files.length === 0) return null;

    return (
      <View style={styles.filesListContainer}>
        <View style={styles.filesHeader}>
          <Text style={styles.filesCount}>{files.length} file(s) selected</Text>
          {files.length > 1 && (
            <TouchableOpacity onPress={removeAllFiles} style={styles.removeAllButton}>
              <Text style={styles.removeAllButtonText}>Remove All</Text>
            </TouchableOpacity>
          )}
        </View>
        {files.map((file, index) => renderThumbnail(file, index))}
      </View>
    );
  };

  return (
    <ImageBackground source={getBackgroundSource()} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.contentBox}>
          <Text style={styles.instruction}>{data?.instruction_text}</Text>

          <View style={styles.section}>
            <Text style={styles.label}>{data?.file_upload_text}</Text>
            
            {renderFilesList()}
            
            <TouchableOpacity onPress={pickFile} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>
                {files.length === 0 ? 'Select Files' : 'Add More Files'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{data?.description_text}</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description (optional)"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{data?.contact_info_text}</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name (optional)"
              value={contact.firstName}
              onChangeText={(text) => setContact({ ...contact, firstName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name (optional)"
              value={contact.lastName}
              onChangeText={(text) => setContact({ ...contact, lastName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              keyboardType="email-address"
              value={contact.email}
              onChangeText={(text) => setContact({ ...contact, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              keyboardType="phone-pad"
              value={contact.phone}
              onChangeText={(text) => setContact({ ...contact, phone: text })}
            />
          </View>

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  contentBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
  },
  instruction: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: 'rgba(243, 196, 54, 1.0)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: 'rgba(243, 196, 54, 1.0)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  // Files list styles
  filesListContainer: {
    marginBottom: 15,
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  removeAllButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Thumbnail styles
  thumbnailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  videoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  videoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});