import { useMemo, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { projectsApi, type Project } from '../../services/api';
import FloatingBackButton from '../../components/FloatingBackButton';
import GlassSection from '../../components/GlassSection';

const HERO_HEIGHT = 220;

/* ── Static data (will come from API later) ──────────────── */

type Stage = {
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'pending';
};

const STAGES: Stage[] = [
  { title: 'יסודות וחפירה', subtitle: 'הושלם • ינואר 2025', status: 'completed' },
  { title: 'שלד ובטון', subtitle: 'הושלם • אפריל 2025', status: 'completed' },
  { title: 'סיום שלד וטיח', subtitle: 'בתהליך • צפי אוגוסט 2025', status: 'current' },
  { title: 'גמרים ומסירה', subtitle: 'ממתין • צפי דצמבר 2025', status: 'pending' },
];

type Update = { title: string; date: string; recent: boolean };

const UPDATES: Update[] = [
  { title: 'יציקת בטון קומה 8 הושלמה', date: 'לפני 3 ימים', recent: true },
  { title: 'התקנת מערכות חשמל קומות 1-5', date: 'לפני שבוע', recent: true },
  { title: 'בדיקת איטום גג בוצעה בהצלחה', date: 'לפני שבועיים', recent: false },
];

type TeamMember = { name: string; role: string };

const TEAM: TeamMember[] = [
  { name: 'דוד כהן', role: 'מנהל פרויקט' },
  { name: 'יוסי לוי', role: 'מהנדס ביצוע' },
];

/* ── Component ───────────────────────────────── */

export default function ProjectProgressScreen() {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollY = useRef(new Animated.Value(0)).current;

  const heroScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [2, 1],
    extrapolateRight: 'clamp',
  });

  const projectId = Number(id);
  const { state } = useApi(() => projectsApi.get(projectId), [projectId]);

  if (state.status !== 'success') {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const project: Project = state.data;
  const pct = project.percentage;

  const stats = [
    { icon: 'calendar' as const, value: '18', label: 'חודשי בנייה', sub: 'מתוך 24' },
    { icon: 'people' as const, value: '4', label: 'אנשי צוות', sub: 'פעילים' },
    { icon: 'document-text' as const, value: String(project.documents.length || 12), label: 'מסמכים', sub: 'עדכניים' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={StyleSheet.absoluteFill} />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Animated.View style={{ width: '100%', height: HERO_HEIGHT, transform: [{ scale: heroScale }] }}>
            {project.project_image_url ? (
              <Image source={{ uri: project.project_image_url }} style={styles.heroImage} resizeMode="cover" />
            ) : (
              <LinearGradient colors={['#1a2a1a', '#2a3a2a']} style={styles.heroImage} />
            )}
          </Animated.View>
          <LinearGradient
            colors={['transparent', `${colors.bgDeep}CC`, colors.bgDeep]}
            style={styles.heroGradient}
          />

          {/* Info Card */}
          <View style={styles.infoCard}>
            <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={styles.infoCardContent}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>{project.type ?? 'בבנייה'}</Text>
              </View>
              <Text style={styles.heroTitle}>{project.title}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={14} color={colors.textWhite50} />
                <Text style={styles.locText}>{project.project_address}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Progress Overview */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="bar-chart" size={18} color={colors.primary} />
              <Text style={styles.sectionHeaderText}>סקירת התקדמות</Text>
            </View>
            <View style={styles.percentRow}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.percentValue}>{pct}%</Text>
                <Text style={styles.percentLabel}>הושלם מתוך הפרויקט</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[colors.primary, '#f0d080', colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]}
              />
            </View>
          </View>

          {/* Stages */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="list" size={18} color={colors.primary} />
              <Text style={styles.sectionHeaderText}>שלבי הבנייה</Text>
            </View>
            {STAGES.map((stage, i) => (
              <View key={i}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.stageRow}>
                  <View style={styles.stageInfo}>
                    <Text style={[styles.stageTitle, stage.status === 'pending' && { color: colors.textWhite50 }]}>
                      {stage.title}
                    </Text>
                    <Text style={[
                      styles.stageSub,
                      stage.status === 'completed' && { color: colors.success },
                      stage.status === 'current' && { color: colors.primary },
                      stage.status === 'pending' && { color: colors.textWhite25 },
                    ]}>
                      {stage.subtitle}
                    </Text>
                  </View>
                  {stage.status === 'completed' && (
                    <View style={[styles.stageIndicator, { backgroundColor: colors.success }]}>
                      <Ionicons name="checkmark" size={14} color={colors.bgDeep} />
                    </View>
                  )}
                  {stage.status === 'current' && (
                    <View style={[styles.stageIndicator, { backgroundColor: colors.primary }]}>
                      <Ionicons name="reload" size={14} color={colors.bgDeep} />
                    </View>
                  )}
                  {stage.status === 'pending' && (
                    <View style={[styles.stageIndicator, { borderWidth: 2, borderColor: colors.borderMedium }]} />
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Ionicons name={s.icon} size={18} color={colors.primary} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>

          {/* Recent Updates */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={styles.sectionHeaderText}>עדכונים אחרונים</Text>
            </View>
            {UPDATES.map((upd, i) => (
              <View key={i}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.updateRow}>
                  <View style={styles.updateInfo}>
                    <Text style={styles.updateTitle}>{upd.title}</Text>
                    <Text style={styles.updateDate}>{upd.date}</Text>
                  </View>
                  <View style={[styles.updateDot, { backgroundColor: upd.recent ? colors.primary : colors.textWhite25 }]} />
                </View>
              </View>
            ))}
          </View>

          {/* Team */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="people" size={18} color={colors.primary} />
              <Text style={styles.sectionHeaderText}>צוות הפרויקט</Text>
            </View>
            {TEAM.map((member, i) => (
              <View key={i}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.memberRow}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                  </View>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>{member.name.charAt(0)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      <FloatingBackButton />
    </View>
  );
}

/* ── Styles ──────────────────────────────────── */

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 40 },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bgDeep,
    },

    // Hero
    heroContainer: { height: HERO_HEIGHT, position: 'relative' },
    heroImage: { width: '100%', height: HERO_HEIGHT },
    heroGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: HERO_HEIGHT,
    },
    infoCard: {
      position: 'absolute',
      bottom: -40,
      left: 16,
      right: 16,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderGold,
    },
    infoCardContent: {
      padding: 16,
      alignItems: 'flex-end',
      gap: 6,
    },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
    badgeText: { fontFamily: Fonts.manrope.semiBold, fontSize: 12, color: colors.success },
    heroTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 22,
      color: colors.textWhite,
      textAlign: 'right',
    },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locText: { fontFamily: Fonts.heebo.regular, fontSize: 14, color: colors.textWhite70 },

    // Body
    body: { paddingTop: 56, paddingHorizontal: 20, gap: 16 },

    glassCard: {
      backgroundColor: colors.glass20,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: 14,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
    sectionHeaderText: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 16,
      color: colors.textWhite,
    },
    divider: { height: 1, backgroundColor: colors.borderLight },

    // Progress Overview
    percentRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      width: '100%',
    },
    percentValue: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: 48,
      color: colors.primary,
    },
    percentLabel: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 13,
      color: colors.textWhite50,
      textAlign: 'right',
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.glass20,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: { height: 8, borderRadius: 4 },

    // Stages
    stageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
    },
    stageInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
    stageTitle: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 14,
      color: colors.textWhite,
    },
    stageSub: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 12,
      color: colors.textWhite50,
    },
    stageIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Stats Row
    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: {
      flex: 1,
      backgroundColor: colors.glass20,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.borderLight,
      height: 110,
      alignItems: 'flex-end',
      gap: 4,
    },
    statValue: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: 28,
      color: colors.textWhite,
    },
    statLabel: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 12,
      color: colors.textWhite50,
      textAlign: 'right',
    },
    statSub: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 11,
      color: colors.success,
    },

    // Updates
    updateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
    },
    updateInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
    updateTitle: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 13,
      color: colors.textWhite,
    },
    updateDate: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 12,
      color: colors.textWhite50,
    },
    updateDot: { width: 8, height: 8, borderRadius: 4 },

    // Team
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
    },
    memberInfo: { flex: 1, alignItems: 'flex-end', gap: 1 },
    memberName: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 14,
      color: colors.textWhite,
    },
    memberRole: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 12,
      color: colors.textWhite50,
    },
    memberAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.glass60,
      borderWidth: 1,
      borderColor: colors.borderMedium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberInitial: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 14,
      color: colors.primary,
    },
  });
