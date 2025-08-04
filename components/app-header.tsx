import React from 'react';
import { Image, View } from 'react-native';
import { BrandingData, useScreen } from '@/contexts/api';
import { getImageSource } from '@/utility/image-source';

export default function AppHeader() {
  const { data: brandingData, getImagePath } = useScreen<BrandingData>('branding');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={getImageSource(brandingData, 'header_image', getImagePath, require('@/assets/dev/bat-horizontal.png'))}
        style={{ height: 35, width: 250, resizeMode: 'contain' }}
      />
    </View>
  );
}