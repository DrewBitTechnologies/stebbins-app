import { SafetyData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';
import { getImageSource } from '@/utility/image-source';

export default function SafetyScreen() {
    const { data: safetyData, getImagePath, isLoading } = useScreen<SafetyData>('safety');
    
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
       router.replace("emergency" as any)
    };

    if (isLoading && !safetyData) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <Ionicons name="shield" size={48} color="#dc2626" />
                    <Text style={styles.loadingText}>Loading safety information...</Text>
                </View>
            </View>
        );
    }

    const safetyBulletpoints = safetyData ? parseSafetyText(safetyData.safety_bullet_points) : [];

    return (
        <ScreenBackground backgroundSource={getImageSource(safetyData, 'background', getImagePath, require('@/assets/dev/fallback.jpeg'))}>
                <ScreenHeader 
                    icon="shield-checkmark"
                    title="Safety Information"
                    subtitle="Stay safe during your outdoor adventure"
                />

                <Card variant="default" margin="standard" style={{ alignItems: 'center' }}>
                    <Image 
                        style={styles.safetyImage} 
                        source={getImageSource(safetyData, 'safety_image', getImagePath, require('@/assets/dev/fallback.jpeg'))} 
                    />
                </Card>

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

                <Card variant="default" margin="standard">
                    <View style={styles.guidelinesHeader}>
                        <Ionicons name="list" size={24} color="#374151" />
                        <Text style={styles.guidelinesTitle}>Safety Guidelines</Text>
                    </View>
                    
                    <View style={styles.bulletPointsContainer}>
                        {safetyBulletpoints.map((item) => (
                            <View key={item.id} style={styles.bulletPointItem}>
                                <View style={styles.bulletIconContainer}>
                                    <View style={styles.bulletDot} />
                                </View>
                                <Text style={styles.bulletText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>
                </Card>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    safetyImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        resizeMode: 'contain',
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