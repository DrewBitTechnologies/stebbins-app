import { GuideData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';

interface ButtonItem {
  title: string;
  navigateTo: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

export default function GuideScreen() {
  const guideItems: ButtonItem[] = [
    { 
      title: 'Animals', 
      navigateTo: '/guides/animals',
      icon: 'paw-outline',
      description: 'Discover local wildlife and their habitats'
    },
    { 
      title: 'Trees and Shrubs', 
      navigateTo: '/guides/trees-and-shrubs',
      icon: 'leaf-outline',
      description: 'Identify native trees and woodland plants'
    },
    { 
      title: 'Wildflowers', 
      navigateTo: '/guides/wildflowers',
      icon: 'flower-outline',
      description: 'Explore seasonal blooms and meadow flowers'
    },
    { 
      title: 'Trail Tracks', 
      navigateTo: '/guides/trail-tracks',
      icon: 'footsteps-outline',
      description: 'Learn to read animal tracks and signs'
    },
  ];

  const { data: guideData, getImagePath } = useScreen<GuideData>('guide');

  const getBackgroundSource = () => {
    const backgroundId = guideData?.background;

    if (backgroundId) {
      
      const localUri = getImagePath(backgroundId);
      if (localUri) {
        return { uri: localUri };
      }
    }

    return require('@/assets/dev/fallback.jpeg');
  };

  const handleNavigation = (route: string): void => {
    router.push(route as any);
  };

  return (
    <ImageBackground 
      source={getBackgroundSource()}
      style={styles.container}
    >
      {/* Gradient overlay for better text readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
        style={styles.gradientOverlay}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        <ScreenHeader 
            icon="book"
            title="Stebbins Field Guide"
            subtitle="Explore the natural world around you"
        />

        {/* Guide Cards */}
        <View style={styles.cardsContainer}>
          {guideItems.map((item, index) => (
            <Card 
              key={item.title}
              variant="navigation"
              margin={index === guideItems.length - 1 ? "none" : "standard"}
            >
              <TouchableOpacity
                onPress={() => handleNavigation(item.navigateTo)}
                activeOpacity={0.8}
                style={{ flex: 1 }}
              >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={item.icon} 
                    size={28} 
                    color="#2d5016" 
                  />
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
                
                <View style={styles.arrowContainer}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color="#666" 
                  />
                </View>
              </View>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 40,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});