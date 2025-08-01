import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ScreenHeaderProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
}

export default function ScreenHeader({ icon, title, subtitle }: ScreenHeaderProps) {
    return (
        <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
                <Ionicons 
                    name={icon} 
                    size={36} 
                    color="white" 
                    style={styles.headerIcon}
                />
                <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
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
});