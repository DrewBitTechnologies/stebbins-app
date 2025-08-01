import { RulesData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';

export default function RulesScreen() {
    const { data: rulesData, getImagePath } = useScreen<RulesData>('rules');

    const getBackgroundSource = () => {
        const backgroundId = rulesData?.background;
        if (backgroundId) {
            const localUri = getImagePath(backgroundId);
            if (localUri) {
                return { uri: localUri };
            }
        }
        return require('@/assets/dev/fallback.jpeg');
    };

    const getRulesImageSource = () => {
        const imageId = rulesData?.rules_image;
        if (imageId) {
            const localUri = getImagePath(imageId);
            if (localUri) {
                return { uri: localUri };
            }
        }
        return require('@/assets/dev/fallback.jpeg');
    };

    return (
        <ImageBackground
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.container}
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
                style={styles.gradientOverlay}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ScreenHeader 
                    icon="document-text"
                    title="Trail Rules"
                    subtitle="Please follow these guidelines to help preserve the reserve"
                />

                <Card variant="default" margin="horizontal" style={{ alignItems: 'center' }}>
                    <Image style={styles.rulesImage} source={getRulesImageSource()} />
                </Card>

                <Card variant="default" margin="horizontal">
                    <View style={styles.rulesHeader}>
                        <Ionicons name="checkmark-circle-outline" size={24} color="#374151" />
                        <Text style={styles.rulesHeaderTitle}>Guidelines to Follow</Text>
                    </View>

                    <View style={styles.rulesContainer}>
                        {rulesData?.rules?.map((item, index) => {
                            const iconUri = item.icon ? getImagePath(item.icon) : null;
                            return (
                                <View key={item.id} style={[
                                    styles.ruleItem,
                                    { marginBottom: index === (rulesData?.rules?.length || 0) - 1 ? 0 : 20 }
                                ]}>
                                    <View style={styles.ruleIconContainer}>
                                        {iconUri && <Image source={{ uri: iconUri }} style={styles.ruleIcon} />}
                                    </View>
                                    <Text style={styles.ruleText}>{item.text}</Text>
                                </View>
                            );
                        }) || []}
                    </View>
                </Card>

                <Card variant="default" margin="horizontal">
                    <View style={styles.footerContent}>
                        <Ionicons name="heart" size={24} color="#dc2626" />
                        <Text style={styles.footerText}>
                            Thank you for helping us protect and preserve this natural space for future generations.
                        </Text>
                    </View>
                </Card>
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
    rulesImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        resizeMode: 'contain',
    },
    rulesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    rulesHeaderTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 12,
    },
    rulesContainer: {
        gap: 20,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    ruleIconContainer: {
        width: 85,
        height: 85,
        borderRadius: 45,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        flexShrink: 0,
    },
    ruleIcon: {
        width: 75,
        height: 75,
        resizeMode: 'cover',
    },
    ruleText: {
        fontSize: 18,
        
        lineHeight: 24,
        color: '#374151',
        flex: 1,
        marginTop: 2,
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    footerText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#374151',
        flex: 1,
        marginLeft: 12,
        fontStyle: 'italic',
    },
    ruleCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    ruleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
});