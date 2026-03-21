import {
  View,
  Text,
  ScrollView,
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
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import {
  auth,
  projectsApi,
  dealsApi,
  notificationsApi,
  type Project,
  type Deal,
  type User,
} from '../../services/api';

type StatCard = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  trend: string;
};

function buildStats(deals: Deal[]): StatCard[] {
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
              onPress={() => router.push('/(tabs)/notifications' as never)}
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
                onPress={() => router.push('/profile')}
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
              <View key={i} style={styles.statCard}>
                <View style={styles.statIconWrapper}>
                  <Ionicons name={card.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
                <Text style={styles.statTrend}>{card.trend}</Text>
              </View>
            ))}
          </View>

          {/* Featured Project Progress Card */}
          {isLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : featuredProject ? (
            <TouchableOpacity
              style={styles.projectCard}
              onPress={() => router.push(`/project/${featuredProject.id}` as never)}
              activeOpacity={0.85}
            >
              <BlurView intensity={40} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              <View style={styles.projectCardInner}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{featuredProject.type || 'בבנייה'}</Text>
                    <View style={styles.statusDot} />
                  </View>
                  <Text style={styles.projectTitle}>{featuredProject.title}</Text>
                  <View style={styles.locationRow}>
                    <Text style={styles.locationText}>{featuredProject.project_address}</Text>
                    <Ionicons name="navigate-outline" size={14} color="#ffffff80" />
                  </View>
                </View>

                {/* Stage Section */}
                <View style={styles.stageSection}>
                  <View style={styles.stageLabelsRow}>
                    <Text style={styles.stageLabelLeft}>סיום שלד</Text>
                    <Text style={styles.stageLabelRight}>שלב נוכחי</Text>
                  </View>
                  <View style={styles.stepsRow}>
                    {[0, 1, 2, 3].map((step) => {
                      const pct = featuredProject.percentage;
                      const filled = step < Math.floor(pct / 25);
                      const partial = step === Math.floor(pct / 25);
                      return (
                        <View
                          key={step}
                          style={[
                            styles.stepSegment,
                            filled && styles.stepFilled,
                            partial && styles.stepPartial,
                            !filled && !partial && styles.stepEmpty,
                          ]}
                        />
                      );
                    })}
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(featuredProject.percentage, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercent}>
                    {featuredProject.percentage}% הושלם
                  </Text>
                </View>

                {/* Separator */}
                <View style={styles.separator} />

                {/* Card Footer */}
                <View style={styles.projectFooter}>
                  <TouchableOpacity
                    style={styles.ctaRow}
                    onPress={() => router.push(`/project-progress/${featuredProject.id}` as never)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.ctaCircle}>
                      <Ionicons name="chevron-back" size={14} color={colors.primary} />
                    </View>
                    <Text style={styles.ctaText}>צפה בהתקדמות</Text>
                  </TouchableOpacity>
                  <View style={styles.teamRow}>
                    <View style={[styles.teamAvatar, { left: 0, backgroundColor: colors.bgDark }]}>
                      <Text style={styles.teamExtraText}>+{Math.max(featuredProject.documents.length, 2)}</Text>
                    </View>
                    <View style={[styles.teamAvatar, { left: 28, backgroundColor: colors.glass60 }]}>
                      <Ionicons name="person" size={14} color={colors.textWhite50} />
                    </View>
                    <View style={[styles.teamAvatar, { left: 48, backgroundColor: colors.glass60 }]}>
                      <Ionicons name="person" size={14} color={colors.textWhite50} />
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.loadingCard, styles.emptyCard]}>
              <Ionicons name="business-outline" size={32} color={colors.textWhite50} />
              <Text style={styles.emptyText}>אין פרויקטים זמינים</Text>
            </View>
          )}

          {/* Opportunities Section — other projects */}
          {opportunities.length > 0 && (
            <View style={styles.opportunitiesSection}>
              <Text style={styles.sectionTitle}>הזדמנויות חדשות</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.opportunitiesScroll}
                style={{ direction: 'rtl' }}
              >
                {opportunities.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={styles.opportunityCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/project/${project.id}` as never)}
                  >
                    {project.project_image_url ? (
                      <Image
                        source={{ uri: project.project_image_url }}
                        style={styles.opportunityImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.opportunityImagePlaceholder}>
                        <Ionicons name="business" size={24} color={colors.primary} />
                      </View>
                    )}
                    <View style={styles.opportunityFooter}>
                      <View style={styles.opportunityInfo}>
                        <Text style={styles.opportunityName} numberOfLines={1}>
                          {project.title}
                        </Text>
                        <Text style={styles.opportunityLocationText} numberOfLines={1}>
                          {project.project_address}
                        </Text>
                      </View>
                      {project.type && (
                        <View style={styles.opportunityTypeBadge}>
                          <Text style={styles.opportunityTypeBadgeText}>{project.type}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12, gap: 20 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.glass60,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 11,
    color: colors.bgDark,
  },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greetingText: { alignItems: 'flex-end', gap: 2 },
  greetingSmall: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 14,
    color: colors.textWhite,
    textAlign: 'right',
  },
  greetingName: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 22,
    color: colors.textWhite,
    textAlign: 'right',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgDark,
    borderWidth: 2,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.borderGold,
  },
  avatarText: { fontFamily: Fonts.manrope.bold, fontSize: 18, color: colors.primary },

  // Stat Strip
  statStrip: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.glass20,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    height: 122,
    alignItems: 'flex-end',
    gap: 4,
  },
  statIconWrapper: {},
  statValue: {
    fontFamily: Fonts.spaceGrotesk.bold,
    fontSize: 26,
    color: colors.textWhite,
  },
  statLabel: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 14,
    color: colors.textWhite,
    textAlign: 'right',
  },
  statTrend: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 13,
    color: colors.success,
  },

  // Loading / empty states
  loadingCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: colors.glass20,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyCard: { gap: 12 },
  emptyText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 16,
    color: colors.textWhite50,
  },

  // Project Card
  projectCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: colors.glass20,
  },
  projectCardInner: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  cardHeader: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusBadgeText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 14,
    color: colors.success,
  },
  projectTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 22,
    color: colors.textWhite,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 16,
    color: colors.textWhite,
  },

  // Stage Section
  stageSection: { gap: 10 },
  stageLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageLabelLeft: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 16,
    color: colors.primary,
  },
  stageLabelRight: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 14,
    color: colors.textWhite,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
  },
  stepSegment: {
    flex: 1,
    borderRadius: 2,
  },
  stepFilled: {
    backgroundColor: colors.primary,
  },
  stepPartial: {
    backgroundColor: colors.primaryDim,
  },
  stepEmpty: {
    backgroundColor: colors.glass60,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.glass60,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressPercent: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 14,
    color: colors.textWhite,
    textAlign: 'right',
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  // Project Footer
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaCircle: {
    width: 30,
    height: 30,
    borderRadius: 14,
    backgroundColor: colors.glass60,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
  teamRow: {
    width: 80,
    height: 32,
    position: 'relative',
  },
  teamAvatar: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
  },
  teamExtraText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 12,
    color: colors.textWhite,
  },

  // Opportunities
  opportunitiesSection: { marginBottom: 8, marginHorizontal: -20 },
  sectionTitle: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 22,
    color: colors.textWhite,
    textAlign: 'right',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  opportunitiesScroll: {
    gap: 12,
    paddingRight: 20,
  },
  opportunityCard: {
    width: 200,
    height: 190,
    backgroundColor: colors.glass20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  opportunityImage: {
    width: 200,
    height: 130,
  },
  opportunityImagePlaceholder: {
    width: 200,
    height: 130,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opportunityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  opportunityInfo: {
    alignItems: 'flex-end',
    gap: 1,
    flex: 1,
  },
  opportunityName: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 15,
    color: colors.textWhite,
    textAlign: 'right',
  },
  opportunityLocationText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: colors.textWhite,
  },
  opportunityTypeBadge: {
    backgroundColor: colors.primaryDim,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  opportunityTypeBadgeText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
  opportunityProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  opportunityProgressBar: {
    flex: 1,
    height: 3,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  opportunityProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  opportunityPct: {
    fontFamily: Fonts.spaceGrotesk.bold,
    fontSize: 13,
    color: colors.primary,
  },
});
