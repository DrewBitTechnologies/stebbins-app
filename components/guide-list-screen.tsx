import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, ImageBackground } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { GuideDataItem, GuideData, useScreen } from '../contexts/api';
import FilterChip from './filter-chip';
import GuideCard from './guide-card';
import ZoomableImageModal from './zoomable-image-modal';
import { getImageSource } from '@/utility/image-source';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { ColorPalette } from '../assets/dev/color_palette';


export default function GuideListScreen({ route }: { route: any }) {
  const { screenName, title } = route.params;
  const { data, getImagePath, isLoading } = useScreen<GuideDataItem[]>(screenName);
  
  // Get the main guide screen data for background image
  const { data: guideData, getImagePath: getGuideImagePath } = useScreen<GuideData>('guide');

  const [filteredData, setFilteredData] = useState<GuideDataItem[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [allColors, setAllColors] = useState<string[]>([]);
  const [allSeasons, setAllSeasons] = useState<string[]>([]);
  const [isFilterDropdownVisible, setIsFilterDropdownVisible] = useState(false);
  const [isNavigationDropdownVisible, setIsNavigationDropdownVisible] = useState(false);
  
  // Reanimated values
  const navigationAnimation = useSharedValue(0);
  const filterAnimation = useSharedValue(0);

  const guideCategories = [
    { title: 'Trees & Shrubs', route: '/guides/trees-and-shrubs', iconLibrary: 'Ionicons', icon: 'leaf' },
    { title: 'Trail Tracks', route: '/guides/trail-tracks', iconLibrary: 'Ionicons', icon: 'footsteps' },
    { title: 'Wildflowers', route: '/guides/wildflowers', iconLibrary: 'Ionicons', icon: 'flower' },
  ];

  const animalCategories = [
    { title: 'Mammals', route: '/guides/mammals', iconLibrary: 'Ionicons', icon: 'paw' },
    { title: 'Birds', route: '/guides/birds', iconLibrary: 'MaterialCommunityIcons', icon: 'feather' },
    { title: 'Herps', route: '/guides/herps', iconLibrary: 'MaterialCommunityIcons', icon: 'snake' },
    { title: 'Invertebrates', route: '/guides/invertebrates', iconLibrary: 'MaterialCommunityIcons', icon: 'ladybug' },
  ];

  const renderCategoryIcon = (category: { iconLibrary: string; icon: string }, color: string, size: number = 25) => {
    if (category.iconLibrary === 'Ionicons') {
      return <Ionicons name={category.icon as any} size={size} color={color} />;
    } else {
      return <MaterialCommunityIcons name={category.icon as any} size={size} color={color} />;
    }
  };

  const getFilterCategoryName = () => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('mammal')) return 'Mammals';
    if (titleLower.includes('bird')) return 'Birds';
    if (titleLower.includes('herp')) return 'Herps';
    if (titleLower.includes('invertebrate')) return 'Invertebrates';
    if (titleLower.includes('tree') || titleLower.includes('shrub')) return 'Trees & Shrubs';
    if (titleLower.includes('wildflower') || titleLower.includes('flower')) return 'Wildflowers';
    if (titleLower.includes('track')) return 'Trail Tracks';
    return title; // fallback
  };


  const isCurrentCategory = (categoryTitle: string) => {
    const titleLower = title.toLowerCase();
    const categoryLower = categoryTitle.toLowerCase();
    
    // Check exact matches for animal subcategories and other categories
    if (categoryLower.includes('mammal') && titleLower.includes('mammal')) return true;
    if (categoryLower.includes('bird') && titleLower.includes('bird')) return true;
    if (categoryLower.includes('herp') && titleLower.includes('herp')) return true;
    if (categoryLower.includes('invertebrate') && titleLower.includes('invertebrate')) return true;
    if (categoryLower.includes('tree') && (titleLower.includes('tree') || titleLower.includes('shrub'))) return true;
    if (categoryLower.includes('wildflower') && (titleLower.includes('wildflower') || titleLower.includes('flower'))) return true;
    if (categoryLower.includes('track') && titleLower.includes('track')) return true;
    
    return false;
  };

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

  // Animated styles
  const navigationAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(navigationAnimation.value, [0, 1], [0, 1]),
      maxHeight: interpolate(navigationAnimation.value, [0, 1], [0, 280]),
    };
  });

  const navigationChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(navigationAnimation.value, [0, 1], [0, 180])}deg` }
      ],
    };
  });

  const filterAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(filterAnimation.value, [0, 1], [0, 1]),
      maxHeight: interpolate(filterAnimation.value, [0, 1], [0, 280]),
    };
  });

  const filterChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(filterAnimation.value, [0, 1], [0, -180])}deg` }
      ],
    };
  });

  const toggleNavigationDropdown = () => {
    setIsNavigationDropdownVisible(!isNavigationDropdownVisible);
    navigationAnimation.value = withTiming(
      isNavigationDropdownVisible ? 0 : 1,
      { duration: 300 }
    );
  };

  const toggleFilterDropdown = () => {
    setIsFilterDropdownVisible(!isFilterDropdownVisible);
    filterAnimation.value = withTiming(
      isFilterDropdownVisible ? 0 : 1,
      { duration: 300 }
    );
  };

  const closeFilterDropdown = () => {
    if (isFilterDropdownVisible) {
      setIsFilterDropdownVisible(false);
      filterAnimation.value = withTiming(0, { duration: 300 });
    }
  };

  const closeNavigationDropdown = () => {
    if (isNavigationDropdownVisible) {
      setIsNavigationDropdownVisible(false);
      navigationAnimation.value = withTiming(0, { duration: 300 });
    }
  };

  const closeAllDropdowns = () => {
    closeFilterDropdown();
    closeNavigationDropdown();
  };

  const renderItem = ({ item }: { item: GuideDataItem }) => (
    <GuideCard
      item={item}
      getImagePath={getImagePath}
      onImagePress={setZoomedImage}
      monthMap={monthMap}
    />
  );
  

  const renderTopNavigationComponent = () => (
    <View style={styles.topNavigationComponent}>
      {/* Header Section - Always Visible */}
      <TouchableOpacity 
        style={styles.navigationHeader}
        onPress={toggleNavigationDropdown}
      >
        <View style={styles.navigationBarContent}>
          <View style={styles.navigationBarLeft}>
            <Ionicons name="book" size={25} color={ColorPalette.primary_green}style={styles.iconWithMargin} />
            <View style={styles.navigationBarTextContainer}>
              <Text style={styles.navigationBarTitle}>Navigate Guides</Text>
              <View style={styles.navigationBarSubtitle}>
                <Text style={styles.navigationBarSubtitleText}>
                  Currently viewing {getFilterCategoryName()}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.navigationBarRight}>
            <Animated.View style={navigationChevronStyle}>
              <MaterialCommunityIcons 
                name="chevron-down"
                size={25} 
                color={ColorPalette.primary_green}
              />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Expanded Content - Animated Show/Hide */}
      <Animated.View style={[styles.navigationDropdownContent, navigationAnimatedStyle]}> 
        <View style={styles.navigationContentWrapper}>
          <ScrollView style={styles.navigationScrollContent} showsVerticalScrollIndicator={false}>

          {/* Other Categories */}
          <View style={[styles.expandedSection, styles.expandedSectionCompact]}>
            <Text style={styles.expandedSectionTitle}>Plants & Tracks</Text>
            <View style={styles.categoryGrid}>
              {guideCategories.map(category => (
                <TouchableOpacity
                  key={category.title}
                  style={[
                    styles.categoryButton,
                    isCurrentCategory(category.title) && styles.categoryButtonActive
                  ]}
                  onPress={() => handleCategoryChange(category.route)}
                >
                  {renderCategoryIcon(
                    category, 
                    isCurrentCategory(category.title) ? ColorPalette.white : ColorPalette.primary_green, 
                    25
                  )}
                  <Text style={[
                    styles.categoryButtonText,
                    isCurrentCategory(category.title) && styles.categoryButtonTextActive
                  ]}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Animal Categories */}
          <View style={[styles.expandedSection, styles.expandedSectionCompact]}>
            <Text style={styles.expandedSectionTitle}>Animals</Text>
            <View style={styles.categoryGrid}>
              {animalCategories.map(category => (
                <TouchableOpacity
                  key={category.title}
                  style={[
                    styles.categoryButton,
                    isCurrentCategory(category.title) && styles.categoryButtonActive
                  ]}
                  onPress={() => handleAnimalCategoryChange(category.route)}
                >
                  {renderCategoryIcon(
                    category, 
                    isCurrentCategory(category.title) ? ColorPalette.white : ColorPalette.primary_green, 
                    25
                  )}
                  <Text style={[
                    styles.categoryButtonText,
                    isCurrentCategory(category.title) && styles.categoryButtonTextActive
                  ]}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          </ScrollView>
        </View>
        </Animated.View>
    </View>
  );

  const handleCategoryChange = (route: string) => {
    setIsNavigationDropdownVisible(false);
    router.replace(route as any);
  };

  const handleAnimalCategoryChange = (route: string) => {
    setIsNavigationDropdownVisible(false);
    router.replace(route as any);
  };

  const renderBottomFilterComponent = () => (
    <View style={styles.bottomFilterComponent}>
      {/* Expanded Content - Animated Show/Hide */}
      <Animated.View style={[styles.filterDropdownContent, filterAnimatedStyle]}>
        <View style={styles.filterContentWrapper}>
          <View style={styles.filterExpandedHeader}>
          <Text style={styles.filterExpandedTitle}>Filter {getFilterCategoryName()}</Text>
          {(selectedColors.length > 0 || selectedSeasons.length > 0) && (
            <TouchableOpacity style={styles.clearAllButton} onPress={clearAllFilters}>
              <MaterialCommunityIcons name="close-circle" size={16} color={ColorPalette.black} />
              <Text style={styles.clearAllButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView style={styles.filterScrollContent} showsVerticalScrollIndicator={false}>
          {/* Color Filter Section - Always Show */}
          <View style={styles.filterSection}>
            <View style={styles.filterTitleContainer}>
              <MaterialCommunityIcons name="palette" size={25} color={ColorPalette.primary_green}/>
              <Text style={styles.filterTitle}>Filter by Color</Text>
            </View>
            <View style={styles.chipContainer}>
              {allColors.length > 0 ? (
                allColors.map(color => (
                  <FilterChip
                    key={color}
                    label={color}
                    selected={selectedColors.includes(color)}
                    onPress={() => toggleColorFilter(color)}
                  />
                ))
              ) : (
                <Text style={styles.noFiltersText}>No color data available</Text>
              )}
            </View>
          </View>
          
          {/* Season Filter Section - Always Show */}
          <View style={styles.filterSection}>
            <View style={styles.filterTitleContainer}>
              <MaterialCommunityIcons name="calendar" size={25} color={ColorPalette.primary_green}/>
              <Text style={styles.filterTitle}>Filter by Season</Text>
            </View>
            <View style={styles.chipContainer}>
              {allSeasons.length > 0 ? (
                allSeasons.map(season => (
                  <FilterChip
                    key={season}
                    label={season}
                    selected={selectedSeasons.includes(season)}
                    onPress={() => toggleSeasonFilter(season)}
                  />
                ))
              ) : (
                <Text style={styles.noFiltersText}>No seasonal data available</Text>
              )}
            </View>
          </View>
          </ScrollView>
        </View>
        </Animated.View>
      
      {/* Footer Section - Always Visible */}
      <TouchableOpacity 
        style={styles.bottomFilterButton}
        onPress={toggleFilterDropdown}
      >
        <View style={styles.filterBarContent}>
          <View style={styles.filterBarLeft}>
            <MaterialCommunityIcons name="filter-variant" size={25} color={ColorPalette.primary_green}style={styles.iconWithMargin} />
            <View style={styles.filterBarTextContainer}>
              <Text style={styles.filterBarTitle}>Filters</Text>
              <View style={styles.filterBarSubtitle}>
                <Text style={styles.filterBarSubtitleText}>
                  {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
                </Text>
                {(selectedColors.length > 0 || selectedSeasons.length > 0) && (
                  <>
                    <Text style={styles.filterBarDivider}> • </Text>
                    <Text style={styles.activeFiltersText}>
                      {selectedColors.length + selectedSeasons.length} active filter{selectedColors.length + selectedSeasons.length !== 1 ? 's' : ''}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
          <View style={styles.filterBarRight}>
            <Animated.View style={filterChevronStyle}>
              <MaterialCommunityIcons 
                name="chevron-up"
                size={25} 
                color={ColorPalette.primary_green}
              />
            </Animated.View>
            {(selectedColors.length > 0 || selectedSeasons.length > 0) && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterText}>
                  {selectedColors.length + selectedSeasons.length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !data) {
    return (
      <ImageBackground 
        source={getImageSource(guideData, 'background', getGuideImagePath, require('@/assets/dev/fallback.jpeg'))}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)']}
          style={styles.gradientOverlay}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={ColorPalette.primary_green}/>
            <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground 
      source={getImageSource(guideData, 'background', getGuideImagePath, require('@/assets/dev/fallback.jpeg'))}
      style={styles.backgroundImage}
      resizeMode="cover"
      blurRadius={5}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Top Navigation Component */}
      {/* <BlurView intensity={5} tint='default' style={
        {
          position: 'absolute',
          top: 0,
          left: 20,
          right: 20,
          bottom: '90%',
          zIndex: 1,
          
        }
      }/> */}

      {renderTopNavigationComponent()}
      
      {/* Scrollable Content Area */}
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.flatList}
          onScrollBeginDrag={closeAllDropdowns}
        />
      
      
      {/* Bottom Filter Component */}
      {renderBottomFilterComponent()}

      {/* <BlurView intensity={5} tint='default' style={
        {
          position: 'absolute',
          top: '90%',
          bottom: 0,
          left: 20,
          right: 20,
          zIndex: 1,
          
        }
      }/> */}
      
      {zoomedImage && (
        <ZoomableImageModal
          visible={!!zoomedImage}
          imageUri={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />
      )}
      
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: ColorPalette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: ColorPalette.primary_green,
    fontWeight: '500',
  },
  topNavigationComponent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: ColorPalette.white,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    shadowColor: ColorPalette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 10,
    zIndex: 2,
  },
  navigationDropdownContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(45, 80, 22, 0.1)',
    overflow: 'hidden',
  },
  navigationContentWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navigationExpandedHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 80, 22, 0.1)',
  },
  navigationExpandedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ColorPalette.primary_green,
  },
  navigationScrollContent: {
    maxHeight: 280,
  },
  navigationHeader: {
    width: '100%',
  },
  expandedSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  expandedSectionCompact: {
    marginTop: 8,
  },
  expandedSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ColorPalette.primary_green,
    marginBottom: 12,
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  bottomFilterComponent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ColorPalette.white,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    paddingBottom: 20,
    shadowColor: ColorPalette.black,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
    elevation: 10,
    zIndex: 2,
  },
  bottomFilterButton: {
    width: '100%',
  },
  separator: {
    height: 20,
  },
  navigationBarButton: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navigationBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navigationBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navigationBarTextContainer: {
    flex: 1,
  },
  navigationBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ColorPalette.primary_green,
    marginBottom: 2,
  },
  navigationBarSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigationBarSubtitleText: {
    fontSize: 14,
    color: ColorPalette.text_secondary,
  },
  navigationBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomFilterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(45, 80, 22, 0.1)',
    shadowColor: ColorPalette.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 2,
  },
  filterBarButton: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  filterBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  filterBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterBarIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  filterBarTextContainer: {
    flex: 1,
  },
  filterBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ColorPalette.primary_green,
    marginBottom: 2,
  },
  filterBarSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBarSubtitleText: {
    fontSize: 14,
    color: ColorPalette.text_secondary,
  },
  filterBarDivider: {
    fontSize: 14,
    color: ColorPalette.text_secondary,
    marginHorizontal: 4,
  },
  activeFiltersText: {
    fontSize: 14,
    color: ColorPalette.primary_green,
    fontWeight: '500',
  },
  activeFilterBadge: {
    backgroundColor: ColorPalette.primary_green,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(102, 102, 102, 0.2)',
  },
  clearAllButtonText: {
    color: ColorPalette.text_primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(45, 80, 22, 0.2)',
    flex: 1,
    minWidth: 120,
  },
  categoryButtonActive: {
    backgroundColor: ColorPalette.primary_green,
    borderColor: ColorPalette.primary_green,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: ColorPalette.primary_green,
    marginLeft: 8,
    flex: 1,
  },
  categoryButtonTextActive: {
    color: ColorPalette.white,
  },
  categoryGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ColorPalette.primary_green,
    marginTop: 8,
    marginBottom: 12,
  },
  filterDropdownContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 80, 22, 0.1)',
    overflow: 'hidden',
  },
  filterContentWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterExpandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 80, 22, 0.1)',
  },
  filterExpandedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ColorPalette.primary_green,
  },
  filterScrollContent: {
    maxHeight: 240,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ColorPalette.primary_green,
    marginLeft: 8,
  },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(45, 80, 22, 0.1)',
  },
  filterResultsContainer: {
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(45, 80, 22, 0.2)',
  },
  filterResultsText: {
    fontSize: 14,
    color: ColorPalette.primary_green,
    fontWeight: '600',
  },
  iconWithMargin: {
    marginRight: 12,
  },
  noFiltersText: {
    fontSize: 14,
    color: ColorPalette.black,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});