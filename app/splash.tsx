import { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { useApi, SCREEN_CONFIGS } from '@/contexts/ApiContext';

export default function SplashScreen() {
  const { checkAllScreensForUpdates } = useApi();
  const progress = useRef(new Animated.Value(0)).current;
  const totalScreens = Object.keys(SCREEN_CONFIGS).length;

  useEffect(() => {
    const initializeApp = async () => {
      try {
        let processedCount = 0;

        await checkAllScreensForUpdates((message) => {
          console.log(message);
          processedCount++;
          const newProgress = processedCount / totalScreens;
          
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
          // Wait a moment before navigating
          setTimeout(() => {
            router.replace('/(tabs)/home');
          }, 300);
        });
        
      } catch (error) {
        console.log('A critical error occurred during app initialization:', error);
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 1000);
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
      <Image 
        source={require('../assets/images/splash-icon.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[styles.progressBarFill, { width: widthInterpolation }]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 200,
    width: 200,
  },
  progressBarContainer: {
    height: 8,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 30,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1D4776',
    borderRadius: 4,
  },
});