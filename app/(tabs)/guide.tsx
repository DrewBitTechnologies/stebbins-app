import { GuideData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        
        {/* Header Section */}
        <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
                <Ionicons 
                    name="book"
                    size={36} 
                    color="white" 
                    style={styles.headerIcon}
                />
                <Text style={styles.headerTitle}>Stebbins Field Guide</Text>
            </View>
            <Text style={styles.headerSubtitle}>Explore the natural world around you</Text>
        </View>

        {/* Guide Cards */}
        <View style={styles.cardsContainer}>
          {guideItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.guideCard,
                { marginBottom: index === guideItems.length - 1 ? 0 : 16 }
              ]}
              onPress={() => handleNavigation(item.navigateTo)}
              activeOpacity={0.8}
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  guideCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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