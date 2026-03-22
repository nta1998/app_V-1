import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo, useRef, useCallback } from 'react';

import { makeStyles } from './styles/search.styles';
import { useTheme } from '../../../hooks/useTheme';
import { useApi } from '../../../hooks/useApi';
import { projectsApi, apartmentsApi, type Project, type Apartment } from '../../../services/api';
import { RealMap } from '../../../components/Search';
import { SearchResultsList } from '../../../components/Search';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Bottom sheet snap positions (% of screen from top)
const SHEET_PEEK = SCREEN_HEIGHT * 0.50;  // peeking — starts at 50% from top (covers 50%)
const SHEET_HALF = SCREEN_HEIGHT * 0.22;  // half open
const SHEET_MIN_Y = 120;                   // fully open (near top)


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
        <SearchResultsList
          isLoading={isLoading}
          filteredProjects={filteredProjects}
          filteredApartments={filteredApartments}
          totalCount={totalCount}
        />
      </Animated.View>

    </View>
  );
}
