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
        
        const screens = [
          'home', 
          'about', 
          'donate', 
          'guide', 
          'emergency', 
          'rules', 
          'safety',
          'report',
          'guide_wildflower',
          'guide_tree_shrub',
          'guide_bird',
          'guide_mammal',
          'guide_invertebrate',
          'guide_track',
          'guide_herp',
          'trail_homestead',
          'trail_blue_ridge',
          'trail_annies',
          'trail_tuleyome',
          'trail_homestead_to_blue_ridge'

        ];
        
        // Load data with progress updates
        let completed = 0;
        await Promise.all(
          screens.map(async (screenName) => {
            try {
              await fetchScreenData(screenName);
              completed++;
              setLoadingText(`Loading data... ${completed}/${screens.length}`);
            } catch (error) {
              console.log(`Failed to fetch ${screenName} data:`, error);
              completed++;
              setLoadingText(`Loading data... ${completed}/${screens.length}`);
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
    height: 200,
    width: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});