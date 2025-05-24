import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useApi } from '../contexts/ApiContext';

export default function SplashScreen() {
  const { fetchScreenData } = useApi();
  const [loadingText, setLoadingText] = useState('Loading...');

  useEffect(() => {
    const loadDataAndNavigate = async () => {
      try {
        setLoadingText('Loading app data...');
        
        // Fetch all screen data upfront
        const screens = ['home', 'about']; // Add more screens as needed
        
        await Promise.all(
          screens.map(async (screenName) => {
            try {
              await fetchScreenData(screenName);
            } catch (error) {
              console.log(`Failed to fetch ${screenName} data:`, error);
              // Continue with other screens even if one fails
            }
          })
        );

        setLoadingText('Ready!');
        
        // Small delay to show completion
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 500);
        
      } catch (error) {
        console.log('Error during data loading:', error);
        // Navigate anyway - screens will use cached data or show fallbacks
        router.replace('/(tabs)/home');
      }
    };

    loadDataAndNavigate();
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/splash-icon.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.loadingText}>{loadingText}</Text>
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
    height: 50,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});