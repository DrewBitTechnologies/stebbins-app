import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ImageBackground, Image, Alert
} from 'react-native';
import { useScreen, ReportData } from '@/contexts/ApiContext';
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.EXPO_PUBLIC_API_KEY;

export default function ReportScreen() {
  const { data, getImagePath, fetch: fetchScreenData } = useScreen<ReportData>('report');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch screen data on mount
  useEffect(() => {
    fetchScreenData();
  }, []);

  const getBackgroundSource = () => {
    const backgroundPath = getImagePath('background');
    return backgroundPath ? { uri: backgroundPath } : require('@/assets/dev/fallback.jpeg');
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
        allowsMultipleSelection: true,
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

const REPORT_FILES_FOLDER_ID = '0f678859-460f-4401-b7d0-55a33bb8c3ee';

const uploadFile = async (file: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();
    
    const fileName = file.fileName || `upload_${Date.now()}.${file.type?.split('/')[1] || 'jpg'}`;
    const mimeType = file.type || 'application/octet-stream';
    
    formData.append('folder', REPORT_FILES_FOLDER_ID);
    formData.append('file', {
      uri: file.uri,
      name: fileName,
      type: mimeType,
    } as any);

    console.log(`Uploading file: ${fileName}, type: ${mimeType} to folder: ${REPORT_FILES_FOLDER_ID}`);

    const response = await fetch(`${API_URL}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`File upload failed: ${response.status} - ${errorText}`);
    }

    const json = await response.json();
    console.log('File uploaded successfully:', json.data.id);
    return json.data.id;
  };

  const createReport = async () => {
    const reportData = {
      description,
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      phone_number: contact.phone,
    };

    console.log('Creating report with data:', reportData);

    const response = await fetch(`${API_URL}/items/report`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Report creation failed: ${response.status} - ${errorText}`);
    }

    const json = await response.json();
    console.log('Report created successfully:', json.data.id);
    return json.data.id;
  };

  const linkFileToReport = async (reportId: number, fileId: string) => {
    const linkData = {
      report_id: reportId,
      directus_files_id: fileId,
    };

    console.log('Linking file to report:', linkData);

    const response = await fetch(`${API_URL}/items/report_files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(linkData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`File linking failed: ${response.status} - ${errorText}`);
    }

    console.log('File linked successfully');
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log(`Starting submission with ${files.length} files...`);
      
      // Step 1: Upload all files and get their IDs
      const fileIds: string[] = [];
      if (files.length > 0) {
        console.log('Uploading files...');
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`Uploading file ${i + 1}/${files.length}: ${file.fileName}`);
          const fileId = await uploadFile(file);
          fileIds.push(fileId);
        }
        console.log('All files uploaded successfully');
      }

      // Step 2: Create the report
      console.log('Creating report...');
      const reportId = await createReport();

      // Step 3: Link files to report
      if (fileIds.length > 0) {
        console.log('Linking files to report...');
        for (const fileId of fileIds) {
          await linkFileToReport(reportId, fileId);
        }
        console.log('All files linked successfully');
      }

      // Success!
      Alert.alert(
        'Success', 
        `Report submitted successfully with ${fileIds.length} file(s)`,
        [{ text: 'OK', onPress: () => {
          // Reset form
          setFiles([]);
          setDescription('');
          setContact({ firstName: '', lastName: '', email: '', phone: '' });
        }}]
      );

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Error', 
        `Failed to submit report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            
            <TouchableOpacity onPress={pickFile} style={styles.uploadButton} disabled={isSubmitting}>
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
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{data?.contact_info_text}</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name (optional)"
              value={contact.firstName}
              onChangeText={(text) => setContact({ ...contact, firstName: text })}
              editable={!isSubmitting}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name (optional)"
              value={contact.lastName}
              onChangeText={(text) => setContact({ ...contact, lastName: text })}
              editable={!isSubmitting}
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              keyboardType="email-address"
              value={contact.email}
              onChangeText={(text) => setContact({ ...contact, email: text })}
              editable={!isSubmitting}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              keyboardType="phone-pad"
              value={contact.phone}
              onChangeText={(text) => setContact({ ...contact, phone: text })}
              editable={!isSubmitting}
            />
          </View>

          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Text>
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
  submitButtonDisabled: {
    backgroundColor: 'rgba(243, 196, 54, 0.5)',
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