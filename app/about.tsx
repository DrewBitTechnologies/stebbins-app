import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useScreen, AboutData } from '@/contexts/ApiContext';

export default function AboutScreen() {
    const { data: aboutData, getImagePath } = useScreen<AboutData>('about');

    const handleWebsitePress = async (): Promise<void> => {
        try {
            // Use API link if available, otherwise fallback
            const url = aboutData?.link || 'https://naturalreserves.ucdavis.edu/stebbins-cold-canyon';
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            console.error('Error opening browser:', error);
        }
    };

    // Determine background image source
    const getBackgroundSource = () => {
        const backgroundPath = getImagePath('background');
        
        if (backgroundPath) {
            return { uri: backgroundPath };
        }
        return require("../assets/dev/fallback.jpeg");
    };

    // Use API data or fallback content
    const aboutText = aboutData?.text || "Stebbins Cold Canyon Reserve is part of the University of California Natural Reserve System's protected wildlands network which is dedicated to research, teaching, and public service. This App serves as a guide and information tool to the site. The Map shows your location on the trail and features distances and nature trail markers and descriptions. The Field Guide provides images and information on some of the common species that occur in the reserve. For more detailed information about the history of the site, volunteer opportunities, and species lists, please visit the";
    
    const linkText = aboutData?.link_text || "Reserve Website.";

    return (
        <ImageBackground 
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.backGroundImage}
        >
            <View style={styles.mainContainer}>
                <View style={styles.aboutContainer}>
                    <ScrollView>
                        <View>
                          <Text style={styles.sectionTitleText}>About</Text>
                          <Text style={styles.sectionInfoText}>{aboutText}</Text>
                          <Text style={styles.hyperlink} onPress={handleWebsitePress}>
                              {linkText}
                          </Text>
                      </View>
                    </ScrollView>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backGroundImage: {
        flex: 1,
    },
    mainContainer: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
    },
    aboutContainer: {
        flex: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, .90)',
        width: '100%',
        padding: 20,
        borderRadius: 15,
    },
    sectionTitleText: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: 10,
    },
    sectionInfoText: {
        fontSize: 20,
        lineHeight: 30,
    },
    hyperlink: {
        fontSize: 20,
        color: 'blue',
        textDecorationLine: 'underline',
    },
});