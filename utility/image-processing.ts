import * as ImageManipulator from 'expo-image-manipulator';
import { writeAsync, readAsync, ExifTags } from '@lodev09/react-native-exify';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const convertToJpeg = async (uri: string): Promise<string> => {
  try {
    //extract exif metadata from original image
    let tags: ExifTags | undefined = await readAsync(uri)

    if(tags == undefined){
      tags = {
        UserComment: 'No exif data available'
      }
    }

    //convert image to jpeg
    const rendered_img = await ImageManipulator.useImageManipulator(uri).renderAsync()
    const converted_img = await rendered_img.saveAsync({
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG
    })

    //write original metadata to new jpeg image
    const result = await writeAsync(converted_img.uri, tags)
    
    if(result == undefined){
      throw new Error('Metadata transfer failed')
    }

    return result.uri;
  } catch (error) {
    return uri; // Return original if conversion fails
  }
};

export const validateFileSize = (
  file: ImagePicker.ImagePickerAsset, 
  maxSizeInMB: number = 10
): { isValid: boolean; errorMessage?: string } => {
  const fileSizeInMB = (file.fileSize || 0) / (1024 * 1024);
  
  if (file.fileSize && fileSizeInMB > maxSizeInMB) {
    return {
      isValid: false,
      errorMessage: `File "${file.fileName || 'Unknown'}" (${fileSizeInMB.toFixed(1)}MB) exceeds the ${maxSizeInMB}MB limit.`
    };
  }
  
  return { isValid: true };
};

export const processSelectedFiles = async (
  selectedFiles: ImagePicker.ImagePickerAsset[],
  maxSizeInMB: number = 50
): Promise<{ validFiles: ImagePicker.ImagePickerAsset[]; errors: string[] }> => {
  const validFiles: ImagePicker.ImagePickerAsset[] = [];
  const errors: string[] = [];
  
  for (const selectedFile of selectedFiles) {
    const validation = validateFileSize(selectedFile, maxSizeInMB);
    
    if (!validation.isValid) {
      errors.push(validation.errorMessage!);
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
        validFiles.push(selectedFile); // Add original if conversion fails
      }
    } else {
      validFiles.push(selectedFile);
    }
  }

  return { validFiles, errors };
};

export const getFileSizeDisplay = (fileSize?: number): string => {
  if (!fileSize) return '';
  const sizeInMB = fileSize / (1024 * 1024);
  return sizeInMB > 1 ? `${sizeInMB.toFixed(1)}MB` : `${(fileSize / 1024).toFixed(0)}KB`;
};

export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Permission to access the media library is required to upload files.');
      return false;
    }
    return true;
  } catch (error) {
    Alert.alert('Error', 'Failed to request media library permission.');
    return false;
  }
};