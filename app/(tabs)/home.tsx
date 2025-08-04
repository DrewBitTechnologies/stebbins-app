import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeData, useApi, useScreen } from '../../contexts/api';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';
import { getImageSource } from '@/utility/image-source';

interface ButtonItem {
  title: string;
  navigateTo: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}

export default function HomeScreen() {
  const { data: homeData, isLoading, getImagePath } = useScreen<HomeData>('home');
  const { checkAllScreensForUpdates } = useApi();

  const mainButtons: ButtonItem[] = [
    {
      title: 'Trail Map',
      navigateTo: '/(tabs)/map',
      icon: 'map-outline',
      description: 'Navigate the reserve with a live map',
      color: '#2d5016'
    },
    {
      title: 'Field Guides',
      navigateTo: '/(tabs)/guide',
      icon: 'book-outline',
      description: 'Identify local flora and fauna',
      color: '#2d5016'
    },
    {
      title: 'Report an Issue',
      navigateTo: '/(tabs)/report',
      icon: 'flag-outline',
      description: 'Help us maintain the trails',
      color: '#2d5016'
    },
  ];

  const secondaryButtons: ButtonItem[] = [
    {
      title: 'Safety Info',
      navigateTo: '/safety',
      icon: 'shield-checkmark-outline',
      description: 'Essential safety guidelines',
      color: '#4a7c59'
    },
    {
      title: 'Trail Rules',
      navigateTo: '/rules',
      icon: 'trail-sign-outline',
      description: 'Know before you go',
      color: '#4a7c59'
    },
    {
      title: 'About the Reserve',
      navigateTo: '/about',
      icon: 'information-circle-outline',
      description: 'Learn about our mission',
      color: '#4a7c59'
    },
    {
      title: 'Emergency',
      navigateTo: '/emergency',
      icon: 'call-outline',
      description: 'Quick access to help',
      color: '#c70000'
    },
  ];
  
  const handleManualRefresh = async () => {
    console.log("Starting full app sync from home screen...");
    await checkAllScreensForUpdates((message) => {
        console.log(message);
    });
    console.log("Full app sync complete.");
  };

  const status = homeData?.reserve_status || "Loading status...";

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const ReserveStatusCard = () => (
    <Card variant="warning" margin="none" style={{ marginBottom: 20 }}>
      <View style={styles.statusHeader}>
        <Ionicons name="megaphone" size={24} color="#1a1a1a" />
        <Text style={styles.statusTitle}>Reserve Status</Text>
        <TouchableOpacity 
          onPress={handleManualRefresh} 
          style={styles.reloadButton} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#1a1a1a" />
          ) : (
            <Ionicons name="refresh" size={22} color="#1a1a1a" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.statusText}>{isLoading ? 'Checking for updates...' : status}</Text>
    </Card>
  );

  return (
    <ScreenBackground backgroundSource={getImageSource(homeData, 'background', getImagePath, require('@/assets/dev/fallback.jpeg'))} paddingTop={20}>

        <ReserveStatusCard />

        <View style={styles.cardsContainer}>
          {mainButtons.map((item) => (
            <Card 
              key={item.title}
              variant="navigation"
              margin="none"
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
            >
              <TouchableOpacity
                onPress={() => handleNavigation(item.navigateTo)}
                activeOpacity={0.8}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(45, 80, 22, 0.1)' }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        <View style={styles.secondaryGrid}>
          {secondaryButtons.map((item, index) => (
             <Card
               key={item.title}
               variant={item.title === 'Emergency' ? 'emergency' : 'compact'}
               margin="none"
               style={{
                 ...styles.secondaryCardStyle,
                 marginBottom: index < 2 ? 15 : 0
               }}
             >
               <TouchableOpacity
                 onPress={() => handleNavigation(item.navigateTo)}
                 activeOpacity={0.8}
                 style={styles.secondaryCardContent}
               >
             <Ionicons
               name={item.icon}
               size={24}
               color={item.title === 'Emergency' ? 'white' : item.color}
               style={styles.secondaryIcon}
             />
             <Text
               style={[
                 styles.secondaryTitle,
                 item.title === 'Emergency' && styles.emergencyTitle
               ]}
             >
               {item.title}
             </Text>
               </TouchableOpacity>
             </Card>
          ))}
        </View>

    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  reloadButton: {
    padding: 4,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  cardsContainer: {
    marginBottom: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  secondaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  secondaryCardStyle: {
    width: '48%',
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCardContent: {
    alignItems: 'center', 
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  secondaryIcon: {
    marginBottom: 10,
  },
  secondaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  emergencyTitle: {
    color: 'white',
  },
});