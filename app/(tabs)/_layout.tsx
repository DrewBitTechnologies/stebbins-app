import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animated, Text, Pressable } from 'react-native';
import { ColorPalette } from '@/assets/dev/color_palette';
import { useRef, useEffect } from 'react';
import { useReportDraft } from '@/contexts/report-draft';

export default function TabsLayout() {
  // Get the safe area insets
  const insets = useSafeAreaInsets();

  // Get report draft notification status
  const { shouldShowNotification } = useReportDraft();

  // Create animated values for each tab
  const homeScale = useRef(new Animated.Value(1)).current;
  const mapScale = useRef(new Animated.Value(1)).current;
  const guideScale = useRef(new Animated.Value(1)).current;
  const reportScale = useRef(new Animated.Value(1)).current;
  const donateScale = useRef(new Animated.Value(1)).current;

  // Create animated values for report tab bounce and rotation
  const reportBounce = useRef(new Animated.Value(0)).current;
  const reportRotation = useRef(new Animated.Value(0)).current;

  // Bouncing and rotating animation for report tab notification
  useEffect(() => {
    if (shouldShowNotification) {
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          // Bounce up and down with smooth continuous rotation
          Animated.parallel([
            // Bounce sequence
            Animated.sequence([
              Animated.timing(reportBounce, {
                toValue: -12,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(reportBounce, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
            // Continuous rotation throughout the entire bounce
            Animated.timing(reportRotation, {
              toValue: 1,
              duration: 600, // Same total duration as bounce cycle
              useNativeDriver: true,
            }),
          ]),
          // Reset rotation instantly for next cycle
          Animated.timing(reportRotation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(1000), // Pause between flip cycles
        ])
      );
      bounceAnimation.start();

      return () => {
        bounceAnimation.stop();
        reportBounce.setValue(0);
        reportRotation.setValue(0);
      };
    } else {
      reportBounce.setValue(0);
      reportRotation.setValue(0);
    }
  }, [shouldShowNotification, reportBounce, reportRotation]);

  // Animation function for tab press
  const animateTabPress = (scaleValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.85,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 75,
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
    bounceValue,
    rotationValue,
    ...props
  }: {
    children?: React.ReactNode;
    onPress?: (event: any) => void;
    accessibilityState?: any;
    isFocused?: boolean;
    iconName: string;
    label: string;
    scaleValue: Animated.Value;
    bounceValue?: Animated.Value;
    rotationValue?: Animated.Value;
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

    // Interpolate rotation value from 0-1 to 0deg to -360deg (counter-clockwise)
    const rotation = rotationValue
      ? rotationValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-360deg'],
        })
      : '0deg';

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
          {/* Icon with bounce and rotation */}
          <Animated.View
            style={{
              transform: [
                { translateY: bounceValue || 0 },
                { rotate: rotation }
              ]
            }}
          >
            <Ionicons
              name={isTabFocused ? iconName : `${iconName}-outline` as any}
              size={24}
              color={iconColor}
              style={{ marginBottom: 2 }}
            />
          </Animated.View>

          {/* Text without rotation */}
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
                bounceValue={reportBounce}
                rotationValue={reportRotation}
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