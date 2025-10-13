import React from 'react';
import { Dimensions, Modal, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ColorPalette } from '@/assets/dev/color_palette';

const { height: screenHeight } = Dimensions.get('window');

interface ZoomableImageModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export default function ZoomableImageModal({ visible, imageUri, onClose }: ZoomableImageModalProps) {
  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <View style={styles.modalOverlay}>
        <GestureHandlerRootView style={styles.modalContainer}>
          <ImageZoom
            uri={imageUri}
            style={styles.zoomedImage}
            isDoubleTapEnabled={true}
            isPanEnabled={true}
            resizeMode="contain"
          />
        </GestureHandlerRootView>

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
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: screenHeight * 0.9,
    flex: 1,
  },
  zoomedImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ColorPalette.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ColorPalette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});