import { RulesData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';
import { getImageSource } from '@/utility/image-source';

export default function RulesScreen() {
    const { data: rulesData, getImagePath } = useScreen<RulesData>('rules');

    return (
        <ScreenBackground backgroundSource={getImageSource(rulesData, 'background', getImagePath, require('@/assets/dev/fallback.jpeg'))}>
            <ScreenHeader 
                icon="trail-sign"
                title="Trail Rules"
                subtitle="Please follow these guidelines to help preserve the reserve"
            />

            <Card variant="default" margin="none" style={{ alignItems: 'center', marginBottom: 20 }}>
                <Image 
                    style={styles.rulesImage} 
                    source={getImageSource(rulesData, 'rules_image', getImagePath, require('@/assets/dev/fallback.jpeg'))} 
                />
            </Card>

            <Card variant="default" margin="none" style={{ marginBottom: 20 }}>
                <View style={styles.rulesHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#374151" />
                    <Text style={styles.rulesHeaderTitle}>Guidelines to Follow</Text>
                </View>

                <View style={styles.rulesContainer}>
                    {rulesData?.rules?.map((item, index) => (
                        <View key={item.id} style={[
                            styles.ruleItem,
                            { marginBottom: index === (rulesData?.rules?.length || 0) - 1 ? 0 : 20 }
                        ]}>
                            <View style={styles.ruleIconContainer}>
                                {getImageSource(item, 'icon', getImagePath) && (
                                    <Image 
                                        source={getImageSource(item, 'icon', getImagePath)}
                                        style={styles.ruleIcon} 
                                    />
                                )}
                            </View>
                            <Text style={styles.ruleText}>{item.text}</Text>
                        </View>
                    )) || []}
                </View>
            </Card>

            <Card variant="default" margin="none">
                <View style={styles.footerContent}>
                    <Ionicons name="heart" size={24} color="#dc2626" />
                    <Text style={styles.footerText}>
                        Thank you for helping us protect and preserve this natural space for future generations.
                    </Text>
                </View>
            </Card>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
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