import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useScreen, DonateData } from '@/contexts/ApiContext';

export default function DonateScreen() {

    const { data: donateData, getImagePath } = useScreen<DonateData>('donate');

    const handleDonatePress = async (): Promise<void> => {
        try {
            const url = donateData?.link || 'https://give.ucdavis.edu/Donate/YourGift/STEGIFT';
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            console.error('Error opening browser:', error);
        }
    };

    const getBackgroundSource = () => {
        const backgroundPath = getImagePath('background');

        if(backgroundPath){
            return {uri: backgroundPath}
        }

        return require("@/assets/dev/fallback.jpeg");
    };

    const donateText = donateData?.text || 'Donations to Stebbins Cold Canyon go towards trail maintenance and improvements, enhancing the visitor experience and safety with interpretative signage and messaging, and supporting educational programming.';

    return (
        <ImageBackground 
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.backGroundImage}
            blurRadius={0}
        >
            <ScrollView contentContainerStyle={{ flex: 1 }}>
                <View style={styles.mainContainer}>
                    <View style={styles.donateContainer}>
                        <View style={{ width: '90%' }}>
                            <View style={{ margin: 10 }}>
                                <Text style={styles.donateTitle}>Donate</Text>
                                <Text style={styles.donateText}>{donateText}</Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            onPress={handleDonatePress}
                            style={{ width: '90%' }}
                        >
                            <View style={[styles.donateButton, styles.shadowProp]}>
                                <Text style={styles.donateButtonText}>Donate here</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backGroundImage: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
    },
    donateContainer: {
        flex: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: '100%',
        paddingTop: 10,
        paddingBottom: 20,
        borderRadius: 15,
    },
    donateTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: 10,
    },
    donateText: {
        textAlign: 'left',
        fontSize: 20,
        lineHeight: 30,
    },
    donateButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(243, 196, 54, 1.0)',
        margin: 10,
        padding: 20,
        borderRadius: 15,
    },
    donateButtonText: {
        fontSize: 20,
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: -4, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
});