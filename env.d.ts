declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL: string;
    EXPO_PUBLIC_API_KEY: string;
    EXPO_PUBLIC_REPORT_FILES_FOLDER_ID: string;
    EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN: string;
    EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN: string;
    EXPO_PUBLIC_EXPO_PROJECT_ID: string;
  }
}