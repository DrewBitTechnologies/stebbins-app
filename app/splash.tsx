import { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useApi } from '../contexts/ApiContext';

export default function SplashScreen() {
  const { fetchHomeData } = useApi();

  useEffect(() => {
    const loadDataAndNavigate = async () => {
      // Fetch data first
      await fetchHomeData();
      
      router.replace('/(tabs)/home');
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
  },
});