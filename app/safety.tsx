import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image, ImageBackground } from 'react-native';

interface SafetyInfoItem {
    info: string;
}

interface SafetyInfoData {
    info_group: SafetyInfoItem[];
}

const fontSize: number = 20;

export default function SafetyInfoScreen() {
    return (
        <ImageBackground 
            source={require("../assets/dev/fallback.jpeg")}
            resizeMode="cover"
            style={styles.backGroundImage}
            blurRadius={0}
        >
            <View style={styles.imageContainer}>
                <Image style={styles.imageTop} source={require("../assets/dev/fallback.jpeg")} />
            </View>
            
            <ScrollView style={styles.textContainer}>
                <View style={styles.infoContainer}>                

                    <Text style={styles.emergencyContact}>
                        FOR EMERGENCIES CONTACT SOLANO COUNTY DISPATCH: 707-421-7096
                    </Text>

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
    emergencyContact: {
        textAlign: 'center',
        fontSize: 20,
        color: 'red',
        fontWeight: 'bold',
    },
    safetyTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: 10,
        paddingBottom: 10,
    },
});