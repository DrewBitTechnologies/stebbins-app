import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useScreen, GuideData } from '@/contexts/ApiContext';

interface ButtonItem {
  title: string;
  navigateTo: string;
}

export default function GuideScreen() {
  const verticalButtons: ButtonItem[] = [
    { title: 'Animals', navigateTo: '/animals' },
    { title: 'Trees and Shrubs', navigateTo: '/trees-and-shrubs' },
    { title: 'Wildflowers', navigateTo: '/wildflowers' },
    { title: 'Trail Tracks', navigateTo: '/trail-tracks' },
  ];

  const { backgroundPath } = useScreen<GuideData>('guide');

  const getBackgroundSource = () => {
    if(backgroundPath){
      return { uri: backgroundPath };
    }

    return require('@/assets/dev/fallback.jpeg');
  };

  const handleNavigation = (route: string): void => {
    router.push(route as any);
  };

  return (
    <ImageBackground 
      source={getBackgroundSource()}
      style={styles.fieldGuideMainImage}
    >
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={styles.verticalButtons}>
          {verticalButtons.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={item.title === 'Trail Tracks' ? styles.bottomVerticalButton : styles.verticalButton}
              onPress={() => handleNavigation(item.navigateTo)}
            >
              <View style={styles.verticalButtonLabel}>
                <Text style={styles.buttonText}>{item.title}</Text>
                <Ionicons name="chevron-forward-outline" size={20} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fieldGuideMainImage: {
    flex: 1,
  },
  verticalButtons: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
  },
  verticalButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderColor: 'rgba(225, 225, 225, 1.0)',
    paddingLeft: 20,
    paddingRight: 20,
    margin: 3,
  },
  bottomVerticalButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingLeft: 20,
    paddingRight: 20,
    margin: 3,
  },
  verticalButtonLabel: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
  },
});