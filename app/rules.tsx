import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, ScrollView } from 'react-native';
import { useScreen, RulesData } from '@/contexts/ApiContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function RulesScreen() {
    const { data: rulesData } = useScreen<RulesData>('rules');

    const getBackgroundSource = () => {
        const backgroundPath = rulesData?.background;
        return backgroundPath ? { uri: backgroundPath } : require("../assets/dev/fallback.jpeg");
    };

    const getRulesImageSource = () => {
        const imagePath = rulesData?.rules_image;
        return imagePath ? { uri: imagePath } : require("../assets/dev/fallback.jpeg");
    };

    return (
        <ImageBackground 
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.container}
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
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.titleContainer}>
                        <Ionicons 
                            name="document-text"
                            size={36} 
                            color="white" 
                            style={styles.headerIcon}
                        />
                        <Text style={styles.headerTitle}>Trail Rules</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>Please follow these guidelines to help preserve the reserve</Text>
                </View>

                

                {/* Rules Image Card */}
                <View style={styles.imageCard}>
                    <Image style={styles.rulesImage} source={getRulesImageSource()} />
                </View>

                {/* Rules List Card */}
                <View style={styles.rulesListCard}>
                    <View style={styles.rulesHeader}>
                        <Ionicons name="checkmark-circle-outline" size={24} color="#374151" />
                        <Text style={styles.rulesHeaderTitle}>Guidelines to Follow</Text>
                    </View>
                    
                    <View style={styles.rulesContainer}>
                        {rulesData?.rules?.map((item, index) => (
                            <View key={item.id} style={[
                                styles.ruleItem,
                                { marginBottom: index === (rulesData?.rules?.length || 0) - 1 ? 0 : 20 }
                            ]}>
                                <View style={styles.ruleIconContainer}>
                                    {/* The item.icon property now holds the local URI */}
                                    <Image source={{ uri: item.icon }} style={styles.ruleIcon} />
                                </View>
                                <Text style={styles.ruleText}>{item.text}</Text>
                            </View>
                        )) || []}
                    </View>
                </View>

                {/* Footer Message */}
                <View style={styles.footerCard}>
                    <View style={styles.footerContent}>
                        <Ionicons name="heart" size={24} color="#dc2626" />
                        <Text style={styles.footerText}>
                            Thank you for helping us protect and preserve this natural space for future generations.
                        </Text>
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
    rulesImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    rulesListCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
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
    footerCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
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