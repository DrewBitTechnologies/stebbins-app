import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { BrandingData, useScreen } from '@/contexts/api';
import { getImageSource } from '@/utility/image-source';
import { ColorPalette } from '@/assets/dev/color_palette';

export default function AppHeader() {
  const { data: brandingData, getImagePath } = useScreen<BrandingData>('branding');

  return (
    <View style={styles.container}>
      <Image
        source={getImageSource(brandingData, 'header_image', getImagePath, require('@/assets/dev/bat-horizontal.png'))}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: ColorPalette.white,
    zIndex: 2,
  },
  image: {
    height: 35,
    width: 250,
    resizeMode: 'contain',
  },
});