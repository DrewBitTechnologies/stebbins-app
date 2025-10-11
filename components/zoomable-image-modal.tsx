import React, { useRef, useEffect } from 'react';
import { Dimensions, Image, Modal, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorPalette } from '@/assets/dev/color_palette';

const { height: screenHeight } = Dimensions.get('window');

interface ZoomableImageModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export default function ZoomableImageModal({ visible, imageUri, onClose }: ZoomableImageModalProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && scrollViewRef.current) {
      // Reset zoom to minimum (1x) when modal opens
      setTimeout(() => {
        scrollViewRef.current?.setNativeProps({
          zoomScale: 1,
        });
      }, 50);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseArea} onPress={onClose}>
              <View style={styles.modalContent}>
                <ScrollView
                  ref={scrollViewRef}
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
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  modalContainer: {
    width: '100%',
    alignItems: 'center',
    maxHeight: '100%',
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
    height: screenHeight * 0.9,
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
    height: screenHeight * 0.9,
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