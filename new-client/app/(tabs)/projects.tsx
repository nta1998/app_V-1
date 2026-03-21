import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { projectsApi, type Project } from '../../services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 16;
const CARD_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = 220;

const FILTER_ALL = 'הכל';
const FILTERS = [FILTER_ALL, 'תמ"א 38', 'פרויקטים חדשים'];

export default function ProjectsScreen() {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);
  const { state, refetch } = useApi(projectsApi.list);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const projects: Project[] = state.status === 'success' ? state.data : [];

  const filtered = useMemo(() => {
    if (activeFilter === FILTER_ALL) return projects;
    return projects.filter(
      (p) => p.type?.includes(activeFilter) || p.title.includes(activeFilter)
    );
  }, [projects, activeFilter]);

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>פרויקטים נבחרים</Text>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          style={[styles.filtersWrapper, { direction: 'rtl' }]}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        {state.status === 'loading' && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : state.status === 'error' ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.primary} />
            <Text style={styles.emptyText}>לא ניתן לטעון פרויקטים</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryText}>נסה שנית</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="business-outline" size={36} color={colors.textWhite50} />
            <Text style={styles.emptyText}>אין פרויקטים בקטגוריה זו</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            numColumns={2}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ProjectCard project={item} />}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/project/${project.id}` as never)}
      activeOpacity={0.85}
    >
      {/* Full-width image or placeholder */}
      {project.project_image_url ? (
        <Image
          source={{ uri: project.project_image_url }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cardImagePlaceholder]}>
          <Ionicons name="business" size={40} color={colors.primaryGlow} />
        </View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', colors.bgDeep + 'CC']}
        style={StyleSheet.absoluteFill}
      />


      {/* Glass footer */}
      <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.glassFooter}>
        <View style={styles.glassFooterInner}>
          <View style={styles.footerTextBlock}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {project.title}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {project.project_address}
            </Text>
          </View>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Header
  headerWrapper: {
    height: 48,
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    flex: 1,
    fontFamily: Fonts.manrope.bold,
    fontSize: 18,
    color: colors.textWhite,
    textAlign: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filters
  filtersWrapper: {
    marginTop: 12,
    marginBottom: 4,
    flexGrow: 0,
  },
  filtersRow: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 13,
    lineHeight: 16,
    color: colors.textWhite,
    textAlign: 'center',
    includeFontPadding: false,
  },
  chipTextActive: {
    color: colors.textWhite,
  },

  // States
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 17,
    color: colors.textWhite50,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 16,
    color: colors.bgDark,
  },

  // Card list
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
    gap: 16,
  },
  columnWrapper: {
    gap: 16,
    direction: 'rtl' as const,
  },

  // Project Card
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  glassFooter: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    width: CARD_WIDTH - 24,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  glassFooterInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: colors.glass20,
  },
  footerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  cardTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 15,
    color: colors.textWhite,
    textAlign: 'right',
  },
  cardSubtitle: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: colors.textWhite,
    textAlign: 'right',
  },
});
