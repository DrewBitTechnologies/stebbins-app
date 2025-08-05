import * as FileSystem from 'expo-file-system';

// --- Constants ---
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export const BEARER_TOKEN = process.env.EXPO_PUBLIC_API_KEY;
export const CDN_URL = process.env.EXPO_PUBLIC_CDN_URL;
export const REPORT_FILES_FOLDER_ID = process.env.EXPO_PUBLIC_REPORT_FILES_FOLDER_ID;
export const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
export const MAPBOX_STYLE_URL = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL;
export const CACHE_DIR = FileSystem.documentDirectory + 'cache/';
export const IMAGE_FIELD_KEYS = ['image', 'background', 'rules_image', 'safety_image', 'icon', 'map_icon', 'header_image', 'splash_image'];

// --- Screen Configuration ---
export interface ScreenConfig {
  endpoint: string;
  cacheKey: string;
  isCollection: boolean;
}

export const SCREEN_CONFIGS: Record<string, ScreenConfig> = {
  home: { endpoint: '/items/home/', cacheKey: 'home_data', isCollection: false },
  about: { endpoint: '/items/about/', cacheKey: 'about_data', isCollection: false },
  donate: { endpoint: '/items/donate/', cacheKey: 'donate_data', isCollection: false },
  guide: { endpoint: '/items/guide/', cacheKey: 'guide_data', isCollection: false },
  emergency: { endpoint: '/items/emergency/', cacheKey: 'emergency_data', isCollection: false },
  rules: { endpoint: '/rules/', cacheKey: 'rules_data', isCollection: false },
  safety: { endpoint: '/items/safety/', cacheKey: 'safety_data', isCollection: false },
  report: { endpoint: '/items/reports/', cacheKey: 'report_data', isCollection: false },
  guide_wildflower: { endpoint: '/items/wildflower/', cacheKey: 'guide_wildflower', isCollection: true },
  guide_tree_shrub: { endpoint: '/items/tree_shrub/', cacheKey: 'guide_tree_shrub', isCollection: true },
  guide_bird: { endpoint: '/items/bird/', cacheKey: 'guide_bird', isCollection: true },
  guide_mammal: { endpoint: '/items/mammal/', cacheKey: 'guide_mammal', isCollection: true },
  guide_invertebrate: { endpoint: '/items/invertebrate/', cacheKey: 'guide_invertebrate', isCollection: true },
  guide_track: { endpoint: '/items/track/', cacheKey: 'guide_track', isCollection: true },
  guide_herp: { endpoint: '/items/herp/', cacheKey: 'guide_herp', isCollection: true },
  nature_trail_marker: { endpoint: '/items/nature_trail_marker/', cacheKey: 'nature_trail_marker', isCollection: true },
  mile_marker: { endpoint: '/items/mile_marker/', cacheKey: 'mile_marker', isCollection: true },
  safety_marker: { endpoint: '/items/safety_marker/', cacheKey: 'safety_marker', isCollection: true },
  poi_marker: { endpoint: '/items/point_of_interest_marker/', cacheKey: 'poi_marker', isCollection: true },
  branding: { endpoint: '/items/branding/', cacheKey: 'branding_data', isCollection: false },
};

// --- Helper Functions for Paths ---
export const getDataFilePath = (cacheKey: string) => `${CACHE_DIR}${cacheKey}.json`;
export const getImageFilePath = (screenName: string, imageName: string) => `${CACHE_DIR}${screenName}_${imageName}`;