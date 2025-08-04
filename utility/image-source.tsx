import { ImageSourcePropType } from 'react-native';

/**
 * Generic image source utility that retrieves cached images with fallback support
 * @param data - Any object containing image references
 * @param imageField - The field name in the data object that contains the image ID
 * @param getImagePath - Function to get the cached image path from image ID
 * @param fallbackImage - Optional fallback image to use if cached image not available
 * @returns ImageSourcePropType for React Native Image component
 */
export function getImageSource(
  data: any,
  imageField: string,
  getImagePath: (imageName: string) => string | undefined,
  fallbackImage?: ImageSourcePropType
): ImageSourcePropType | undefined {
  if (!data || typeof data !== 'object') {
    return fallbackImage;
  }

  const imageId = (data as any)[imageField];
  if (!imageId || typeof imageId !== 'string') {
    return fallbackImage;
  }

  const imagePath = getImagePath(imageId);
  if (imagePath) {
    return { uri: imagePath };
  }

  return fallbackImage;
}

/**
 * Specialized function for background images (maintains backward compatibility)
 */
export function getBackgroundSource(
  data: any,
  getImagePath: (imageName: string) => string | undefined
): ImageSourcePropType | undefined {
  return getImageSource(data, 'background', getImagePath);
}

/**
 * Helper function to get all image fields from an object automatically
 * This replaces the need for hardcoded IMAGE_FIELD_KEYS
 */
export function extractImageFields(obj: any): string[] {
  const imageFields: string[] = [];
  
  const isImageField = (key: string, value: any): boolean => {
    return (
      typeof value === 'string' &&
      (key.toLowerCase().includes('image') || 
       key.toLowerCase().includes('background') || 
       key.toLowerCase().includes('icon'))
    );
  };

  const processObject = (object: any) => {
    if (!object || typeof object !== 'object') return;
    
    for (const [key, value] of Object.entries(object)) {
      if (isImageField(key, value)) {
        imageFields.push(value as string);
      } else if (Array.isArray(value)) {
        value.forEach(item => processObject(item));
      } else if (typeof value === 'object') {
        processObject(value);
      }
    }
  };

  processObject(obj);
  return [...new Set(imageFields)]; // Remove duplicates
}