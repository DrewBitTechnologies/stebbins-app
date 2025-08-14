import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ColorPalette } from '@/assets/dev/color_palette';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selected && styles.filterChipSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.filterChipText,
        selected && styles.filterChipTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 80, 22, 0.2)',
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipSelected: {
    backgroundColor: ColorPalette.primary_green,
    borderColor: ColorPalette.primary_green,
  },
  filterChipText: {
    fontSize: 14,
    color: ColorPalette.primary_green,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: ColorPalette.white,
    fontWeight: '600',
  },
});