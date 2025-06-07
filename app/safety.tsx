import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, ImageBackground } from 'react-native';
import { useScreen, SafetyData } from '@/contexts/ApiContext';

const fontSize: number = 20;

export default function SafetyScreen() {
    const { data: safetyData, getImagePath, isLoading, fetch } = useScreen<SafetyData>('safety');

    useEffect(() => {
        fetch();
    }, []);

    const getBackgroundSource = () => {
        const backgroundPath = getImagePath('background');
        
        if (backgroundPath) {
            return { uri: backgroundPath };
        }
        return require("../assets/dev/fallback.jpeg");
    };

    const getSafetyImageSource = () => {
        const imagePath = getImagePath('safety_image');

        if (imagePath) {
            return { uri: imagePath };
        }
        return require("../assets/dev/fallback.jpeg");
    };

    // Function to parse the safety text and create bullet points
    const parseSafetyText = (text: string) => {
        if (!text) return [];
        
        // Split by lines and filter out empty lines
        const lines = text.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            // Remove the leading dash if present and trim whitespace
            const cleanedLine = line.replace(/^-\s*/, '').trim();
            return {
                id: index,
                text: cleanedLine
            };
        });
    };

    if (isLoading && !safetyData) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading safety information...</Text>
            </View>
        );
    }

    const emergencyContact = safetyData?.emergency_contact?.trim() || "FOR EMERGENCIES CONTACT SOLANO COUNTY DISPATCH: 707-421-7096";
     const safetyBulletpoints = safetyData ? parseSafetyText(safetyData.safety_bulletpoints) : [];

    return (
        <ImageBackground 
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.backGroundImage}
            blurRadius={0}>

            <View style={styles.imageContainer}>
                <Image style={styles.imageTop} source={getSafetyImageSource()} />
            </View>
            
            <ScrollView style={styles.textContainer}>

                <Text style={styles.emergencyContact}>{emergencyContact}</Text>

                <View style={styles.infoContainer}>
                    {safetyBulletpoints.map((item) => (
                        <View key={item.id} style={styles.bulletPointContainer}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>{item.text}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backGroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        borderRadius: 15,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        backgroundColor: 'rgb(255, 192, 2)',
        marginTop: 20,
    },
    imageTop: {
        flex: 1,
        width: '100%',
        resizeMode: 'contain',
    },
    textContainer: {
        flex: 1,
        backgroundColor: 'rgb(255, 192, 2)',
        margin: 20,
        paddingRight: 10,
        paddingLeft: 10,
        width: '90%',
        borderRadius: 15,
    },
    infoContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 10,
    },
    bulletPointContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        fontSize: fontSize,
        marginRight: 8,
        marginTop: 2,
        fontWeight: 'bold',
    },
    bulletText: {
        fontSize: fontSize,
        flex: 1,
        lineHeight: 28,
    },
    emergencyContact: {
        textAlign: 'center',
        fontSize: 20,
        color: 'red',
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    safetyTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: 10,
        paddingBottom: 10,
    },
});