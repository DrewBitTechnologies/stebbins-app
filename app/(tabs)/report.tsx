import { ReportData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';
import Button from '@/components/button';
import { getImageSource } from '@/utility/image-source';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.EXPO_PUBLIC_API_KEY;
const REPORT_FILES_FOLDER_ID = process.env.EXPO_PUBLIC_REPORT_FILES_FOLDER_ID;


export default function ReportScreen() {
  const { data: reportData, getImagePath } = useScreen<ReportData>('report');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const convertToJpeg = async (uri: string): Promise<string> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [], // No resize, just convert
        {
          compress: 0.8, // Good quality compression
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Image conversion failed:', error);
      return uri; // Return original if conversion fails
    }
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
          
          // Convert images to JPEG for compatibility
          if (selectedFile.type === 'image') {
            try {
              const convertedUri = await convertToJpeg(selectedFile.uri);
              const convertedFile: ImagePicker.ImagePickerAsset = {
                ...selectedFile,
                uri: convertedUri,
                mimeType: 'image/jpeg',
                fileName: selectedFile.fileName?.replace(/\.(heic|heif|png|webp)$/i, '.jpg') || 'image.jpg'
              };
              validFiles.push(convertedFile);
            } catch (error) {
              console.error('Failed to convert image:', error);
              validFiles.push(selectedFile); // Add original if conversion fails
            }
          } else {
            validFiles.push(selectedFile);
          }
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

const uploadFile = async (file: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();
    
    const fileName = file.fileName || `upload_${Date.now()}.${file.mimeType?.split('/')[1] || 'jpg'}`;
    const mimeType = file.mimeType || 'application/octet-stream';
    
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
    
    const hasFiles = files.length > 0;
    const hasDescription = description.trim().length > 0;
    
    if (!hasFiles && !hasDescription) {
      Alert.alert(
        'Cannot Submit Empty Form',
        'Please provide at least one of the following:\n• Upload a photo or video\n• Add a description',
        [{ text: 'OK' }]
      );
      return;
    }
    
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
    const isVideo = file.type === 'video';

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
    <ScreenBackground backgroundSource={getImageSource(reportData, 'background', getImagePath, require('@/assets/dev/fallback.jpeg'))}>
      <ScreenHeader 
        icon="flag"
        title="Report an Issue"
        subtitle={reportData?.instruction_text || 'Help us keep the trails safe and maintained'}
      />

      <Card variant="default" margin="none" style={{ marginBottom: 20 }}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Ionicons name="camera" size={24} color="#2d5016" />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>
              {reportData?.file_upload_text || 'Add Photos or Videos'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              Visual evidence helps us understand the issue better
            </Text>
          </View>
        </View>

        {renderFilesList()}

        <Button
          title={files.length === 0 ? 'Select Files' : 'Add More Files'}
          onPress={pickFile}
          icon={files.length === 0 ? "add-circle" : "add"}
          backgroundColor={['#f8f9fa', '#f0f0f0'] as const}
          textColor="#2d5016"
          iconColor="#2d5016"
          disabled={isSubmitting}
          style={{ 
            borderWidth: 2,
            borderColor: '#2d5016',
            borderStyle: 'dashed',
            shadowOpacity: 0
          }}
        />
      </Card>

      <Card variant="default" margin="none" style={{ marginBottom: 20 }}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Ionicons name="document-text" size={24} color="#2d5016" />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>
              {reportData?.description_text || 'Description'}
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
      </Card>

      <Card variant="default" margin="none" style={{ marginBottom: 20 }}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Ionicons name="person" size={24} color="#2d5016" />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>
              {reportData?.contact_info_text || 'Contact Information'}
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
      </Card>

      <Button
        title="Submit Report"
        onPress={handleSubmit}
        icon="send"
        loading={isSubmitting}
        loadingText="Submitting..."
        disabled={isSubmitting}
        style={{ marginBottom: 20 }}
      />

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
        <Text style={styles.privacyText}>
          Your information is kept private and used only to address reported issues.
        </Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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