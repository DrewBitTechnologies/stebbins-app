import { EmergencyData, useScreen } from '@/contexts/api';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '@/components/screen-header';
import Card from '@/components/card';
import ScreenBackground from '@/components/screen-background';
import Button from '@/components/button';
import { getBackgroundSource } from '@/utility/background-source';

const openPhoneNumber = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => console.error('An error occurred', err));
};

export default function EmergencyScreen() {
    const { data: emergencyData, getImagePath } = useScreen<EmergencyData>('emergency');
    const text1 = emergencyData?.contact_1_message || 'For Emergencies contact Solano County Dispatch';
    const phone1 = emergencyData?.contact_1_number || '7074217090';
    const text2 = emergencyData?.contact_2_message || 'IF YOU HAVE NO SERVICE TRY CALLING 911';
    const phone2 = emergencyData?.contact_2_number || '911';

    const formatPhoneNumber = (phone: string) => {
        if (phone === '911') return phone;
        if (phone.length === 10) {
            return `${phone.slice(0,3)}-${phone.slice(3,6)}-${phone.slice(6)}`;
        }
        return phone;
    };

    const emergencyContacts = [
        {
            message: text1,
            phone: phone1,
            icon: 'call-outline' as keyof typeof Ionicons.glyphMap,
            priority: 'primary' as const,
            description: 'Primary emergency contact for the reserve area'
        },
        {
            message: text2,
            phone: phone2,
            icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
            priority: 'critical' as const,
            description: 'Emergency services - use when no cell service available'
        }
    ];

    return (
        <ScreenBackground backgroundSource={getBackgroundSource(emergencyData, getImagePath)}>
            <ScreenHeader 
                icon="alert-circle"
                title="Emergency Contacts"
                subtitle="Contacts for trail emergencies"
            />

            {/* Safety Notice */}
            <View style={styles.safetyNotice}>
                <View style={styles.noticeHeader}>
                    <Ionicons 
                        name="information-circle" 
                        size={20} 
                        color="white" 
                        style={styles.noticeIcon}
                    />
                    <Text style={styles.noticeTitle}>Safety Reminder</Text>
                </View>
                <Text style={styles.noticeText}>
                    Cell service is limited in the reserve. Inform others of your hiking plans.
                </Text>
            </View>

            {/* Emergency Contacts */}
            {emergencyContacts.map((contact, index) => (
                <Card 
                    key={index} 
                    variant="default"
                    margin="none"
                    style={{
                        marginBottom: 20,
                        ...(contact.priority === 'critical' ? styles.criticalCard : {})
                    }}
                >
                    <View style={styles.contactHeader}>
                        <View style={[
                            styles.contactIconContainer,
                            contact.priority === 'critical' && styles.criticalIconContainer
                        ]}>
                            <Ionicons 
                                name={contact.icon} 
                                size={24} 
                                color={contact.priority === 'critical' ? '#ff4444' : '#2d5016'} 
                            />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={[
                                styles.contactMessage,
                                contact.priority === 'critical' && styles.criticalMessage
                            ]}>
                                {contact.message}
                            </Text>
                            <Text style={styles.contactDescription}>
                                {contact.description}
                            </Text>
                        </View>
                    </View>

                    <Button
                        title={formatPhoneNumber(contact.phone)}
                        onPress={() => openPhoneNumber(contact.phone)}
                        icon="call"
                        backgroundColor={contact.priority === 'critical' ? ['#ff4444', '#cc0000'] as const : ['#2d5016', '#1a3b0f'] as const}
                        textColor="white"
                        iconColor="white"
                    />
                </Card>
            ))}
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    safetyNotice: {
        backgroundColor: 'rgba(255, 107, 53, 0.75)',
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 53, 0.90)',
        padding: 16,
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noticeIcon: {
        marginRight: 8,
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    noticeText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
    },
    criticalCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#ff4444',
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    contactIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(45, 80, 22, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    criticalIconContainer: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
    },
    contactInfo: {
        flex: 1,
    },
    contactMessage: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    criticalMessage: {
        color: '#cc0000',
    },
    contactDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    tipsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'center',
    },
    tipsIcon: {
        marginRight: 8,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d5016',
    },
    tipsList: {
        gap: 8,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkIcon: {
        marginRight: 8,
    },
    tipText: {
        fontSize: 14,
        color: '#555',
        flex: 1,
    },
});