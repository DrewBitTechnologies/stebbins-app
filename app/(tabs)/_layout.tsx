import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { ColorPalette } from '@/assets/dev/color_palette';

export default function TabsLayout() {
  // Get the safe area insets
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: ColorPalette.primary_blue,
          tabBarInactiveTintColor: ColorPalette.primary_blue,
          headerShown: false,
          animation: 'fade',
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
                shadowColor: ColorPalette.black,
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
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
            ),
            tabBarLabel: 'Home',
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "map" : "map-outline"} size={size} color={color} />
            ),
            tabBarLabel: 'Map',
          }}
        />
        <Tabs.Screen
          name="guide"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "book" : "book-outline"} size={size} color={color} />
            ),
            tabBarLabel: 'Guide',
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "warning" : "warning-outline"} size={size} color={color} />
            ),
            tabBarLabel: 'Report',
          }}
        />
        <Tabs.Screen
          name="donate"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "wallet" : "wallet-outline"} size={size} color={color} />
            ),
            tabBarLabel: 'Donate',
          }}
        />
      </Tabs>
  );
}