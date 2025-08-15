import * as React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { BrandingData, useApi, useScreen } from '@/contexts/api';
import { SCREEN_CONFIGS } from '@/contexts/api.config';
import { getImageSource } from '@/utility/image-source';
import { ColorPalette } from '@/assets/dev/color_palette';
import * as Haptics from 'expo-haptics';
import * as DefaultSplashScreen from 'expo-splash-screen';

export default function SplashScreen() {
  const { checkForUpdates, checkAllScreensForUpdates } = useApi();
  const { data: brandingData, getImagePath } = useScreen<BrandingData>('branding');
  const progress = React.useRef(new Animated.Value(0)).current;
  const screenShimmerTranslate = React.useRef(new Animated.Value(-500)).current;
  const totalScreens = Object.keys(SCREEN_CONFIGS).length;

  React.useEffect(() => {
    DefaultSplashScreen.hideAsync();
    
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
        
        // Start progress animation to 10%
        Animated.timing(progress, {
          toValue: 0.1,
          duration: 300,
          useNativeDriver: false,
        }).start();

        let completedScreens = new Set<string>();

        const updateProgress = (message: string) => {
          console.log('📊 Progress:', message);
          
          // Look for screen completion indicators in the messages
          const screenMatch = message.match(/\[([^\]]+)\]/);
          if (screenMatch) {
            const screenName = screenMatch[1];
            
            // Count screens that are completed or being processed
            if (message.includes('✅') || 
                message.includes('Cache is up to date') || 
                message.includes('Stale cache. Fetching updates') ||
                message.includes('Syncing:')) {
              
              if (!completedScreens.has(screenName)) {
                completedScreens.add(screenName);
                // Progress from 10% to 90% based on screen completion
                const progressValue = 0.1 + (completedScreens.size / totalScreens) * 0.8;
                console.log(`📊 Progress: ${Math.round(progressValue * 100)}% (${completedScreens.size}/${totalScreens} screens)`);
                
                Animated.timing(progress, {
                  toValue: progressValue,
                  duration: 200,
                  useNativeDriver: false,
                }).start();
              }
            }
          }
        };
        
        await checkForUpdates(updateProgress);

        // Progress to 90% after updates complete
        Animated.timing(progress, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: false,
        }).start();

        // Complete progress and navigate
        Animated.timing(progress, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } catch (error) {
            console.log('Haptic feedback not supported');
          }
          shimmerAnimation.stop();
          router.replace('/(tabs)/home');
        });
        
      } catch (error) {
        console.warn('Error during app initialization:', error);
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
    backgroundColor: ColorPalette.white,
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
    backgroundColor: ColorPalette.primary_blue,
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