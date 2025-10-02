import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ColorPalette } from '@/assets/dev/color_palette';

interface FilterModeToggleProps {
  mode: 'OR' | 'AND';
  onModeChange: (mode: 'OR' | 'AND') => void;
}

const FilterModeToggle: React.FC<FilterModeToggleProps> = ({ mode, onModeChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mode === 'OR' && styles.buttonActive]}
        onPress={() => onModeChange('OR')}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, mode === 'OR' && styles.buttonTextActive]}>OR</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, mode === 'AND' && styles.buttonActive]}
        onPress={() => onModeChange('AND')}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, mode === 'AND' && styles.buttonTextActive]}>AND</Text>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(FilterModeToggle);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 80, 22, 0.2)',
  },
  buttonActive: {
    backgroundColor: ColorPalette.primary_green,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: ColorPalette.primary_green,
  },
  buttonTextActive: {
    color: ColorPalette.white,
  },
});
