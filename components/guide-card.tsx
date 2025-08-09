import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GuideDataItem } from '../contexts/api';
import ExpandableText from './expandable-text';

interface GuideCardProps {
  item: GuideDataItem;
  getImagePath: (imageName: string) => string | undefined;
  onImagePress: (imageUri: string) => void;
  monthMap: Record<string, string>;
}

export default function GuideCard({ item, getImagePath, onImagePress, monthMap }: GuideCardProps) {
  const imageUri = item.image ? getImagePath(item.image) : null;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {imageUri && (
          <TouchableOpacity onPress={() => onImagePress(imageUri)} style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.zoomIndicator}>
              <Ionicons name="expand" size={16} color="#2d5016" />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.cardContent}>
          <View style={styles.titleSection}>
            <Text style={styles.commonName}>{item.common_name}</Text>
            <Text style={styles.latinName}>{item.latin_name}</Text>
          </View>

          <ExpandableText text={item.description} />

          {item.color && item.color.length > 0 && (
            <View style={styles.tagContainer}>
              <View style={styles.tagHeader}>
                <Ionicons name="color-palette-outline" size={16} color="#2d5016" />
                <Text style={styles.tagLabel}>Colors</Text>
              </View>
              <View style={styles.tagList}>
                {item.color.map((color, index) => (
                  <View key={index} style={styles.colorTag}>
                    <Text style={styles.tagText}>
                      {color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {(!item.color || item.color.length === 0) && (
            <View style={styles.tagContainer}>
              <View style={styles.tagHeader}>
                <Ionicons name="color-palette-outline" size={16} color="#2d5016" />
                <Text style={styles.tagLabel}>Colors</Text>
              </View>
              <View style={styles.tagList}>
                <View style={styles.emptyTag}>
                  <Text style={styles.emptyTagText}>None</Text>
                </View>
              </View>
            </View>
          )}

          {item.season && item.season.length > 0 && (
            <View style={styles.tagContainer}>
              <View style={styles.tagHeader}>
                <Ionicons name="leaf-outline" size={16} color="#2d5016" />
                <Text style={styles.tagLabel}>Seasons</Text>
              </View>
              <View style={styles.tagList}>
                {item.season.map((season, index) => {
                  const monthName = monthMap[season.toString()];
                  const displaySeason = monthName || season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
                  return (
                    <View key={index} style={styles.seasonTag}>
                      <Text style={styles.tagText}>{displaySeason}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          {(!item.season || item.season.length === 0) && (
            <View style={styles.tagContainer}>
              <View style={styles.tagHeader}>
                <Ionicons name="leaf-outline" size={16} color="#2d5016" />
                <Text style={styles.tagLabel}>Seasons</Text>
              </View>
              <View style={styles.tagList}>
                <View style={styles.emptyTag}>
                  <Text style={styles.emptyTagText}>None</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(45, 80, 22, 0.1)',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  commonName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  latinName: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 2,
  },
  tagContainer: {
    marginTop: 16,
  },
  tagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d5016',
    marginLeft: 6,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 80, 22, 0.2)',
  },
  seasonTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 80, 22, 0.2)',
  },
  emptyTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(108, 117, 125, 0.2)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2d5016',
  },
  emptyTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
  },
});