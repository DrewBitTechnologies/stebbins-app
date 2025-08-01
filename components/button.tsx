import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    backgroundColor?: string[];
    textColor?: string;
    iconColor?: string;
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    loadingIcon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
    size?: 'small' | 'medium' | 'large';
}

export default function Button({
    title,
    onPress,
    icon,
    backgroundColor = ['#f3c436', '#e6b429'],
    textColor = '#1a1a1a',
    iconColor,
    disabled = false,
    loading = false,
    loadingText,
    loadingIcon = 'hourglass',
    style,
    size = 'medium'
}: ButtonProps) {
    const isDisabled = disabled || loading;
    const displayText = loading && loadingText ? loadingText : title;
    const displayIcon = loading ? loadingIcon : icon;
    const finalIconColor = iconColor || textColor;
    
    const disabledColors = ['#cccccc', '#999999'];
    const gradientColors = isDisabled ? disabledColors : backgroundColor;
    
    const sizeStyles = {
        small: {
            paddingVertical: 12,
            paddingHorizontal: 20,
            fontSize: 16,
            iconSize: 18
        },
        medium: {
            paddingVertical: 16,
            paddingHorizontal: 24,
            fontSize: 18,
            iconSize: 20
        },
        large: {
            paddingVertical: 20,
            paddingHorizontal: 32,
            fontSize: 20,
            iconSize: 22
        }
    };

    const currentSize = sizeStyles[size];

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.button,
                isDisabled && styles.buttonDisabled,
                style
            ]}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={gradientColors}
                style={styles.gradient}
            >
                <View style={[
                    styles.content,
                    {
                        paddingVertical: currentSize.paddingVertical,
                        paddingHorizontal: currentSize.paddingHorizontal
                    }
                ]}>
                    {displayIcon && (
                        <Ionicons
                            name={displayIcon}
                            size={currentSize.iconSize}
                            color={finalIconColor}
                            style={styles.icon}
                        />
                    )}
                    <Text
                        style={[
                            styles.text,
                            {
                                fontSize: currentSize.fontSize,
                                color: textColor
                            }
                        ]}
                    >
                        {displayText}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    buttonDisabled: {
        shadowOpacity: 0.1,
    },
    gradient: {
        borderRadius: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontWeight: 'bold',
    },
});