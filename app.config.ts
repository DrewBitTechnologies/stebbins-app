// app.config.ts
import 'dotenv/config'; // This line is crucial to load variables from .env
import { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => {
  return {
    ...config,
    name: "Stebbins",
    slug: "stebbins-cold-canyon-reserve-app",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "stebbinsapp",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "stebbins.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationAlwaysAndWhenInUseUsageDescription: "The app uses precise location to display geographic position on the reserve map.",
        NSLocationWhenInUseUsageDescription: "The app uses precise location to display geographic position on the reserve map.",
        NSPhotoLibraryUsageDescription: "This app needs access to the photo library to enable uploading images and videos when creating a report."
      }
    },
    android: {
      package: "stebbins.app",
      versionCode: 9,
      adaptiveIcon: {
        foregroundImage: "./assets/images/splash-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#ffffff",
          "image": "./assets/images/splash-icon.png",
          "resizeMode": "contain"
        }
      ],
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsDownloadToken": process.env.EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN,
        }
      ]
    ],
    extra: {
      router: {},
      eas: {
        projectId: process.env.EXPO_PUBLIC_EXPO_PROJECT_ID,
      }
    },
    owner: "stebbinsapp"
  };
};