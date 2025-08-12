import { ReportData, useScreen } from '@/contexts/api';
import { API_BASE_URL, BEARER_TOKEN, REPORT_FILES_FOLDER_ID } from '@/contexts/api.config';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';
import Button from '@/components/button';
import FilesList from '@/components/files-list';
import { getImageSource } from '@/utility/image-source';
import { pickFiles, removeFile, removeAllFiles } from '@/utility/file-management';
import { submitCompleteReport, ContactInfo } from '@/utility/report-api';


export default function ReportScreen() {
  const { data: reportData, getImagePath } = useScreen<ReportData>('report');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [contact, setContact] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handlePickFiles = async () => {
    const result = await pickFiles();
    if (result.files.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...result.files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    removeFile(files, index, setFiles);
  };

  const handleRemoveAllFiles = () => {
    removeAllFiles(setFiles);
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
      const result = await submitCompleteReport(
        files,
        {
          description,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
        },
        API_BASE_URL!,
        BEARER_TOKEN!,
        REPORT_FILES_FOLDER_ID!
      );

      // Success!
      Alert.alert(
        'Success', 
        `Report submitted successfully with ${result.fileCount} file(s)`,
        [{ text: 'OK', onPress: () => {
          // Reset form
          setFiles([]);
          setDescription('');
          setContact({ firstName: '', lastName: '', email: '', phone: '' });
        }}]
      );

    } catch (error) {
      Alert.alert(
        'Error', 
        `Failed to submit report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <ScreenBackground backgroundSource={getImageSource(reportData, 'background', getImagePath, require('@/assets/dev/fallback.jpeg'))}>
      <ScreenHeader 
        icon="warning"
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

        <FilesList
          files={files}
          onRemoveFile={handleRemoveFile}
          onRemoveAll={handleRemoveAllFiles}
        />

        <Button
          title={files.length === 0 ? 'Select Files' : 'Add More Files'}
          onPress={handlePickFiles}
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
          style={[
            styles.textArea,
            focusedInput === 'description' && styles.focusedInput
          ]}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue you'd like to report (optional)..."
          placeholderTextColor="#999"
          editable={!isSubmitting}
          onFocus={() => setFocusedInput('description')}
          onBlur={() => setFocusedInput(null)}
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
            style={[
              styles.input, 
              styles.halfInput,
              focusedInput === 'firstName' && styles.focusedInput
            ]}
            placeholder="First Name"
            placeholderTextColor="#999"
            value={contact.firstName}
            onChangeText={(text) => setContact({ ...contact, firstName: text })}
            editable={!isSubmitting}
            onFocus={() => setFocusedInput('firstName')}
            onBlur={() => setFocusedInput(null)}
          />
          <TextInput
            style={[
              styles.input, 
              styles.halfInput,
              focusedInput === 'lastName' && styles.focusedInput
            ]}
            placeholder="Last Name"
            placeholderTextColor="#999"
            value={contact.lastName}
            onChangeText={(text) => setContact({ ...contact, lastName: text })}
            editable={!isSubmitting}
            onFocus={() => setFocusedInput('lastName')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <TextInput
          style={[
            styles.input,
            focusedInput === 'email' && styles.focusedInput
          ]}
          placeholder="Email Address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={contact.email}
          onChangeText={(text) => setContact({ ...contact, email: text })}
          editable={!isSubmitting}
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
        />

        <TextInput
          style={[
            styles.input,
            focusedInput === 'phone' && styles.focusedInput
          ]}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={contact.phone}
          onChangeText={(text) => setContact({ ...contact, phone: text })}
          editable={!isSubmitting}
          onFocus={() => setFocusedInput('phone')}
          onBlur={() => setFocusedInput(null)}
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
  focusedInput: {
    borderWidth: 2,
    borderColor: '#2d5016',
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