import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { ColorPalette } from '@/assets/dev/color_palette';

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
}

export default function ExpandableText({ text, maxLines = 3 }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  
  const animationValue = useSharedValue(0);

  const onTextLayout = (event: any) => {
    if (!expanded && event.nativeEvent.lines.length >= maxLines) {
      setShowMoreButton(true);
    }
  };

  const toggleText = () => {
    setExpanded(!expanded);
    animationValue.value = withTiming(expanded ? 0 : 1);
  };

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(animationValue.value, [0, 1], [0, -180])}deg` }
      ],
    };
  });

  return (
    <Animated.View>
      <Text
        style={styles.description}
        numberOfLines={expanded ? undefined : maxLines}
        onTextLayout={onTextLayout}
      >
        {text}
      </Text>
      {(showMoreButton || expanded) && (
        <TouchableOpacity onPress={toggleText} style={styles.moreButton}>
          <Text style={styles.moreButtonText}>
            {expanded ? 'Less' : 'More'}
          </Text>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={12} color={ColorPalette.primary_green} style={styles.moreButtonIcon} />
          </Animated.View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 15,
    color: ColorPalette.text_secondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  moreButtonText: {
    fontSize: 14,
    color: ColorPalette.primary_green,
    fontWeight: '500',
  },
  moreButtonIcon: {
    marginLeft: 4,
  },
});