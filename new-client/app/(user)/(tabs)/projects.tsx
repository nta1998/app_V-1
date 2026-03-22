import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { makeStyles } from './styles/projects.styles';
import { useTheme } from '../../../hooks/useTheme';
import { useApi } from '../../../hooks/useApi';
import { projectsApi, type Project } from '../../../services/api';
import StateView from '../../../components/StateView';
import FilterChips from '../../../components/FilterChips';
import ProjectCard from '../../../components/ProjectCard';

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
        <FilterChips items={FILTERS} active={activeFilter} onSelect={setActiveFilter} />

        {/* Content */}
        {state.status === 'loading' && !refreshing ? (
          <StateView status="loading" />
        ) : state.status === 'error' ? (
          <StateView status="error" message="לא ניתן לטעון פרויקטים" onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <StateView status="empty" icon="business-outline" message="אין פרויקטים בקטגוריה זו" />
        ) : (
          <FlatList
            data={filtered}
            numColumns={2}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ProjectCard
                imageUrl={item.project_image_url}
                title={item.title}
                subtitle={item.project_address}
                onPress={() => router.push(`/project/${item.id}` as never)}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
              />
            )}
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
