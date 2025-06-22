import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useScreen, AboutData } from '@/contexts/ApiContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutScreen() {
    const { data: aboutData, getImagePath } = useScreen<AboutData>('about');

    const handleWebsitePress = async (): Promise<void> => {
        try {
            // Use API link if available, otherwise fallback
            const url = aboutData?.link || 'https://naturalreserves.ucdavis.edu/stebbins-cold-canyon';
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            console.error('Error opening browser:', error);
        }
    };

    // Determine background image source
    const getBackgroundSource = () => {
        const backgroundPath = getImagePath('background');
        
        if (backgroundPath) {
            return { uri: backgroundPath };
        }
        return require("../assets/dev/fallback.jpeg");
    };

    // Use API data or fallback content
    const aboutText = aboutData?.text || "Stebbins Cold Canyon Reserve is part of the University of California Natural Reserve System's protected wildlands network which is dedicated to research, teaching, and public service. This App serves as a guide and information tool to the site. The Map shows your location on the trail and features distances and nature trail markers and descriptions. The Field Guide provides images and information on some of the common species that occur in the reserve. For more detailed information about the history of the site, volunteer opportunities, and species lists, please visit the";
    
    const linkText = aboutData?.link_text || "Reserve Website.";

    // Split the text at the link for better formatting
    const textParts = aboutText.split('please visit the');
    const mainText = textParts[0] + (textParts.length > 1 ? 'please visit the' : '');

    // Key features of the app
    const features = [
        {
            icon: 'map-outline' as keyof typeof Ionicons.glyphMap,
            title: 'Interactive Trail Map',
            description: 'GPS location tracking with trail markers and distances'
        },
        {
            icon: 'book-outline' as keyof typeof Ionicons.glyphMap,
            title: 'Comprehensive Field Guide',
            description: 'Species identification with detailed images and information'
        },
        {
            icon: 'leaf-outline' as keyof typeof Ionicons.glyphMap,
            title: 'Nature Education',
            description: 'Learn about local wildlife, plants, and ecosystems'
        },
        {
            icon: 'school-outline' as keyof typeof Ionicons.glyphMap,
            title: 'Research & Teaching',
            description: 'Supporting UC Natural Reserve System mission'
        }
    ];

    return (
        <ImageBackground 
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.backgroundImage}
        >
            {/* Gradient overlay for better text readability */}
            <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
                style={styles.gradientOverlay}
            />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.titleContainer}>
                        <Ionicons 
                            name="information-circle" 
                            size={36} 
                            color="white" 
                            style={styles.headerIcon}
                        />
                        <Text style={styles.headerTitle}>About Stebbins Reserve</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>UC Natural Reserve System</Text>
                </View>

                {/* Main Content Card */}
                <View style={styles.contentCard}>
                    <Text style={styles.mainText}>{mainText}</Text>
                    
                    {/* Website Link Button */}
                    <TouchableOpacity 
                        style={styles.websiteButton}
                        onPress={handleWebsitePress}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons 
                                name="globe-outline" 
                                size={20} 
                                color="#2d5016" 
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>{linkText}</Text>
                            <Ionicons 
                                name="open-outline" 
                                size={16} 
                                color="#2d5016" 
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>App Features</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <View key={index} style={styles.featureCard}>
                                <View style={styles.featureIconContainer}>
                                    <Ionicons 
                                        name={feature.icon} 
                                        size={24} 
                                        color="#2d5016" 
                                    />
                                </View>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Mission Statement */}
                <View style={styles.missionCard}>
                    <View style={styles.missionHeader}>
                        <Ionicons 
                            name="heart-outline" 
                            size={24} 
                            color="#2d5016" 
                            style={styles.missionIcon}
                        />
                        <Text style={styles.missionTitle}>Our Mission</Text>
                    </View>
                    <Text style={styles.missionText}>
                        Dedicated to research, teaching, and public service through the protection 
                        and stewardship of California's natural heritage.
                    </Text>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    scrollView: {
        flex: 1,
        zIndex: 2,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 80,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerIcon: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    contentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    mainText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 20,
    },
    websiteButton: {
        backgroundColor: 'rgba(45, 80, 22, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(45, 80, 22, 0.2)',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d5016',
        flex: 1,
        textAlign: 'center',
    },
    featuresSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        width: '48%',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(45, 80, 22, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 6,
    },
    featureDescription: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
    },
    missionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    missionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'center',
    },
    missionIcon: {
        marginRight: 8,
    },
    missionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d5016',
    },
    missionText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#555',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});