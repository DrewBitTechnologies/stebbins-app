import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ImageBackground, ScrollView, LayoutAnimation, UIManager, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useScreen, HomeData } from '../../contexts/ApiContext';
import { LinearGradient } from 'expo-linear-gradient';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ButtonItem {
  title: string;
  navigateTo: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: homeData, getImagePath, fetch, isLoading } = useScreen<HomeData>('home');

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

  const status = homeData?.reserve_status || "Loading status...";

  const getBackgroundSource = () => {
    const backgroundPath = getImagePath('background');
    return backgroundPath ? { uri: backgroundPath } : require('../../assets/dev/fallback.jpeg');
  };

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const ReserveStatusCard = () => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Ionicons name="megaphone" size={24} color="#1a1a1a" />
        <Text style={styles.statusTitle}>Reserve Status</Text>
        <TouchableOpacity onPress={() => fetch()} style={styles.reloadButton} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#1a1a1a" />
          ) : (
            <Ionicons name="refresh" size={22} color="#1a1a1a" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.statusText}>{isLoading ? 'Loading status...' : status}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={getBackgroundSource()}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)']}
        style={styles.gradientOverlay}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* <View style={styles.headerSection}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="leaf" size={32} color="white" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Stebbins</Text>
            </View>
            <Text style={styles.headerSubtitle}>Your official guide to Stebbins Cold Canyon Reserve</Text>
        </View> */}

        <ReserveStatusCard />

        <View style={styles.cardsContainer}>
          {mainButtons.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.mainCard}
              onPress={() => handleNavigation(item.navigateTo)}
              activeOpacity={0.8}
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
          ))}
        </View>

        <View style={styles.secondaryGrid}>
          {secondaryButtons.map((item) => (
             <TouchableOpacity
             key={item.title}
             style={[
               styles.secondaryCard,
               item.title === 'Emergency' && styles.emergencyCard
             ]}
             onPress={() => handleNavigation(item.navigateTo)}
             activeOpacity={0.8}
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
          ))}
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 4,
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: 'rgba(255, 191, 0, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
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
    marginBottom: 20,
  },
  mainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    marginHorizontal: -6, // Counteract card margin
  },
  secondaryCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emergencyCard: {
    backgroundColor: '#e63946',
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