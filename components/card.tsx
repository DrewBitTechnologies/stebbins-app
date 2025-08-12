import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'compact' | 'navigation' | 'emergency' | 'warning' | 'transparent';
    margin?: 'standard' | 'horizontal' | 'none';
    style?: ViewStyle;
}

export default function Card({ 
    children, 
    variant = 'default', 
    margin = 'standard',
    style 
}: CardProps) {
    const getCardStyle = () => {
        const baseStyle: ViewStyle[] = [styles.baseCard];
        
        switch (variant) {
            case 'compact':
                baseStyle.push(styles.compactCard);
                break;
            case 'navigation':
                baseStyle.push(styles.navigationCard);
                break;
            case 'emergency':
                baseStyle.push(styles.emergencyCard);
                break;
            case 'warning':
                baseStyle.push(styles.warningCard);
                break;
            case 'transparent':
                baseStyle.push(styles.transparentCard);
                break;
            default:
                baseStyle.push(styles.defaultCard);
        }
        
        // Margin styles
        switch (margin) {
            case 'horizontal':
                baseStyle.push(styles.horizontalMargin);
                break;
            case 'none':
                baseStyle.push(styles.noMargin);
                break;
            default:
                baseStyle.push(styles.standardMargin);
        }
        
        // Custom style override
        if (style) {
            baseStyle.push(style);
        }
        
        return baseStyle;
    };

    return (
        <View style={getCardStyle()}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    // Base card with common properties
    baseCard: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    
    // Variant styles
    defaultCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 20,
    },
    
    compactCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        padding: 16,
        borderRadius: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    
    navigationCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    
    emergencyCard: {
        backgroundColor: '#e63946',
        padding: 20,
        shadowOpacity: 0.25,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    
    warningCard: {
        backgroundColor: 'rgba(255, 191, 0, 0.85)',
        padding: 16,
        shadowOpacity: 0.2,
        shadowRadius: 5,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    
    transparentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 16,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    
    // Margin styles
    standardMargin: {
        marginBottom: 20,
    },
    
    horizontalMargin: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    
    noMargin: {
        margin: 0,
    },
});