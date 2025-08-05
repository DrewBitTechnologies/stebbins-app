import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { processSelectedFiles, requestMediaLibraryPermission } from './image-processing';

export const pickFiles = async (
  maxSizeInMB: number = 50
): Promise<{ files: ImagePicker.ImagePickerAsset[]; errors: string[] }> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      return { files: [], errors: ['Permission denied'] };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (result.canceled) {
      return { files: [], errors: [] };
    }

    if (result.assets && result.assets.length > 0) {
      const { validFiles, errors } = await processSelectedFiles(result.assets, maxSizeInMB);
      
      // Show error alerts for invalid files
      if (errors.length > 0) {
        errors.forEach(error => {
          Alert.alert('File Too Large', error);
        });
      }
      
      return { files: validFiles, errors };
    }

    return { files: [], errors: [] };
  } catch (error) {
    Alert.alert('Error', 'An error occurred while selecting the file. Please try again.');
    return { files: [], errors: ['File selection failed'] };
  }
};

export const removeFile = (
  files: ImagePicker.ImagePickerAsset[],
  indexToRemove: number,
  onFilesChange: (files: ImagePicker.ImagePickerAsset[]) => void
): void => {
  Alert.alert(
    'Remove File',
    'Are you sure you want to remove this file?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Remove', 
        style: 'destructive', 
        onPress: () => {
          const updatedFiles = files.filter((_, index) => index !== indexToRemove);
          onFilesChange(updatedFiles);
        }
      }
    ]
  );
};

export const removeAllFiles = (
  onFilesChange: (files: ImagePicker.ImagePickerAsset[]) => void
): void => {
  Alert.alert(
    'Remove All Files',
    'Are you sure you want to remove all selected files?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove All', style: 'destructive', onPress: () => onFilesChange([]) }
    ]
  );
};

export const addFilesToExisting = (
  existingFiles: ImagePicker.ImagePickerAsset[],
  newFiles: ImagePicker.ImagePickerAsset[]
): ImagePicker.ImagePickerAsset[] => {
  return [...existingFiles, ...newFiles];
};