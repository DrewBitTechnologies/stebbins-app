import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface ButtonItem {
  title: string;
  navigateTo: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const verticalButtons: ButtonItem[] = [
    { title: 'Safety Information', navigateTo: '/safety' },
    { title: 'Trail Rules', navigateTo: '/rules' },
    { title: 'Trail Map', navigateTo: '/(tabs)/map' },
    { title: 'About', navigateTo: '/about' },
  ];

  const horizontalButtons: ButtonItem[] = [
    { title: 'Emergency', navigateTo: '/emergency' },
    { title: 'Guides', navigateTo: '/(tabs)/guides' },
    { title: 'Report', navigateTo: '/(tabs)/report' },
  ];

  // Placeholder status instead of Firebase
  const status = "The reserve is currently open. Weather conditions are good. Please follow all trail rules and safety guidelines. Have a great visit!";

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.parentView}>
      <ImageBackground 
        source={require('../../assets/dev/home.jpeg')}
        style={styles.backgroundImage}
      >
        <View style={styles.reserveStatus}>
          <Text style={{ fontSize: 28 }}>Reserve Status</Text>
          <ScrollView>
            <Text style={{ fontSize: 18, lineHeight: 30 }}>{status}</Text>
          </ScrollView>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View style={[styles.horizontalButtons, styles.shadowProp]}>
          {horizontalButtons.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={item.title === 'Guides' ? styles.horizontalGuideButton : styles.horizontalButton}
              onPress={() => handleNavigation(item.navigateTo)}
            >
              <View style={item.title === 'Guides' ? styles.guideButton : styles.horizontalButton}>
                <Text style={styles.buttonText}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.verticalButtons, styles.shadowProp]}>
          {verticalButtons.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={item.title === 'About' ? styles.bottomVerticalButton : styles.verticalButton}
              onPress={() => handleNavigation(item.navigateTo)}
            >
              <View style={styles.verticalButtonLabel}>
                <Text style={styles.buttonText}>{item.title}</Text>
                <Ionicons name="chevron-forward-outline" size={18} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentView: {
    flex: 1,
    backgroundColor: 'white',
  }, 
  backgroundImage: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  reserveStatus: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 191, 0, 0.8)',
    borderRadius: 15,
    padding: 10,
    width: '95%',
    margin: 10,
  },
  horizontalButtons: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(243, 196, 54, 1.0)',
    borderColor: 'black',
    borderRadius: 15,
    width: 'auto',
  },
  horizontalButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 15,
  },
  horizontalGuideButton: {
    flex: 1,
    paddingRight: 3,
    paddingLeft: 3,
    width: '100%',
    borderColor: 'rgba(235, 235, 235, 1.0)',
    borderLeftWidth: 3,
    borderRightWidth: 3,
  },
  guideButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 15,
  },
  verticalButtons: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    backgroundColor: 'white',
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 15,
  },
  verticalButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    borderBottomWidth: 2,
    borderColor: 'rgba(225, 225, 225, 1.0)',
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    margin: 3,
  },
  bottomVerticalButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    margin: 3,
  },
  verticalButtonLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  horizontalButtonLabel: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: { width: -4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
});