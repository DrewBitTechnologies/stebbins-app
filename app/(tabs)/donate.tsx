import { DonateData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DonateScreen() {
    const { data: donateData, getImagePath} = useScreen<DonateData>('donate');

    const handleDonatePress = async (): Promise<void> => {
        try {
            const url = donateData?.link || 'https://give.ucdavis.edu/Donate/YourGift/STEGIFT';
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            console.error('Error opening browser:', error);
        }
    };

    const getBackgroundSource = () => {
    const backgroundId = donateData?.background;

    if (backgroundId) {
      
      const localUri = getImagePath(backgroundId);
      if (localUri) {
        return { uri: localUri };
      }
    }

    return require('@/assets/dev/fallback.jpeg');
  };

    const donateText = donateData?.text || 'Donations to Stebbins Cold Canyon go towards trail maintenance and improvements, enhancing the visitor experience and safety with interpretative signage and messaging, and supporting educational programming.';

    const donationImpacts = [
        {
            icon: 'trail-sign-outline' as keyof typeof Ionicons.glyphMap,
            title: 'Trail Maintenance',
            description: 'Keep trails safe and accessible for all visitors'
        },
        {
            icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
            title: 'Educational Signage',
            description: 'Interpretive signs that enhance the visitor experience'
        },
        {
            icon: 'school-outline' as keyof typeof Ionicons.glyphMap,
            title: 'Educational Programs',
            description: 'Support learning opportunities for all ages'
        },
        {
            icon: 'shield-checkmark-outline' as keyof typeof Ionicons.glyphMap,
            title: 'Safety Improvements',
            description: 'Enhanced safety measures and emergency preparedness'
        }
    ];

    return (
        <ImageBackground 
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.backgroundImage}
        >
            {/* Gradient overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
                style={styles.gradientOverlay}
            />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.headerSection}>
                    <View style={styles.titleContainer}>
                        <Ionicons 
                            name="heart" 
                            size={36} 
                            color="white" 
                            style={styles.headerIcon}
                        />
                        <Text style={styles.headerTitle}>Support Our Mission</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>Help preserve and enhance Stebbins for future generations</Text>
                </View>

                {/* Main Donation Card */}
                <View style={styles.donationCard}>
                    <View style={styles.donationHeader}>
                        <View style={styles.donationIconContainer}>
                            <Ionicons 
                                name="leaf" 
                                size={28} 
                                color="#2d5016" 
                            />
                        </View>
                        <Text style={styles.donationTitle}>Make a Difference</Text>
                    </View>

                    <Text style={styles.donationText}>
                        {donateText}
                    </Text>

                    <TouchableOpacity 
                        onPress={handleDonatePress}
                        style={styles.donateButton}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#f3c436', '#e6b429']}
                            style={styles.buttonGradient}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons 
                                    name="card" 
                                    size={20} 
                                    color="#1a1a1a" 
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.buttonText}>Donate Now</Text>
                                <Ionicons 
                                    name="arrow-forward" 
                                    size={20} 
                                    color="#1a1a1a" 
                                />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Impact Section */}
                <View style={styles.impactSection}>
                    <View style={styles.impactHeader}>
                        <Ionicons 
                            name="trending-up" 
                            size={24} 
                            color="white" 
                            style={styles.impactIcon}
                        />
                        <Text style={styles.impactTitle}>Your Impact</Text>
                    </View>
                    <Text style={styles.impactSubtitle}>
                        See how your donation helps preserve this natural treasure
                    </Text>
                </View>

                {/* Impact Cards */}
                <View style={styles.impactCardsContainer}>
                    {donationImpacts.map((impact, index) => (
                        <View key={index} style={styles.impactCard}>
                            <View style={styles.impactCardHeader}>
                                <View style={styles.impactCardIconContainer}>
                                    <Ionicons 
                                        name={impact.icon} 
                                        size={24} 
                                        color="#2d5016" 
                                    />
                                </View>
                                <Text style={styles.impactCardTitle}>{impact.title}</Text>
                            </View>
                            <Text style={styles.impactCardDescription}>
                                {impact.description}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Thank You Note */}
                <View style={styles.thankYouCard}>
                    <View style={styles.thankYouHeader}>
                        <Ionicons 
                            name="people" 
                            size={24} 
                            color="#2d5016" 
                            style={styles.thankYouIcon}
                        />
                        <Text style={styles.thankYouTitle}>Thank You</Text>
                    </View>
                    <Text style={styles.thankYouText}>
                        Every donation, no matter the size, helps us maintain and improve this special place. 
                        Your support ensures that Stebbins Cold Canyon remains a treasured destination for education, 
                        recreation, and conservation.
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
        marginBottom: 24,
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
    donationCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 24,
        marginBottom: 30,
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
    donationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    donationIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(45, 80, 22, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    donationTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    donationText: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
        marginBottom: 24,
    },
    donateButton: {
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    buttonGradient: {
        borderRadius: 12,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginRight: 8,
    },
    impactSection: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    impactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    impactIcon: {
        marginRight: 8,
    },
    impactTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    impactSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    impactCardsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    impactCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#2d5016',
    },
    impactCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    impactCardIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(45, 80, 22, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    impactCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    impactCardDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
        marginLeft: 48,
    },
    thankYouCard: {
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
    thankYouHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'center',
    },
    thankYouIcon: {
        marginRight: 8,
    },
    thankYouTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d5016',
    },
    thankYouText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        textAlign: 'center',
    },
});