import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './card';
import { ColorPalette } from '@/assets/dev/color_palette';

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'compact' | 'default';
}

export default function DetailModal({ 
  visible, 
  onClose, 
  children, 
  variant = 'default' 
}: DetailModalProps) {
  const BLUE = '#022851';
  
  return (
    <Modal 
      animationType="fade" 
      transparent={true} 
      visible={visible} 
      onRequestClose={onClose}
    >
      <View style={styles.outerContainer}>
        <View style={styles.modalContainer}>
          <Card 
            variant="default" 
            margin="none" 
            style={variant === 'compact' ? styles.compactModal : styles.defaultModal}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </Card>
        </View>
        
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
        >
          <Ionicons name="close" size={28} color={ColorPalette.primary_blue} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    maxHeight: '80%',
  },
  defaultModal: {
    width: '100%',
    maxHeight: '100%',
  },
  compactModal: {
    width: '100%',
    maxHeight: '60%',
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ColorPalette.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: ColorPalette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});