import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BLUE = '#022851';

export default function InfoModalContent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Icon Descriptions</Text>
      
      <View style={styles.iconRow}>
        <Ionicons name="cloud-download-outline" size={25} color={BLUE} style={styles.icon} />
        <Text style={styles.buttonText}>
          Deletes and redownloads the offline map to ensure all trail data is up to date.
        </Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="contract-outline" size={25} color={BLUE} style={styles.icon} />
        <Text style={styles.buttonText}>
          Resets the map view to the initial zoom level.
        </Text>
      </View>
      
      <View style={styles.iconRow}>
        <Ionicons name="help-circle-outline" size={25} color={BLUE} style={styles.icon} />
        <Text style={styles.buttonText}>
          Opens this help screen.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20, // Space for close button
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  icon: {
    marginRight: 20,
    width: 25,
    textAlign: 'center',
  },
  buttonText: {
    lineHeight: 25,
    fontSize: 16,
    flex: 1,
    color: '#444',
  },
});