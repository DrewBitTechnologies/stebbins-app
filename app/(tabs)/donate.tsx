import { DonateData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';
import Button from '@/components/button';
import { getImageSource } from '@/utility/image-source';

export default function DonateScreen() {
    const { data: donateData, getImagePath} = useScreen<DonateData>('donate');

    const handleDonatePress = async (): Promise<void> => {
        try {
            const url = donateData?.link || 'https://give.ucdavis.edu/Donate/YourGift/STEGIFT';
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            console.error('Error opening browser:', error);
        }
    };

    const donateText = donateData?.text || 'Donations to Stebbins Cold Canyon go towards trail maintenance and improvements, enhancing the visitor experience and safety with interpretative signage and messaging, and supporting educational programming.';

    return (
        <ScreenBackground backgroundSource={getImageSource(donateData, 'background', getImagePath, require('@/assets/dev/fallback.jpeg'))}>
            <ScreenHeader 
                icon="heart"
                title="Support Our Mission"
                subtitle="Help preserve and enhance Stebbins for future generations"
            />

            <Card variant="default" margin="none" style={{ marginBottom: 20 }}>
                <View style={styles.donationHeader}>
                    <View style={styles.donationIconContainer}>
                        <Ionicons 
                            name="leaf" 
                            size={28} 
                            color="#2d5016" 
                        />
                    </View>
                    <Text style={styles.donationTitle}>Make a Difference</Text>
                </View>

                <Text style={styles.donationText}>
                    {donateText}
                </Text>

                <Button
                    title="Donate Now"
                    onPress={handleDonatePress}
                    icon="wallet"
                />
            </Card>

            <Card variant="default" margin="none">
                <View style={styles.thankYouHeader}>
                    <Ionicons 
                        name="people" 
                        size={24} 
                        color="#2d5016" 
                        style={styles.thankYouIcon}
                    />
                    <Text style={styles.thankYouTitle}>Thank You</Text>
                </View>
                <Text style={styles.thankYouText}>
                    Every donation, no matter the size, helps us maintain and improve this special place. 
                    Your support ensures that Stebbins Cold Canyon remains a treasured destination for education, 
                    recreation, and conservation.
                </Text>
            </Card>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    donationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    donationIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(45, 80, 22, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    donationTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    donationText: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
        marginBottom: 24,
    },
    thankYouHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'center',
    },
    thankYouIcon: {
        marginRight: 8,
    },
    thankYouTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d5016',
    },
    thankYouText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        textAlign: 'center',
    },
});