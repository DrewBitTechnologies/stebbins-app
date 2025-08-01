import { GuideData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';
import { getBackgroundSource } from '@/utility/background-source';

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

  const handleNavigation = (route: string): void => {
    router.push(route as any);
  };

  return (
    <ScreenBackground backgroundSource={getBackgroundSource(guideData, getImagePath)}>
      <ScreenHeader 
          icon="book"
          title="Stebbins Field Guide"
          subtitle="Explore the natural world around you"
      />

      {/* Guide Cards */}
      {guideItems.map((item, index) => (
        <Card 
          key={item.title}
          variant="navigation"
          margin="none"
          style={{ marginBottom: index === guideItems.length - 1 ? 0 : 20 }}
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
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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