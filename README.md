# Stebbins Cold Canyon Reserve App

A React Native mobile application for visitors and researchers of the UC Davis Stebbins Cold Canyon Reserve. This app provides interactive maps, wildlife guides, safety information, and reporting capabilities for one of California's premier natural reserves.

## 🌿 About Stebbins Cold Canyon Reserve

The UC Davis Stebbins Cold Canyon Reserve is a 690-acre natural reserve located in the Inner Coast Range of Northern California. The reserve serves as a living laboratory for research and education, featuring diverse ecosystems including oak woodlands, chaparral, and riparian areas.

## 📱 Features

### 🗺️ Interactive Map
- High-resolution offline maps powered by Mapbox
- GPS location tracking and navigation
- Trail markers, safety points, and points of interest
- Downloadable offline map packs for use without cell service

### 🔍 Wildlife & Plant Guides
- **Wildflowers**: Comprehensive guide to seasonal blooms
- **Trees & Shrubs**: Identification guide for woody plants
- **Birds**: Local and migratory species with photos
- **Mammals**: Wildlife identification and habitat information
- **Invertebrates**: Insects, spiders, and other small creatures
- **Tracks & Signs**: Animal tracking guide
- **Reptiles & Amphibians**: Herptile species guide

### 📋 Reporting System
- Submit wildlife observations and research data
- Upload photos and location data
- Report safety concerns or maintenance issues
- Integrated with reserve management systems

### 🚨 Safety & Information
- Emergency contact information
- Reserve rules and regulations
- Safety guidelines and best practices
- Real-time reserve status updates

### 💰 Support
- Information about reserve programs
- Donation options and ways to get involved
- Links to UC Davis Natural Reserve System

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with tab-based navigation
- **Maps**: Mapbox GL JS for interactive mapping
- **State Management**: React Context API
- **Data Storage**: Expo File System with local caching
- **Image Handling**: Expo Image with optimization
- **Location Services**: Expo Location
- **Backend**: Custom API integration with Directus CMS
- **Development**: TypeScript, ESLint

## 🏗️ Architecture

### Frontend Structure
```
app/
├── (tabs)/           # Tab-based navigation screens
│   ├── home.tsx      # Reserve status and welcome
│   ├── map.tsx       # Interactive map with markers
│   ├── guide.tsx     # Wildlife & plant guides
│   ├── report.tsx    # Data submission forms
│   └── donate.tsx    # Support information
├── guides/           # Individual guide screens
├── about.tsx         # Reserve information
├── emergency.tsx     # Emergency contacts
├── rules.tsx         # Reserve regulations
├── safety.tsx        # Safety guidelines
└── splash.tsx        # App initialization screen

contexts/
├── api.config.ts     # Environment variable management
├── api.service.ts    # Data fetching and caching
└── api.tsx          # State management context

components/
├── guide-list-screen.tsx  # Reusable guide interface
├── screen-header.tsx      # Consistent page headers
├── app-header.tsx         # Main navigation header
└── ...                    # UI components
```

### Data Management
- **Offline-First**: All content cached locally for offline use
- **Smart Sync**: Incremental updates when online
- **Image Optimization**: CDN integration with local fallbacks
- **Environment-Specific**: Runtime configuration for development/production

## 🚀 Getting Started

### Prerequisites
- Node.js (18.x or later)
- npm or yarn
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Expo CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stebbins-app.git
   cd stebbins-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_URL=https://your-api-url.com
   EXPO_PUBLIC_API_KEY=your-api-key
   EXPO_PUBLIC_CDN_URL=https://your-cdn-url.com
   EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
   EXPO_PUBLIC_MAPBOX_STYLE_URL=mapbox://styles/your-style
   EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN=your-download-token
   EXPO_PUBLIC_REPORT_FILES_FOLDER_ID=your-folder-id
   EXPO_PUBLIC_EXPO_PROJECT_ID=your-expo-project-id
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 📦 Building for Production

### EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas login
   eas build:configure
   ```

3. **Build for iOS**
   ```bash
   eas build --platform ios --profile production
   ```

4. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```

### Environment Configuration

The app uses different environment configurations for development, preview, and production builds. All environment variables are defined in `eas.json` and accessed via runtime getters for reliable production builds.

## 🗂️ Project Structure

### Key Directories

- **`/app`**: Main application screens using Expo Router
- **`/components`**: Reusable UI components
- **`/contexts`**: API and state management
- **`/utility`**: Helper functions and utilities
- **`/assets`**: Images, fonts, and static resources

### Key Files

- **`app.config.ts`**: Expo configuration and build settings
- **`eas.json`**: Build profiles and environment variables
- **`package.json`**: Dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint with Expo configuration
- Consistent component patterns
- Runtime environment variable validation

### Testing

- Test on both iOS and Android platforms
- Verify offline functionality
- Test with various device sizes
- Validate map functionality and GPS

## 🌐 API Integration

The app integrates with a custom backend API built on Directus CMS, providing:

- **Content Management**: Dynamic content updates
- **File Management**: Image and document storage
- **User Submissions**: Report and observation data
- **Cache Management**: Efficient data synchronization

### API Endpoints

- `/items/home/` - Reserve status and announcements
- `/items/guide/` - Wildlife guide categories
- `/items/wildflower/` - Plant identification data
- `/items/bird/` - Bird species information
- `/items/safety_marker/` - Map safety points
- `/files` - File upload and management

## 📱 App Store Deployment

### iOS (App Store)
1. Build with EAS: `eas build --platform ios --profile production`
2. Submit to TestFlight: `eas submit --platform ios`
3. Review and release through App Store Connect

### Android (Google Play)
1. Build with EAS: `eas build --platform android --profile production`
2. Submit to Play Console: `eas submit --platform android`
3. Review and release through Google Play Console

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with proper TypeScript types
4. Test thoroughly on both platforms
5. Submit a pull request with detailed description

### Development Guidelines

- Follow existing code patterns and conventions
- Add TypeScript types for all new code
- Test on both iOS and Android
- Update documentation for new features
- Ensure offline functionality works correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Technical Issues**: Open an issue on GitHub
- **Reserve Information**: Contact UC Davis Natural Reserve System
- **App Store Issues**: Contact the development team

## 🏛️ About UC Davis Natural Reserve System

The UC Davis Natural Reserve System manages 756,000 acres across 41 sites throughout California, supporting research, education, and conservation. Learn more at [nrs.ucdavis.edu](https://nrs.ucdavis.edu).

---

**Built with ❤️ for conservation education and research**

*This app supports the mission of the UC Davis Stebbins Cold Canyon Reserve in promoting scientific research, education, and conservation of California's natural heritage.*
