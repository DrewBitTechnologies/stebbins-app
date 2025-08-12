import React from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');

interface ZoomableImageModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export default function ZoomableImageModal({ visible, imageUri, onClose }: ZoomableImageModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={onClose}>
            <View style={styles.modalContent}>
              <ScrollView
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={styles.zoomedImage}
                  resizeMode="contain"
                />
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#022851" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
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
    flex: 1,
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: screenHeight * 0.7,
    maxHeight: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: '100%',
    height: screenHeight * 0.7,
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});