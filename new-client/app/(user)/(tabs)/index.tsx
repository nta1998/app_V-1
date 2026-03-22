import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { makeStyles } from './styles/index.styles';
import { useTheme } from '../../../hooks/useTheme';
import { useApi } from '../../../hooks/useApi';
import StatCard from '../../../components/StatCard';
import FeaturedProjectCard from '../../../components/Home/FeaturedProjectCard';
import OpportunitiesSection from '../../../components/Home/OpportunitiesSection';
import {
  auth,
  projectsApi,
  dealsApi,
  notificationsApi,
  type Project,
  type Deal,
  type User,
} from '../../../services/api';

type StatCardData = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  trend: string;
};

function buildStats(deals: Deal[]): StatCardData[] {
  const activeDeals = deals.filter((d) => d.status === 'Active');
  return [
    {
      icon: 'trending-up',
      value: '₪2.4M',
      label: 'סה"כ השקעה',
      trend: '+12.3%',
    },
    {
      icon: 'bar-chart-outline',
      value: '8.4%',
      label: 'תשואה שנתית',
      trend: '+0.8%',
    },
    {
      icon: 'briefcase',
      value: String(activeDeals.length || deals.length),
      label: 'עסקאות פעילות',
      trend: '+1',
    },
  ];
}

export default function HomeScreen() {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { state: profileState, refetch: refetchProfile } = useApi(auth.profile);
  const { state: projectsState, refetch: refetchProjects } = useApi(projectsApi.list);
  const { state: dealsState, refetch: refetchDeals } = useApi(dealsApi.list);
  const { state: notifState, refetch: refetchNotif } = useApi(notificationsApi.list);

  const user: User | null =
    profileState.status === 'success' ? profileState.data : null;
  const projects: Project[] =
    projectsState.status === 'success' ? projectsState.data : [];
  const deals: Deal[] =
    dealsState.status === 'success' ? dealsState.data : [];
  const unreadCount =
    notifState.status === 'success'
      ? notifState.data.filter((n) => !n.is_read).length
      : 0;

  const statCards = buildStats(deals);
  const featuredProject = projects[0] ?? null;
  // Opportunities = projects beyond the first (or all if no featured)
  const opportunities = projects.length > 1 ? projects.slice(1) : projects;

  const firstName = user?.full_name?.split(' ')[0] ?? 'משקיע';
  const avatarInitial = firstName.charAt(0);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  }, []);

  const isLoading =
    projectsState.status === 'loading' && profileState.status === 'loading';

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            {/* Bell icon */}
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => router.push('/notifications' as never)}
            >
              <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              <Ionicons name="notifications-outline" size={20} color={colors.textWhite} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Greeting */}
            <View style={styles.greetingRow}>
              <View style={styles.greetingText}>
                <Text style={styles.greetingSmall}>{greeting},</Text>
                <Text style={styles.greetingName}>{user?.full_name ?? firstName}</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/profile' as never)}
                activeOpacity={0.5}
                style={styles.avatar}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{avatarInitial}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Stat Strip */}
          <View style={styles.statStrip}>
            {statCards.map((card, i) => (
              <StatCard key={i} icon={card.icon} value={card.value} label={card.label} trend={card.trend} />
            ))}
          </View>

          {/* Featured Project Progress Card */}
          {isLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : featuredProject ? (
            <FeaturedProjectCard
              project={featuredProject}
              onPress={() => router.push(`/project/${featuredProject.id}` as never)}
              onViewProgress={() => router.push(`/project-progress/${featuredProject.id}` as never)}
            />
          ) : (
            <View style={[styles.loadingCard, styles.emptyCard]}>
              <Ionicons name="business-outline" size={32} color={colors.textWhite50} />
              <Text style={styles.emptyText}>אין פרויקטים זמינים</Text>
            </View>
          )}

          {/* Opportunities Section — other projects */}
          <OpportunitiesSection
            projects={opportunities}
            onProjectPress={(project) => router.push(`/project/${project.id}` as never)}
          />

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
