import { AboutData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';

export default function AboutScreen() {
    const { data: aboutData, getImagePath } = useScreen<AboutData>('about');

    const handleWebsitePress = async (): Promise<void> => {
        try {
            const url = aboutData?.link || 'https://naturalreserves.ucdavis.edu/stebbins-cold-canyon';
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            console.error('Error opening browser:', error);
        }
    };

    const getBackgroundSource = () => {
    const backgroundId = aboutData?.background;

    if (backgroundId) {
      
      const localUri = getImagePath(backgroundId);
      if (localUri) {
        return { uri: localUri };
      }
    }

    return require('@/assets/dev/fallback.jpeg');
  };

    const aboutText = aboutData?.text || "Stebbins Cold Canyon Reserve is part of the University of California Natural Reserve System's protected wildlands network which is dedicated to research, teaching, and public service. This App serves as a guide and information tool to the site. The Map shows your location on the trail and features distances and nature trail markers and descriptions. The Field Guide provides images and information on some of the common species that occur in the reserve. For more detailed information about the history of the site, volunteer opportunities, and species lists, please visit the";
    
    const linkText = aboutData?.link_text || "Reserve Website.";

    const textParts = aboutText.split('please visit the');
    const mainText = textParts[0] + (textParts.length > 1 ? 'please visit the' : '');


    return (
        <ScreenBackground backgroundSource={getBackgroundSource()}>
            <ScreenHeader 
                icon="information-circle"
                title="About Stebbins Reserve"
                subtitle="UC Natural Reserve System"
            />

            <Card variant="default" margin="none" style={{ marginBottom: 20 }}>
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
            </Card>

            <Card variant="default" margin="none">
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
            </Card>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
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