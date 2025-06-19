import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GuideDataItem, useScreen } from '../contexts/ApiContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Filter chip component
const FilterChip = ({ 
  label, 
  selected, 
  onPress, 
  color 
}: { 
  label: string; 
  selected: boolean; 
  onPress: () => void; 
  color?: string;
}) => (
  <TouchableOpacity
    style={[
      styles.filterChip,
      selected && styles.filterChipSelected,
      color && { backgroundColor: color, borderColor: color }
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.filterChipText,
      selected && styles.filterChipTextSelected
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ExpandableText = ({ text, maxLines = 3 }: { text: string; maxLines?: number }) => {
  const [expanded, setExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);

  // This function runs after the text has been laid out
  const onTextLayout = (event: any) => {
    // If we are not expanded, check if the number of rendered lines is >= maxLines.
    // This tells us if the text was truncated.
    if (!expanded && event.nativeEvent.lines.length >= maxLines) {
      setShowMoreButton(true);
    }
    // If the text is expanded, we never need the button.
    if (expanded) {
      setShowMoreButton(false);
    }
  };

  // When the user presses the button, toggle the expanded state.
  const toggleText = () => {
    setExpanded(!expanded);
  };

  return (
    <View>
      <Text 
        style={styles.description} 
        numberOfLines={expanded ? undefined : maxLines}
        onTextLayout={onTextLayout}
      >
        {text}
      </Text>
      {showMoreButton && !expanded && (
        <TouchableOpacity onPress={toggleText} style={styles.moreButton}>
          <Text style={styles.moreButtonText}>More</Text>
        </TouchableOpacity>
      )}
      {expanded && (
         <TouchableOpacity onPress={toggleText} style={styles.moreButton}>
          <Text style={styles.moreButtonText}>Less</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Zoomable image modal
const ZoomableImageModal = ({ 
  visible, 
  imageUri, 
  onClose 
}: { 
  visible: boolean; 
  imageUri: string; 
  onClose: () => void;
}) => (
  <Modal visible={visible} transparent={true} animationType="fade">
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalCloseArea} onPress={onClose}>
        <View style={styles.modalContent}>
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.zoomedImage}
              resizeMode="contain"
            />
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  </Modal>
);


// Main component, now generalized
export default function GuideListScreen({ route }: { route: any }) {
  // Use props to make the component reusable
  const { screenName, title } = route.params;

  // Fetch data dynamically based on the screenName prop
  const guideData = useScreen<GuideDataItem[]>(screenName);
  
  const [filteredData, setFilteredData] = useState<GuideDataItem[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [allColors, setAllColors] = useState<string[]>([]);
  const [allSeasons, setAllSeasons] = useState<string[]>([]);

  // Month mapping for season conversion. This can be moved to a constants file if used elsewhere.
  const monthMap: Record<string, string> = {
    '0': 'None', '1': 'January', '2': 'February', '3': 'March', 
    '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', 
    '9': 'September', '10': 'October', '11': 'November', '12': 'December',
  };

  // Extract unique colors and seasons from data. This logic is already dynamic.
  useEffect(() => {
    if (guideData.data) {
      const colors = new Set<string>();
      const seasons = new Set<string>();

      colors.add('None'); // Always add "None" for color filtering

      guideData.data.forEach(item => {
        if (item.color && item.color.length > 0) {
          item.color.forEach(color => {
            colors.add(color.charAt(0).toUpperCase() + color.slice(1).toLowerCase());
          });
        }
        if (item.season && item.season.length > 0) {
          item.season.forEach(season => {
            const monthName = monthMap[season.toString()];
            if (monthName) {
              seasons.add(monthName);
            } else {
              seasons.add(season.charAt(0).toUpperCase() + season.slice(1).toLowerCase());
            }
          });
        }
      });

      const sortedColors = Array.from(colors).sort((a, b) => {
        if (a === 'None') return -1;
        if (b === 'None') return 1;
        return a.localeCompare(b);
      });
      
      setAllColors(sortedColors);
      setAllSeasons(Array.from(seasons).sort());
    }
  }, [guideData.data]);

  // Filter data based on selected filters. This logic is also dynamic.
  useEffect(() => {
    if (!guideData.data) {
      setFilteredData([]);
      return;
    }

    let filtered = guideData.data;

    if (selectedColors.length > 0) {
      filtered = filtered.filter(item => {
        if (selectedColors.includes('None')) {
          if (!item.color || item.color.length === 0) {
            return true;
          }
        }
        return item.color?.some(color => 
          selectedColors.includes(color.charAt(0).toUpperCase() + color.slice(1).toLowerCase())
        );
      });
    }

    if (selectedSeasons.length > 0) {
      filtered = filtered.filter(item =>
        item.season?.some(season => {
          const monthName = monthMap[season.toString()];
          const displaySeason = monthName || season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
          return selectedSeasons.includes(displaySeason);
        })
      );
    }

    setFilteredData(filtered);
  }, [guideData.data, selectedColors, selectedSeasons]);

  const toggleColorFilter = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleSeasonFilter = (season: string) => {
    setSelectedSeasons(prev =>
      prev.includes(season)
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
  };

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedSeasons([]);
  };

  const renderItem = ({ item }: { item: GuideDataItem }) => (
    <View style={styles.card}>
      {item.image && (
        <TouchableOpacity onPress={() => setZoomedImage(item.image)}>
          <Image
            source={{ uri: item.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomIndicatorText}>🔍</Text>
          </View>
        </TouchableOpacity>
      )}
      
      <View style={styles.cardContent}>
        <Text style={styles.commonName}>{item.common_name}</Text>
        <Text style={styles.latinName}>{item.latin_name}</Text>
        
        <ExpandableText text={item.description} />
        
        {item.color && item.color.length > 0 && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagLabel}>Colors:</Text>
            <View style={styles.tagList}>
              {item.color.map((color, index) => (
                <View key={index} style={[styles.tag, styles.colorTag]}>
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
            <Text style={styles.tagLabel}>Colors:</Text>
            <View style={styles.tagList}>
              <View style={[styles.tag, styles.colorTag]}>
                <Text style={styles.tagText}>None</Text>
              </View>
            </View>
          </View>
        )}
        
        {item.season && item.season.length > 0 && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagLabel}>Seasons:</Text>
            <View style={styles.tagList}>
              {item.season.map((season, index) => {
                const monthName = monthMap[season.toString()];
                const displaySeason = monthName || season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
                return (
                  <View key={index} style={[styles.tag, styles.seasonTag]}>
                    <Text style={styles.tagText}>{displaySeason}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        {(!item.season || item.season.length === 0) && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagLabel}>Seasons:</Text>
            <View style={styles.tagList}>
              <View style={[styles.tag, styles.seasonTag]}>
                <Text style={styles.tagText}>None</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Use the title from props */}
      <Text style={styles.headerTitle}>{title} Guide</Text>
      
      {allColors.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter by Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {allColors.map(color => (
                <FilterChip
                  key={color}
                  label={color}
                  selected={selectedColors.includes(color)}
                  onPress={() => toggleColorFilter(color)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}
      
      {allSeasons.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter by Season</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {allSeasons.map(season => (
                <FilterChip
                  key={season}
                  label={season}
                  selected={selectedSeasons.includes(season)}
                  onPress={() => toggleSeasonFilter(season)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}
      
      {(selectedColors.length > 0 || selectedSeasons.length > 0) && (
        <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
          <Text style={styles.clearButtonText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.resultsCount}>
        {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
      </Text>
    </View>
  );

  // Use dynamic text in the loading indicator
  if (guideData.isLoading && !guideData.data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {zoomedImage && (
        <ZoomableImageModal
          visible={!!zoomedImage}
          imageUri={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </SafeAreaView>
  );
}

// NOTE: Styles are unchanged.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#FFBF00',
    borderColor: '#FFBF00',
  },
  filterChipText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#022851',
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dc3545',
    borderRadius: 20,
    marginBottom: 12,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIndicatorText: {
    color: '#fff',
    fontSize: 16,
  },
  cardContent: {
    padding: 16,
  },
  commonName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  latinName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#6c757d',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 12,
  },
  moreButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  moreButtonText: {
    fontSize: 14,
    color: '#022851',
    fontWeight: '600',
  },
  tagContainer: {
    marginTop: 12,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  colorTag: {
    backgroundColor: '#e3f2fd',
  },
  seasonTag: {
    backgroundColor: '#fff3e0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth,
    height: screenHeight * 0.8,
    position: 'relative',
  },
  zoomedImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
});