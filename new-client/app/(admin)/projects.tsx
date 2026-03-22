import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { projectsApi, type Project } from '../../services/api';
import { ProjectCard } from '../../components/Admin';
import { makeStyles } from './styles/projects.styles';

const FILTER_ALL = 'הכל';
const STATUS_FILTERS = [FILTER_ALL, 'הושלם', 'בבדיקות', 'פיתוח', 'התחלה'];

function getProjectStatus(project: Project): string {
  if (project.percentage >= 100) return 'הושלם';
  if (project.percentage >= 60) return 'בבדיקות';
  if (project.percentage >= 30) return 'פיתוח';
  return 'התחלה';
}

export default function AdminProjectsScreen() {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, refetch } = useApi(projectsApi.list);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const allProjects: Project[] = state.status === 'success' ? state.data : [];

  const projects = useMemo(() => {
    if (activeFilter === FILTER_ALL) return allProjects;
    return allProjects.filter((p) => getProjectStatus(p) === activeFilter);
  }, [allProjects, activeFilter]);

  const handleDelete = (project: Project) => {
    Alert.alert('מחיקת פרויקט', `למחוק את "${project.title}"?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await projectsApi.delete(project.id);
            await refetch();
          } catch {
            Alert.alert('שגיאה', 'לא ניתן למחוק את הפרויקט');
          }
        },
      },
    ]);
  };

  const renderCard = ({ item: project }: { item: Project }) => (
    <ProjectCard
      imageUrl={project.project_image_url}
      title={project.title}
      address={project.project_address}
      onPress={() => router.push(`/project/${project.id}` as never)}
      onLongPress={() => handleDelete(project)}
    />
  );

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
          style={styles.filtersWrapper}
        >
          {STATUS_FILTERS.map((f) => (
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
        ) : projects.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="business-outline" size={36} color={colors.textWhite50} />
            <Text style={styles.emptyText}>
              {activeFilter === FILTER_ALL ? 'אין עדיין פרויקטים' : 'אין פרויקטים בקטגוריה זו'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={projects}
            numColumns={2}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCard}
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

