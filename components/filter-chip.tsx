import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ColorPalette } from '@/assets/dev/color_palette';
import { getColorStyle } from '@/utility/color-styles';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  type?: 'color' | 'season';
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress, type }) => {
  const colorStyle = type === 'color' ? getColorStyle(label) : null;
  const isWhite = label.toLowerCase() === 'white';

  const chipStyle = colorStyle
    ? selected
      ? isWhite
        ? { backgroundColor: colorStyle.selectedBg, borderColor: ColorPalette.primary_green }
        : { backgroundColor: colorStyle.selectedBg, borderColor: colorStyle.selectedBg }
      : { backgroundColor: colorStyle.backgroundColor, borderColor: colorStyle.borderColor }
    : {};

  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selected && !colorStyle && styles.filterChipSelected,
        chipStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.filterChipText,
        selected && (isWhite ? styles.filterChipTextSelectedWhite : styles.filterChipTextSelected)
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default React.memo(FilterChip);

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
  filterChipTextSelectedWhite: {
    color: ColorPalette.primary_green,
    fontWeight: '600',
  },
});