export const ColorPalette = {
  // UC Davis Primary Colors
  ucd_blue: '#022851',
  ucd_blue_90: '#033266',
  ucd_blue_80: '#1D4776',
  ucd_blue_70: '#355B85',
  ucd_blue_60: '#4F7094',
  ucd_blue_50: '#6884A3',
  ucd_blue_40: '#8198B2',
  ucd_blue_30: '#9AADC2',
  ucd_blue_20: '#B3C1D1',
  ucd_blue_10: '#CDD6E0',
  
  ucd_gold: '#FFBF00',
  ucd_gold_90: '#FFC519',
  ucd_gold_80: '#FFCC33',
  ucd_gold_70: '#FFD24C',
  ucd_gold_60: '#FFD966',
  ucd_gold_50: '#FFDF80',
  ucd_gold_40: '#FFE599',
  ucd_gold_30: '#FFECB2',
  ucd_gold_20: '#FFF2CC',
  ucd_gold_10: '#FFF9E5',
  
  // Black/Gray Scale
  black: '#000000',
  black_90: '#191919',
  black_80: '#333333',
  black_70: '#4C4C4C',
  black_60: '#666666',
  black_50: '#7F7F7F',
  black_40: '#999999',
  black_30: '#B2B2B2',
  black_20: '#CCCCCC',
  black_10: '#E5E5E5',
  white: '#FFFFFF',
  
  // Secondary Colors - Blues/Teals
  rec_pool: '#6FCFEB',
  tahoe: '#00B2E3',
  gunrock: '#0047BA',
  bodega: '#003A5D',
  rain: '#03F9E6',
  arboretum: '#00C4B3',
  putah_creek: '#008EAA',
  delta: '#00524C',
  
  // Secondary Colors - Greens
  farmers_market: '#AADA91',
  sage: '#6CCA98',
  quad: '#3DAE2B',
  redwood: '#266041',
  
  // Secondary Colors - Yellows/Oranges
  golden_state: '#FFFF3B',
  sunflower: '#FFDC00',
  poppy: '#F18A00',
  california: '#8A532F',
  
  // Secondary Colors - Reds/Pinks
  rose: '#FF8189',
  strawberry: '#F93549',
  double_decker: '#C10230',
  merlot: '#79242F',
  thiebaud_icing: '#F095CD',
  redbud: '#C6007E',
  pinot: '#76236C',
  cabernet: '#481268',
  
  // Common aliases for easier use
  primary_blue: '#022851',
  primary_gold: '#FFBF00',
  primary_green: '#266041', // redwood
  primary_red: '#F93549', // strawberry
  
  // Text colors
  text_primary: '#000000',
  text_secondary: '#333333',
  text_light: '#666666',
  text_on_dark: '#FFFFFF',
  
  // Background colors
  bg_primary: '#FFFFFF',
  bg_secondary: '#E5E5E5',
  bg_accent: '#CDD6E0',
  bg_light_gray: '#f0f0f0',
  bg_lighter_gray: '#f8f9fa',
  border_light: '#eee',
  border_lighter: '#e9ecef',
  
  // Transparency variants for common use
  redwood_10: 'rgba(38, 96, 65, 0.1)',
  black_05: 'rgba(0, 0, 0, 0.05)',
  white_80_alpha: 'rgba(255,255,255,0.8)',
  white_90: 'rgba(255, 255, 255, 0.9)',
  black_50_alpha: 'rgba(0,0,0,0.5)',
  
} as const;

export type ColorPaletteKeys = keyof typeof ColorPalette;