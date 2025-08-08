import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { BrandingData, useScreen } from '@/contexts/api';
import { getImageSource } from '@/utility/image-source';

export default function AppHeader() {
  const { data: brandingData, getImagePath } = useScreen<BrandingData>('branding');

  const hasData = !!brandingData;
  const imageSource = getImageSource(brandingData, 'header_image', getImagePath, require('@/assets/dev/bat-horizontal.png'));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={imageSource}
        style={{ height: 35, width: 250 }}
        contentFit="contain"
        key={hasData ? 'cached' : 'fallback'} // Force re-render when data changes
      />
    </View>
  );
}