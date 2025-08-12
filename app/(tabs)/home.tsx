import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeData, useApi, useScreen } from '../../contexts/api';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';
import ScreenHeader from '@/components/screen-header';
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
  const { checkForUpdates } = useApi();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const checkmarkFadeAnim = useRef(new Animated.Value(0)).current;
  const rotationCount = useRef(0);
  const isAnimating = useRef(false);

  const mainButtons: ButtonItem[] = [
    {
      title: 'Trail Map',
      navigateTo: '/(tabs)/map',
      icon: 'map',
      description: 'Navigate the reserve with a live map',
      color: '#2d5016'
    },
    {
      title: 'Field Guides',
      navigateTo: '/(tabs)/guide',
      icon: 'book',
      description: 'Identify local flora and fauna',
      color: '#2d5016'
    },
    {
      title: 'Report an Issue',
      navigateTo: '/(tabs)/report',
      icon: 'warning',
      description: 'Help us maintain the trails',
      color: '#2d5016'
    },
  ];

  const secondaryButtons: ButtonItem[] = [
    {
      title: 'Safety Info',
      navigateTo: '/safety',
      icon: 'shield-checkmark',
      description: 'Essential safety guidelines',
      color: '#4a7c59'
    },
    {
      title: 'Trail Rules',
      navigateTo: '/rules',
      icon: 'trail-sign',
      description: 'Know before you go',
      color: '#4a7c59'
    },
    {
      title: 'About the Reserve',
      navigateTo: '/about',
      icon: 'information-circle',
      description: 'Learn about our mission',
      color: '#4a7c59'
    },
    {
      title: 'Emergency',
      navigateTo: '/emergency',
      icon: 'call',
      description: 'Quick access to help',
      color: '#c70000'
    },
  ];
  
  const handleManualRefresh = async () => {
    if (isAnimating.current || isLoading) return;
    
    console.log("Starting app update check from home screen...");
    
    // Track the initial loading state to detect if checkScreensForUpdates runs
    const initialLoadingState = isLoading;
    
    // Start the API call first
    const updatePromise = checkForUpdates((message) => {
        console.log(message);
    });
    
    // Check if there will actually be loading (data to fetch)
    // If no loading state is triggered quickly, do the animation
    setTimeout(() => {
      if (!isLoading && !isAnimating.current) {
        isAnimating.current = true;
        rotationCount.current += 1;
        
        // Start with rotation
        Animated.timing(rotateAnim, {
          toValue: rotationCount.current,
          duration: 300,
          useNativeDriver: true,
        }).start(async () => {
          // Wait for the update check to complete and then check if updates occurred
          await updatePromise;
          
          // If isLoading became true during the process, updates were found
          const updatesOccurred = isLoading || initialLoadingState !== isLoading;
          
          if (!updatesOccurred) {
            // No updates found - show checkmark animation
            Animated.sequence([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(checkmarkFadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.delay(300), // Show checkmark for 300ms
              Animated.timing(checkmarkFadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              isAnimating.current = false;
            });
          } else {
            // Updates occurred - just finish the animation
            isAnimating.current = false;
          }
        });
      }
    }, 100);
    
    console.log("App update check complete.");
  };

  const status = homeData?.reserve_status || "Loading status...";

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const ReserveStatusCard = () => (
    <Card variant="warning" margin="none" style={{ marginBottom: 20 }}>
      <View style={styles.statusHeader}>
        <View style={styles.megaphoneContainer}>
          <Ionicons name="megaphone" size={24} color="#000000" />
        </View>
        <Text style={styles.statusTitle}>Reserve Status</Text>
        <TouchableOpacity 
          onPress={handleManualRefresh} 
          style={styles.reloadButton} 
          disabled={isLoading}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color="#000000" 
            />
          </Animated.View>
          <Animated.View
            style={{
              position: 'absolute',
              opacity: checkmarkFadeAnim,
            }}
          >
            <Ionicons 
              name="checkmark" 
              size={20} 
              color="#000000" 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000000" />
        </View>
      ) : (
        <Text style={styles.statusText}>{status}</Text>
      )}
    </Card>
  );

  return (
    <ScreenBackground backgroundSource={getImageSource(homeData, 'background', getImagePath, require('@/assets/dev/fallback.jpeg'))}>
      <ScreenHeader 
        icon="leaf"
        title="Stebbins Nature Reserve"
        subtitle="Welcome to your outdoor adventure"
      />

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
  },
  megaphoneContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reloadButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 22,
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