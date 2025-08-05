import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './card';

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
      animationType="slide" 
      transparent={true} 
      visible={visible} 
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Card 
          variant="default" 
          margin="none" 
          style={variant === 'compact' ? styles.compactModal : styles.defaultModal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Ionicons name="close" size={28} color={BLUE} />
          </TouchableOpacity>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  defaultModal: {
    width: '100%',
    maxHeight: '80%',
    maxWidth: 500,
  },
  compactModal: {
    width: '100%',
    maxHeight: '60%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});