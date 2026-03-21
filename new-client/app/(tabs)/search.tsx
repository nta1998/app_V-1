import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';

// react-native-maps doesn't support web — conditionally require it
const MapView = Platform.OS !== 'web' ? require('react-native-maps').default : null;
const Marker = Platform.OS !== 'web' ? require('react-native-maps').Marker : null;
const Callout = Platform.OS !== 'web' ? require('react-native-maps').Callout : null;

import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { projectsApi, apartmentsApi, type Project, type Apartment } from '../../services/api';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Map area height
const MAP_HEIGHT = 502;
// Bottom sheet snap positions (% of screen from top)
const SHEET_PEEK = SCREEN_HEIGHT * 0.50;  // peeking — starts at 50% from top (covers 50%)
const SHEET_HALF = SCREEN_HEIGHT * 0.22;  // half open
const SHEET_MIN_Y = 120;                   // fully open (near top)

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1709' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1709' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a7d5a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2616' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#6b5e3e' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#221f10' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2a2616' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8a7d5a' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#2a3a1a' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b8a3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2616' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1709' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3520' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#2a2616' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#c8a455' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2a2616' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#8a7d5a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0d07' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a4530' }] },
];


export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const mapRef = useRef<any>(null);

  // Filter state
  const SORT_OPTIONS = ['מחיר (גבוה-נמוך)', 'מחיר (נמוך-גבוה)', 'חדש ביותר'];
  const CITY_OPTIONS = ['כל האזורים', 'תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'נתניה'];
  const [sortIndex, setSortIndex] = useState(0);
  const [cityIndex, setCityIndex] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<'sort' | 'city' | null>(null);

  const goToMyLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 800);
  }, []);

  const { state: projectsState } = useApi(projectsApi.list);
  const { state: apartmentsState } = useApi(apartmentsApi.list);

  const projects: Project[] = projectsState.status === 'success' ? projectsState.data : [];
  const apartments: Apartment[] = apartmentsState.status === 'success' ? apartmentsState.data : [];

  const selectedCity = CITY_OPTIONS[cityIndex];

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (selectedCity !== 'כל האזורים') {
      result = result.filter((p) => p.project_address.includes(selectedCity));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.project_address.toLowerCase().includes(q) ||
          (p.type?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [projects, query, selectedCity]);

  const filteredApartments = useMemo(() => {
    let result = apartments;
    if (selectedCity !== 'כל האזורים') {
      result = result.filter(
        (a) =>
          a.apartment_specific_address.includes(selectedCity) ||
          a.project.project_address.includes(selectedCity)
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (a) =>
          a.apartment_specific_address.toLowerCase().includes(q) ||
          a.project.title.toLowerCase().includes(q) ||
          (a.neighborhood?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [apartments, query, selectedCity]);

  const totalCount = filteredProjects.length + filteredApartments.length;
  const isLoading = projectsState.status === 'loading' || apartmentsState.status === 'loading';

  // Bottom sheet drag
  const sheetY = useMemo(() => new Animated.Value(SHEET_PEEK), []);
  const lastY = useRef(SHEET_PEEK);

  // Sync on mount
  useMemo(() => {
    sheetY.setValue(SHEET_PEEK);
    lastY.current = SHEET_PEEK;
  }, [sheetY]);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        const next = lastY.current + g.dy;
        if (next >= SHEET_MIN_Y && next <= SHEET_PEEK) {
          sheetY.setValue(next);
        }
      },
      onPanResponderRelease: (_, g) => {
        const next = lastY.current + g.dy;
        let snap: number;
        if (g.vy < -0.5 || next < SHEET_HALF - 60) {
          snap = SHEET_MIN_Y;
        } else if (g.vy > 0.5 || next > SHEET_HALF + 60) {
          snap = SHEET_PEEK;
        } else {
          snap = SHEET_HALF;
        }
        lastY.current = snap;
        Animated.spring(sheetY, {
          toValue: snap,
          useNativeDriver: false,
          tension: 60,
          friction: 12,
        }).start();
      },
    }),
  [sheetY]);

  const openSheet = useCallback(() => {
    lastY.current = SHEET_HALF;
    Animated.spring(sheetY, {
      toValue: SHEET_HALF,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
  }, [sheetY]);

  return (
    <View style={styles.container}>
      {/* Map area */}
      <View style={styles.mapArea}>
        <RealMap ref={mapRef} projects={projects} isDark={mode === 'dark'} />

        {/* Glass header bar */}
        <View style={[styles.headerBar, { top: insets.top + 8 }]}>
          <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              if (searchOpen) {
                setSearchOpen(false);
                setQuery('');
              } else {
                setSearchOpen(true);
              }
            }}
          >
            <Ionicons name={searchOpen ? 'close' : 'search-outline'} size={20} color="#ffffff99" />
          </TouchableOpacity>
          {searchOpen ? (
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="חיפוש פרויקט, כתובת..."
              placeholderTextColor="#ffffff40"
              textAlign="right"
              autoFocus
              returnKeyType="search"
            />
          ) : (
            <Text style={styles.headerTitle}>פרוייקטים 360</Text>
          )}
        </View>

        {/* Location button */}
        <TouchableOpacity style={styles.locationButton} onPress={goToMyLocation}>
          <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <Ionicons name="locate-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, { top: sheetY }]}>
        {/* Drag handle + header */}
        <View {...panResponder.panHandlers as any} style={styles.dragArea}>
          <View style={styles.dragHandle} />

          {/* Header row */}
          <View style={styles.sheetHeaderRow}>
            <TouchableOpacity>
              <Text style={styles.showAllLink}>הצג הכל</Text>
            </TouchableOpacity>
            <View style={styles.sheetHeaderRight}>
              <Text style={styles.sheetTitle}>חיפוש נכסים</Text>
              <Text style={styles.sheetSubtitle}>
                נמצאו {totalCount} נכסים באזור המבוקש
              </Text>
            </View>
          </View>

        </View>

        {/* Filter chips — outside drag area so touches work */}
        <View style={styles.filterChipsRow}>
          <View style={{ zIndex: openDropdown === 'sort' ? 10 : 1 }}>
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
            >
              <Ionicons name={openDropdown === 'sort' ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textWhite50} />
              <Text style={styles.filterChipText}>{SORT_OPTIONS[sortIndex]}</Text>
            </TouchableOpacity>
            {openDropdown === 'sort' && (
              <View style={styles.dropdown}>
                {SORT_OPTIONS.map((opt, i) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.dropdownItem, i === sortIndex && styles.dropdownItemActive]}
                    onPress={() => { setSortIndex(i); setOpenDropdown(null); }}
                  >
                    <Text style={[styles.dropdownText, i === sortIndex && styles.dropdownTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={{ zIndex: openDropdown === 'city' ? 10 : 1 }}>
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
            >
              <Ionicons name={openDropdown === 'city' ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textWhite50} />
              <Text style={styles.filterChipText}>{CITY_OPTIONS[cityIndex]}</Text>
            </TouchableOpacity>
            {openDropdown === 'city' && (
              <View style={styles.dropdown}>
                {CITY_OPTIONS.map((opt, i) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.dropdownItem, i === cityIndex && styles.dropdownItemActive]}
                    onPress={() => { setCityIndex(i); setOpenDropdown(null); }}
                  >
                    <Text style={[styles.dropdownText, i === cityIndex && styles.dropdownTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Results */}
        <ScrollView
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          ) : totalCount === 0 ? (
            <EmptyState message="לא נמצאו נכסים" />
          ) : (
            <>
              {filteredProjects.map((p) => (
                <PropertyCard
                  key={`project-${p.id}`}
                  title={p.title}
                  subtitle={p.project_address}
                  details={p.type ?? ''}
                  price={null}
                  imageUri={p.project_image_url}
                  placeholderIcon="business"
                  onPress={() => router.push(`/project/${p.id}` as never)}
                />
              ))}
              {filteredApartments.map((a) => {
                const price = a.price ? `₪${parseFloat(a.price).toLocaleString('he-IL')}` : 'מחיר לפי פנייה';
                const details = [
                  a.number_of_rooms != null ? `${a.number_of_rooms} חדרים` : null,
                  a.apartment_size_sqm != null ? `${a.apartment_size_sqm} מ"ר` : null,
                  a.floor != null ? `קומה ${a.floor}` : null,
                ].filter(Boolean).join(' \u2022 ');

                return (
                  <PropertyCard
                    key={`apt-${a.id}`}
                    title={a.apartment_specific_address}
                    subtitle={a.project.title}
                    details={details}
                    price={price}
                    imageUri={a.main_image}
                    placeholderIcon="home"
                    onPress={() => router.push(`/apartment/${a.id}` as never)}
                  />
                );
              })}
            </>
          )}
          <View style={{ height: 110 }} />
        </ScrollView>
      </Animated.View>

    </View>
  );
}

// ─── Map ──────────────────────────────────────────────────────────────────────

// Default region: Israel center
const INITIAL_REGION = {
  latitude: 32.0853,
  longitude: 34.7818,
  latitudeDelta: 1.8,
  longitudeDelta: 1.2,
};

type GeoProject = Project & { latitude: number; longitude: number };

const RealMap = React.forwardRef<any, { projects: Project[]; isDark: boolean }>(
  function RealMap({ projects, isDark }, ref) {
    const [geoProjects, setGeoProjects] = useState<GeoProject[]>([]);

    useEffect(() => {
      if (projects.length === 0) return;
      let cancelled = false;

      (async () => {
        const results: GeoProject[] = [];
        for (const p of projects) {
          if (!p.project_address) continue;
          try {
            const coords = await Location.geocodeAsync(p.project_address);
            if (coords.length > 0 && !cancelled) {
              results.push({ ...p, latitude: coords[0].latitude, longitude: coords[0].longitude });
            }
          } catch {
            // skip projects that fail to geocode
          }
        }
        if (!cancelled) setGeoProjects(results);
      })();

      return () => { cancelled = true; };
    }, [projects]);

    if (Platform.OS === 'web' || !MapView) {
      return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1709', alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="map-outline" size={48} color="#8a7d5a" />
          <Text style={{ color: '#8a7d5a', marginTop: 8, fontSize: 14 }}>Map not available on web</Text>
        </View>
      );
    }

    return (
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={isDark ? DARK_MAP_STYLE : []}
      >
        {Marker && geoProjects.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            pinColor="#c8a455"
          >
            {Callout && (
              <Callout onPress={() => router.push(`/project/${p.id}` as never)}>
                <View style={{ padding: 8, maxWidth: 200 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, textAlign: 'right' }}>{p.title}</Text>
                  <Text style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>{p.project_address}</Text>
                  <Text style={{ fontSize: 12, color: '#c8a455', marginTop: 4 }}>{p.percentage}% הושלם</Text>
                </View>
              </Callout>
            )}
          </Marker>
        ))}
      </MapView>
    );
  }
);

// ─── Property card (unified) ──────────────────────────────────────────────────

function PropertyCard({
  title,
  subtitle,
  details,
  price,
  imageUri,
  placeholderIcon,
  onPress,
}: {
  title: string;
  subtitle: string;
  details: string;
  price: string | null;
  imageUri?: string | null;
  placeholderIcon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.resultImage} resizeMode="cover" />
      ) : (
        <View style={[styles.resultImage, styles.resultImagePlaceholder]}>
          <Ionicons name={placeholderIcon} size={22} color={colors.primary} />
        </View>
      )}
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>{title}</Text>
        {details ? <Text style={styles.resultDetails}>{details}</Text> : null}
        {price ? <Text style={styles.resultPrice}>{price}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ message }: { message: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={32} color={colors.textWhite50} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },

  // Map
  mapArea: { height: MAP_HEIGHT, overflow: 'hidden' },

  // Glass header bar
  headerBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 50,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 100,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 20,
    color: colors.textWhite,
    textAlign: 'center',
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.heebo.regular,
    fontSize: 16,
    color: colors.textWhite,
    height: '100%',
    textAlign: 'right',
    marginHorizontal: 10,
  },

  // Location button
  locationButton: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMedium,
    backgroundColor: colors.glass100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.borderMedium,
    overflow: 'hidden',
  },
  dragArea: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textWhite50,
  },

  // Sheet header
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  sheetHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sheetTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 18,
    color: colors.textWhite,
    textAlign: 'right',
  },
  sheetSubtitle: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 13,
    color: colors.textWhite,
    textAlign: 'right',
  },
  showAllLink: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 15,
    color: colors.primary,
    marginTop: 4,
  },

  // Filter chips
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-end',
    zIndex: 100,
    paddingRight: 16,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterChipText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 13,
    color: colors.textWhite,
  },
  dropdown: {
    position: 'absolute',
    top: 38,
    right: 0,
    minWidth: 180,
    backgroundColor: colors.bgDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGold,
    paddingVertical: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownItemActive: {
    backgroundColor: '#c8a45515',
  },
  dropdownText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 14,
    color: colors.textWhite,
    textAlign: 'right',
  },
  dropdownTextActive: {
    color: colors.primary,
  },

  // Results
  resultsContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    height: 90,
    gap: 12,
  },
  resultImage: {
    width: 66,
    height: 66,
    borderRadius: 12,
  },
  resultImagePlaceholder: {
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  resultTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 14,
    color: colors.textWhite,
    textAlign: 'right',
    flexShrink: 1,
  },
  resultDetails: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: colors.textWhite,
    textAlign: 'right',
  },
  resultPrice: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 14,
    color: colors.primary,
    textAlign: 'right',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 16,
    color: colors.textWhite50,
  },
});
