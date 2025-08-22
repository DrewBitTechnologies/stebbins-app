import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animated, Text, Pressable } from 'react-native';
import { ColorPalette } from '@/assets/dev/color_palette';
import { useRef, useEffect } from 'react';

export default function TabsLayout() {
  // Get the safe area insets
  const insets = useSafeAreaInsets();
  
  // Create animated values for each tab
  const homeScale = useRef(new Animated.Value(1)).current;
  const mapScale = useRef(new Animated.Value(1)).current;
  const guideScale = useRef(new Animated.Value(1)).current;
  const reportScale = useRef(new Animated.Value(1)).current;
  const donateScale = useRef(new Animated.Value(1)).current;

  // Animation function for tab press
  const animateTabPress = (scaleValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.75,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animated tab button component
  const AnimatedTabButton = ({ 
    children, 
    onPress, 
    accessibilityState, 
    isFocused, 
    iconName, 
    label, 
    scaleValue,
    ...props
  }: {
    children?: React.ReactNode;
    onPress?: (event: any) => void;
    accessibilityState?: any;
    isFocused?: boolean;
    iconName: string;
    label: string;
    scaleValue: Animated.Value;
    [key: string]: any;
  }) => {
    // Extract focused state from aria-selected prop
    const isTabFocused = isFocused || accessibilityState?.selected || props['aria-selected'] || false;
    
    useEffect(() => {
      if (isTabFocused) {
        animateTabPress(scaleValue);
      }
    }, [isTabFocused, scaleValue]);

    const handlePress = (event: any) => {
      animateTabPress(scaleValue);
      if (onPress) {
        onPress(event);
      }
    };

    const iconColor = isTabFocused ? ColorPalette.primary_blue : '#8E8E93';
    const textColor = isTabFocused ? ColorPalette.primary_blue : '#8E8E93';

    return (
      <Pressable
        {...props}
        onPress={handlePress}
        accessibilityState={accessibilityState}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 6,
        }}
      >
        <Animated.View 
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: scaleValue }]
          }}
        >
          <Ionicons
            name={isTabFocused ? iconName : `${iconName}-outline` as any}
            size={24}
            color={iconColor}
            style={{ marginBottom: 2 }}
          />
          <Text 
            style={{
              fontSize: 10,
              color: textColor,
              textAlign: 'center',
              fontWeight: isTabFocused ? '600' : '400'
            }}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };
  
  return (
    <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 60 + (insets.bottom > 0 ? insets.bottom : 16),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 10,
            elevation: 10,
            shadowColor: ColorPalette.black,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.5,
            shadowRadius: 3,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarButton: (props) => (
              <AnimatedTabButton
                {...props}
                iconName="home"
                label="Home"
                scaleValue={homeScale}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            tabBarButton: (props) => (
              <AnimatedTabButton
                {...props}
                iconName="map"
                label="Map"
                scaleValue={mapScale}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="guide"
          options={{
            tabBarButton: (props) => (
              <AnimatedTabButton
                {...props}
                iconName="book"
                label="Guide"
                scaleValue={guideScale}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            tabBarButton: (props) => (
              <AnimatedTabButton
                {...props}
                iconName="warning"
                label="Report"
                scaleValue={reportScale}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="donate"
          options={{
            tabBarButton: (props) => (
              <AnimatedTabButton
                {...props}
                iconName="wallet"
                label="Donate"
                scaleValue={donateScale}
              />
            ),
          }}
        />
      </Tabs>
  );
}