import * as React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { BrandingData, useApi, useScreen } from '@/contexts/api';
import { SCREEN_CONFIGS } from '@/contexts/api.config';

import { getImageSource } from '@/utility/image-source';

export default function SplashScreen() {
  const { checkForUpdates } = useApi();
  const { data: brandingData, getImagePath } = useScreen<BrandingData>('branding');
  const progress = React.useRef(new Animated.Value(0)).current;
  const screenShimmerTranslate = React.useRef(new Animated.Value(-500)).current;
  const totalScreens = Object.keys(SCREEN_CONFIGS).length;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(screenShimmerTranslate, {
        toValue: 500,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    const initializeApp = async () => {
      try {
        let processedCount = 0;

        await checkForUpdates(() => {
          processedCount++;
          const newProgress = Math.min(processedCount / Math.max(totalScreens, 1), 0.95);
          
          Animated.timing(progress, {
            toValue: newProgress,
            duration: 250,
            useNativeDriver: false,
          }).start();
        });

        Animated.timing(progress, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          shimmerAnimation.stop();
          router.replace('/(tabs)/home');
        });
        
      } catch (error) {
        shimmerAnimation.stop();
        router.replace('/(tabs)/home');
      }
    };

    initializeApp();
  }, []);

  const widthInterpolation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={getImageSource(brandingData, 'splash_image', getImagePath, require('../assets/images/splash-icon.png'))}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[styles.progressBarFill, { width: widthInterpolation }]} 
        />
      </View>

      <Animated.View 
        style={[
          styles.screenShimmer,
          { transform: [{ translateX: screenShimmerTranslate }] }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  image: {
    height: 150,
    width: 150,
  },
  progressBarContainer: {
    height: 8,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1D4776',
    borderRadius: 4,
  },
  screenShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ skewX: '-20deg' }],
  },
});