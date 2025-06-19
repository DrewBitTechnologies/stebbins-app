import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ImageBackground, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScreen, ReportData } from '@/contexts/ApiContext';
import { LinearGradient } from 'expo-linear-gradient';
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access the media library is required to upload files.');
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

const REPORT_FILES_FOLDER_ID = process.env.EXPO_PUBLIC_REPORT_FILES_FOLDER_ID;//Make sure to get new folder id

const uploadFile = async (file: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();
    
    const fileName = file.fileName || `upload_${Date.now()}.${file.type?.split('/')[1] || 'jpg'}`;
    const mimeType = file.type || 'application/octet-stream';
    
    if (REPORT_FILES_FOLDER_ID) {
      formData.append('folder', REPORT_FILES_FOLDER_ID);
      console.log(`Uploading file: ${fileName}, type: ${mimeType} to folder: ${REPORT_FILES_FOLDER_ID}`);
    } else {
      console.log(`Uploading file: ${fileName}, type: ${mimeType} to root folder`);
      console.warn('EXPO_PUBLIC_REPORT_FILES_FOLDER_ID not set - files will go to root folder');
    }

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
        <View style={styles.thumbnailImageContainer}>
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
            <Text style={styles.fileSize}>{getFileSizeDisplay(file.fileSize)}</Text>
          )}
        </View>
        
        <TouchableOpacity onPress={() => removeFile(index)} style={styles.removeButton}>
          <Ionicons name="close" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilesList = () => {
    if (files.length === 0) return null;

    return (
      <View style={styles.filesListContainer}>
        <View style={styles.filesHeader}>
          <View style={styles.filesCountContainer}>
            <Ionicons name="documents" size={16} color="#2d5016" style={{ marginRight: 6 }} />
            <Text style={styles.filesCount}>{files.length} file(s) selected</Text>
          </View>
          {files.length > 1 && (
            <TouchableOpacity onPress={removeAllFiles} style={styles.removeAllButton}>
              <Ionicons name="trash" size={14} color="white" style={{ marginRight: 4 }} />
              <Text style={styles.removeAllButtonText}>Remove All</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filesContainer}>
          {files.map((file, index) => renderThumbnail(file, index))}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={getBackgroundSource()} style={styles.backgroundImage} resizeMode="cover">
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(45, 80, 22, 0.2)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)']}
        style={styles.gradientOverlay}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <View style={styles.reportIconContainer}>
              <Ionicons 
                name="flag" 
                size={32} 
                color="white" 
              />
            </View>
            <Text style={styles.headerTitle}>Report an Issue</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {data?.instruction_text || 'Help us keep the trails safe and maintained'}
          </Text>
        </View>

        {/* File Upload Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="camera" size={24} color="#2d5016" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                {data?.file_upload_text || 'Add Photos or Videos'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Visual evidence helps us understand the issue better
              </Text>
            </View>
          </View>

          {renderFilesList()}

          <TouchableOpacity 
            onPress={pickFile} 
            style={[styles.uploadButton, isSubmitting && styles.buttonDisabled]} 
            disabled={isSubmitting}
          >
            <View style={styles.buttonContent}>
              <Ionicons 
                name={files.length === 0 ? "add-circle" : "add"} 
                size={20} 
                color="#1a1a1a" 
                style={styles.buttonIcon}
              />
              <Text style={styles.uploadButtonText}>
                {files.length === 0 ? 'Select Files' : 'Add More Files'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="document-text" size={24} color="#2d5016" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                {data?.description_text || 'Description'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Provide details about what you observed
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue you'd like to report (optional)..."
            placeholderTextColor="#999"
            editable={!isSubmitting}
          />
        </View>

        {/* Contact Information Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="person" size={24} color="#2d5016" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                {data?.contact_info_text || 'Contact Information'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Optional - in case we need to follow up
              </Text>
            </View>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="First Name"
              placeholderTextColor="#999"
              value={contact.firstName}
              onChangeText={(text) => setContact({ ...contact, firstName: text })}
              editable={!isSubmitting}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Last Name"
              placeholderTextColor="#999"
              value={contact.lastName}
              onChangeText={(text) => setContact({ ...contact, lastName: text })}
              editable={!isSubmitting}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={contact.email}
            onChangeText={(text) => setContact({ ...contact, email: text })}
            editable={!isSubmitting}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={contact.phone}
            onChangeText={(text) => setContact({ ...contact, phone: text })}
            editable={!isSubmitting}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isSubmitting ? ['#cccccc', '#999999'] : ['#f3c436', '#e6b429']}
            style={styles.submitButtonGradient}
          >
            <View style={styles.submitButtonContent}>
              <Ionicons 
                name={isSubmitting ? "hourglass" : "send"} 
                size={20} 
                color="#1a1a1a" 
                style={styles.buttonIcon}
              />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
          <Text style={styles.privacyText}>
            Your information is kept private and used only to address reported issues.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  // File upload styles
  filesListContainer: {
    marginBottom: 16,
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filesCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5016',
  },
  removeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  filesContainer: {
    gap: 8,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  thumbnailImageContainer: {
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
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2d5016',
    borderStyle: 'dashed',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#2d5016',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Form input styles
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  // Submit button styles
  submitButton: {
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
  },
  submitButtonGradient: {
    borderRadius: 12,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});