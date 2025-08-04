import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GuideDataItem, useScreen } from '../contexts/api';
import FilterChip from './filter-chip';
import GuideCard from './guide-card';
import ZoomableImageModal from './zoomable-image-modal';


export default function GuideListScreen({ route }: { route: any }) {
  const { screenName, title } = route.params;
  const { data, getImagePath, isLoading } = useScreen<GuideDataItem[]>(screenName);

  const [filteredData, setFilteredData] = useState<GuideDataItem[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [allColors, setAllColors] = useState<string[]>([]);
  const [allSeasons, setAllSeasons] = useState<string[]>([]);

  const monthMap: Record<string, string> = {
    '0': 'None', '1': 'January', '2': 'February', '3': 'March',
    '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August',
    '9': 'September', '10': 'October', '11': 'November', '12': 'December',
  };

  useEffect(() => {
    if (data) {
      const colors = new Set<string>();
      const seasons = new Set<string>();

      colors.add('None');

      data.forEach(item => {
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
  }, [data]);

  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }

    let filtered = data;

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
  }, [data, selectedColors, selectedSeasons]);

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
    <GuideCard
      item={item}
      getImagePath={getImagePath}
      onImagePress={setZoomedImage}
      monthMap={monthMap}
    />
  );
  
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title} Guide</Text>
      </View>
      
      {allColors.length > 0 && (
        <View style={styles.filterSection}>
          <View style={styles.filterTitleContainer}>
            <Ionicons name="color-filter" size={16} color="#2d5016" />
            <Text style={styles.filterTitle}>Filter by Color</Text>
          </View>
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
          <View style={styles.filterTitleContainer}>
            <Ionicons name="calendar" size={16} color="#2d5016" />
            <Text style={styles.filterTitle}>Filter by Season</Text>
          </View>
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
          <Ionicons name="close-circle" size={14} color="#666" />
          <Text style={styles.clearButtonText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.resultsContainer}>
        <Ionicons name="list" size={14} color="#2d5016" />
        <Text style={styles.resultsCount}>
          {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
        </Text>
      </View>
    </View>
  );

  if (isLoading && !data) {
    return (
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.backgroundGradient}
      >
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2d5016" />
            <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#f8f9fa', '#e9ecef']}
      style={styles.backgroundGradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2d5016',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 80, 22, 0.1)',
  },
  headerTitleContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d5016',
    marginLeft: 6,
  },
  filterRow: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(102, 102, 102, 0.3)',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
  },
  resultsCount: {
    fontSize: 13,
    color: '#2d5016',
    fontWeight: '500',
    marginLeft: 6,
  },
  separator: {
    height: 12,
  },
});