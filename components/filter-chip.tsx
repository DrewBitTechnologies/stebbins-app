import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(45, 80, 22, 0.2)',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    borderColor: '#2d5016',
  },
  filterChipText: {
    fontSize: 13,
    color: '#2d5016',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#2d5016',
    fontWeight: '600',
  },
});