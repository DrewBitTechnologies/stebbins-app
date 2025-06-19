import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import GuideListScreen from '@/components/guide-list-screen';

// Define the animal guide types
interface AnimalGuide {
  id: string;
  title: string;
  screenName: string;
  icon: string;
}

const animalGuides: AnimalGuide[] = [
  {
    id: 'mammals',
    title: 'Mammals',
    screenName: 'guide_mammal',
    icon: '🐾',
  },
  {
    id: 'birds',
    title: 'Birds',
    screenName: 'guide_bird',
    icon: '🐦',
  },
  {
    id: 'herps',
    title: 'Herps',
    screenName: 'guide_herp',
    icon: '🦎',
  },
  {
    id: 'invertebrates',
    title: 'Invertebrates',
    screenName: 'guide_invertebrate',
    icon: '🦋',
  },
];

// Custom Tab Component
const TabButton = ({ 
  guide, 
  isActive, 
  onPress 
}: { 
  guide: AnimalGuide; 
  isActive: boolean; 
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.tabButton,
      isActive && styles.tabButtonActive
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.tabIcon}>{guide.icon}</Text>
    <Text style={[
      styles.tabText,
      isActive && styles.tabTextActive
    ]}>
      {guide.title}
    </Text>
    {isActive && <View style={styles.tabIndicator} />}
  </TouchableOpacity>
);

export default function AnimalsScreen() {
  const [activeTab, setActiveTab] = useState<string>('mammals');

  // Get the current active guide
  const currentGuide = animalGuides.find(guide => guide.id === activeTab) || animalGuides[0];

  // Create route params for the GuideListScreen
  const routeParams = {
    params: {
      screenName: currentGuide.screenName,
      title: currentGuide.title,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header with Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Animal Guides</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          bounces={false}
        >
          {animalGuides.map((guide) => (
            <TabButton
              key={guide.id}
              guide={guide}
              isActive={activeTab === guide.id}
              onPress={() => setActiveTab(guide.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content Area - GuideListScreen */}
      <View style={styles.contentContainer}>
        <GuideListScreen route={routeParams} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 100,
    position: 'relative',
  },
  tabButtonActive: {
    // backgroundColor: '#4CAF50',
    backgroundColor: '#FFBF00',
    borderColor: '#FFBF00',
    shadowColor: '#FFBF00',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#022851',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: '50%',
    transform: [{ translateX: -10 }],
    width: 20,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
});