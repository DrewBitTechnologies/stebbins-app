import { FilterColors } from '@/assets/dev/color_palette';

// Opacity values (hex alpha channel: 00-FF)
const BG_OPACITY = '40';      // 25% opacity for background (unselected)
const BORDER_OPACITY = '66';  // 40% opacity for border (unselected)
const WHITE_BG_OPACITY = '40'; // 25% opacity for white background (unselected)
const WHITE_BORDER_OPACITY = '66'; // 40% opacity for white border (unselected)

export const getColorStyle = (colorName: string) => {
  const color = colorName.toLowerCase();
  const colorMap: Record<string, { backgroundColor: string; borderColor: string; selectedBg: string }> = {
    red: {
      backgroundColor: `${FilterColors.filter_red}${BG_OPACITY}`,
      borderColor: `${FilterColors.filter_red}${BORDER_OPACITY}`,
      selectedBg: FilterColors.filter_red
    },
    pink: {
      backgroundColor: `${FilterColors.filter_pink}${BG_OPACITY}`,
      borderColor: `${FilterColors.filter_pink}${BORDER_OPACITY}`,
      selectedBg: FilterColors.filter_pink
    },
    orange: {
      backgroundColor: `${FilterColors.filter_orange}${BG_OPACITY}`,
      borderColor: `${FilterColors.filter_orange}${BORDER_OPACITY}`,
      selectedBg: FilterColors.filter_orange
    },
    yellow: {
      backgroundColor: `${FilterColors.filter_yellow}${BG_OPACITY}`,
      borderColor: `${FilterColors.filter_yellow}${BORDER_OPACITY}`,
      selectedBg: FilterColors.filter_yellow
    },
    green: {
      backgroundColor: `${FilterColors.filter_green}${BG_OPACITY}`,
      borderColor: `${FilterColors.filter_green}${BORDER_OPACITY}`,
      selectedBg: FilterColors.filter_green
    },
    blue: {
      backgroundColor: `${FilterColors.filter_blue}${BG_OPACITY}`,
      borderColor: `${FilterColors.filter_blue}${BORDER_OPACITY}`,
      selectedBg: FilterColors.filter_blue
    },
    purple: {
      backgroundColor: `${FilterColors.filter_purple}${BG_OPACITY}`,
      borderColor: `${FilterColors.filter_purple}${BORDER_OPACITY}`,
      selectedBg: FilterColors.filter_purple
    },
    white: {
      backgroundColor: `${FilterColors.filter_white}${WHITE_BG_OPACITY}`,
      borderColor: `${FilterColors.filter_white_border}${WHITE_BORDER_OPACITY}`,
      selectedBg: FilterColors.filter_white
    },
    brown: {
      backgroundColor: `${FilterColors.filter_brown}${BG_OPACITY}`,
      borderColor: `${FilterColors.filter_brown}${BORDER_OPACITY}`,
      selectedBg: FilterColors.filter_brown
    },
  };

  return colorMap[color] || null;
};
