import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function TabsLayout() {
  // Get the safe area insets
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#022851',
          tabBarInactiveTintColor: '#8e8e93',
          headerShown: false,
          tabBarStyle: {
            height: 60 + (insets.bottom > 0 ? insets.bottom : 16),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
            // Add elevation for Android and shadow for iOS
            ...Platform.select({
              android: {
                elevation: 8,
              },
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
              },
            }),
          },
          // Add padding to the tab bar items to center them better when accounting for safe area
          tabBarItemStyle: {
            paddingBottom: insets.bottom > 0 ? 6 : 0,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="guide"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="warning-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="donate"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
  );
}