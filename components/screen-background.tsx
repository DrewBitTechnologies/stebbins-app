import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet } from 'react-native';

interface ScreenBackgroundProps {
    children: React.ReactNode;
    backgroundSource: any; // ImageSourcePropType
    showScrollIndicator?: boolean;
    paddingTop?: number;
}

export default function ScreenBackground({ 
    children, 
    backgroundSource, 
    showScrollIndicator = false,
    paddingTop = 40
}: ScreenBackgroundProps) {
    return (
        <ImageBackground 
            source={backgroundSource}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            {/* Gradient overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)']}
                style={styles.gradientOverlay}
            />

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop }]}
                showsVerticalScrollIndicator={showScrollIndicator}
            >
                {children}
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
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
});