import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import * as Linking from 'expo-linking';
import { useScreen, EmergencyData } from '@/contexts/ApiContext'

const openPhoneNumber = (phoneNumber: string) => {
  Linking.openURL(`tel:${phoneNumber}`).catch((err) => console.error('An error occurred', err));
};

export default function EmergencyScreen() {

    const { data: emergencyData, backgroundPath } = useScreen<EmergencyData>('emergency');
    const text1 = emergencyData?.contact_1_message || 'For Emergencies contact Solano County Dispatch';
    const phone1 = emergencyData?.contact_1_number || '7074217090';
    const text2 = emergencyData?.contact_2_message || 'IF YOU HAVE NO SERVICE TRY CALLING 911';
    const phone2 = emergencyData?.contact_2_number || '911';

    const getBackgroundSource = () => {
        if(backgroundPath){
            return {uri: backgroundPath};
        }
        return require('@/assets/dev/fallback.jpeg');
    }
    
    return (
        <ImageBackground 
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.backGroundImage}
        >
            <ScrollView contentContainerStyle={{ flex: 1 }}>
                <View style={styles.mainContainer}>
                    <View style={styles.emergencyContainer}>
                        <Text style={styles.emergencyTitle}>Emergency Contact</Text>

                        <Text style={styles.textTitle}>{text1}</Text>

                        <TouchableOpacity 
                            onPress={() => openPhoneNumber(phone1)}
                            style={{ width: '90%' }}
                        >
                            <View style={[styles.button, styles.shadowProp]}>
                                <Text style={styles.buttonText}>
                                    {phone1.slice(0,3) + '-' + phone1.slice(3,6) + '-' + phone1.slice(6)}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.textTitle}>{text2}</Text>

                        <TouchableOpacity 
                            onPress={() => openPhoneNumber(phone2)}
                            style={{ width: '90%' }}
                        >
                            <View style={[styles.button, styles.shadowProp]}>
                                <Text style={styles.buttonText}>
                                    {phone2}
                                </Text>
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
    },
    emergencyContainer: {
        flex: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingTop: 10,
        paddingBottom: 20,
        borderRadius: 15,
        width: '90%',
    },
    buttonText: {
        fontSize: 20,
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(243, 196, 54, 1.0)',
        margin: 10,
        padding: 20,
        borderRadius: 15,
    },
    emergencyTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: 10,
        paddingBottom: 10,
    },
    textTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingBottom: 10,
        paddingTop: 10,
        textTransform: 'uppercase',
        textAlign: 'center',
        width: '90%',
    },
    sectionContainer: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: -4, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
});