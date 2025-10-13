import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ScreenHeaderProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
}

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
    return (
        <View style={styles.headerSection}>
            <Text style={[styles.headerTitle, subtitle && styles.headerTitleWithSubtitle]}>{title}</Text>
            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    headerSection: {
        alignItems: 'center',
        marginBottom: 35,
        paddingHorizontal: 20,
    },
    headerIcon: {
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    headerTitleWithSubtitle: {
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});