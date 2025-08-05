import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ToastProps {
  message: string | null;
  position?: 'top' | 'bottom' | 'center';
  style?: any;
}

export default function Toast({ message, position = 'bottom', style }: ToastProps) {
  if (!message) return null;

  const positionStyle = getPositionStyle(position);

  return (
    <View style={[styles.container, positionStyle, style]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const getPositionStyle = (position: 'top' | 'bottom' | 'center') => {
  switch (position) {
    case 'top':
      return styles.positionTop;
    case 'center':
      return styles.positionCenter;
    case 'bottom':
    default:
      return styles.positionBottom;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 5,
    zIndex: 10,
  },
  positionTop: {
    top: 100,
  },
  positionCenter: {
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  positionBottom: {
    bottom: 90,
  },
  text: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});