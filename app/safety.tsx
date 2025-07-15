import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, ImageBackground, TouchableOpacity, Linking } from 'react-native';
import { useScreen, SafetyData } from '@/contexts/ApiContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function SafetyScreen() {
    const { data: safetyData, getImagePath, isLoading, fetch } = useScreen<SafetyData>('safety');

    const getBackgroundSource = () => {
        const backgroundPath = safetyData?.background;
        return backgroundPath ? { uri: backgroundPath } : require("../assets/dev/fallback.jpeg");
    };
    
    const getSafetyImageSource = () => {
        const imagePath = safetyData?.safety_image;
        return imagePath ? { uri: imagePath } : require("../assets/dev/fallback.jpeg");
    };

    // Function to parse the safety text and create bullet points
    const parseSafetyText = (text: string) => {
        if (!text) return [];
        
        const lines = text.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            const cleanedLine = line.replace(/^-\s*/, '').trim();
            return {
                id: index,
                text: cleanedLine
            };
        });
    };

    const navigateToEmergency = () => {
       router.push("emergency" as any)
    };

    if (isLoading && !safetyData) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <Ionicons name="shield-outline" size={48} color="#dc2626" />
                    <Text style={styles.loadingText}>Loading safety information...</Text>
                </View>
            </View>
        );
    }

    const safetyBulletpoints = safetyData ? parseSafetyText(safetyData.safety_bulletpoints) : [];

    return (
        <ImageBackground 
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.container}>
            
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
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.titleContainer}>
                        <Ionicons 
                            name="shield-checkmark" 
                            size={36} 
                            color="white" 
                            style={styles.headerIcon}
                        />
                        <Text style={styles.headerTitle}>Safety Information</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>Stay safe during your outdoor adventure</Text>
                </View>

                {/* Safety Image Card */}
                <View style={styles.imageCard}>
                    <Image style={styles.safetyImage} source={getSafetyImageSource()} />
                </View>

                {/* Emergency Contact Card */}
                <TouchableOpacity 
                    style={styles.emergencyCard}
                    onPress={navigateToEmergency}
                    activeOpacity={0.8}
                >
                    <View style={styles.emergencyContent}>
                        <View style={styles.emergencyIconContainer}>
                            <Ionicons name="call" size={24} color="white" />
                        </View>
                        <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
                        <Ionicons name="chevron-forward" size={24} color="white" />
                    </View>
                </TouchableOpacity>

                {/* Safety Guidelines Card */}
                <View style={styles.guidelinesCard}>
                    <View style={styles.guidelinesHeader}>
                        <Ionicons name="list-outline" size={24} color="#374151" />
                        <Text style={styles.guidelinesTitle}>Safety Guidelines</Text>
                    </View>
                    
                    <View style={styles.bulletPointsContainer}>
                        {safetyBulletpoints.map((item, index) => (
                            <View key={item.id} style={styles.bulletPointItem}>
                                <View style={styles.bulletIconContainer}>
                                    <View style={styles.bulletDot} />
                                </View>
                                <Text style={styles.bulletText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
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
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
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
    imageCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        alignItems: 'center',
    },
    safetyImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    emergencyCard: {
        backgroundColor: '#dc2626',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    emergencyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    emergencyIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emergencyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    emergencySubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    emergencyNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
    emergencyDescription: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    guidelinesCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    guidelinesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    guidelinesTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 12,
    },
    bulletPointsContainer: {
        gap: 16,
    },
    bulletPointItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    bulletDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#dc2626',
    },
    bulletText: {
        fontSize: 16,
        flex: 1,
        lineHeight: 24,
        color: '#374151',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingContent: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 18,
        color: '#64748b',
        marginTop: 16,
        textAlign: 'center',
    },
});