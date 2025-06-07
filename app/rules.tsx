import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, ImageBackground, ListRenderItem } from 'react-native';
import { useScreen, RulesData, Rule } from '@/contexts/ApiContext';

export default function RulesScreen() {
    const { data: rulesData, getImagePath } = useScreen<RulesData>('rules');

    const getBackgroundSource = () => {
        const backgroundPath = getImagePath('background');
        
        if (backgroundPath) {
            return { uri: backgroundPath };
        }
        return require("../assets/dev/fallback.jpeg");
    };

    const getRulesImageSource = () => {
        const imagePath = getImagePath('rules_image');

        if (imagePath) {
            return { uri: imagePath };
        }
        return require("../assets/dev/fallback.jpeg");
    };

    const getIconSource = (iconName: string) => {
        const iconPath = getImagePath(iconName);

        if (iconPath) {
            return { uri: iconPath };
        }
       
        return require("../assets/dev/fallback.jpeg");
    };

    const renderRule: ListRenderItem<Rule> = ({ item }) => (
        <View style={styles.rules}>
            <Image source={getIconSource(item.icon)} style={styles.icon} />
            <Text style={styles.iconText}>{item.text}</Text>
        </View>
    );

    return (
        <ImageBackground 
            source={getBackgroundSource()}
            resizeMode="cover"
            style={styles.backGroundImage}
            blurRadius={0}
        >
            <View style={styles.mainContainer}>
                <View style={styles.rulesContainer}>
                    <Image style={styles.rulesImage} source={getRulesImageSource()} />
                </View>

                <FlatList
                    style={styles.list}
                    data={rulesData?.rules || []}
                    renderItem={renderRule}
                    keyExtractor={(item) => item.id.toString()}
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backGroundImage: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rulesContainer: {
        flex: 1,
        borderRadius: 15,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        backgroundColor: 'white',
        marginBottom: 20,
        marginTop: 20,
    },
    rulesImage: {
        resizeMode: 'contain',
        width: '100%',
        flex: 1,
    },
    rulesTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    list: {
        flex: 1,
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 15,
        marginBottom: 20,
        marginRight: 20,
        marginLeft: 20,
    },
    icon: {
        width: 70,
        height: 70,
    },
    iconText: {
        textAlign: 'left',
        fontSize: 20,
        lineHeight: 30,
        width: '90%',
    },
    rules: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        width: '90%',
    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: -4, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
});