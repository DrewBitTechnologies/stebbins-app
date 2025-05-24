import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { makePhoneCall } from '../utility/linking';

interface DispatchInfo {
    text: string;
    phone: string;
}

interface EmergencyData {
    dispatch: DispatchInfo;
}

export default function EmergencyScreen() {

    const handleDispatchCall = (): void => {
        makePhoneCall('(707)421-7090');
    };

    const handle911Call = (): void => {
        makePhoneCall('911');
    };

    return (
        <ImageBackground 
            source={require('../assets/dev/fallback.jpeg')}
            resizeMode="cover"
            style={styles.backGroundImage}
        >
            <ScrollView contentContainerStyle={{ flex: 1 }}>
                <View style={styles.mainContainer}>
                    <View style={styles.emergencyContainer}>
                        <Text style={styles.emergencyTitle}>Emergency Contact</Text>

                        <Text style={styles.textTitle}>
                            For Emergencies contact Solano County Dispatch
                        </Text>

                        <TouchableOpacity 
                            onPress={handleDispatchCall}
                            style={{ width: '90%' }}
                        >
                            <View style={[styles.button, styles.shadowProp]}>
                                <Text style={styles.buttonText}>
                                    (707)421-7090
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.textTitle}>
                            IF YOU HAVE NO SERVICE TRY CALLING 911
                        </Text>

                        <TouchableOpacity 
                            onPress={handle911Call}
                            style={{ width: '90%' }}
                        >
                            <View style={[styles.button, styles.shadowProp]}>
                                <Text style={styles.buttonText}>911</Text>
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