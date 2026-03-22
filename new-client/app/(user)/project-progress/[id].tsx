import { useMemo, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { makeStyles } from './styles/projectProgress.styles';
import { useApi } from '../../../hooks/useApi';
import { projectsApi, type Project } from '../../../services/api';
import FloatingBackButton from '../../../components/FloatingBackButton';
import ProgressOverview from '../../../components/ProjectProgress/ProgressOverview';
import StageRow from '../../../components/ProjectProgress/StageRow';
import UpdateRow from '../../../components/ProjectProgress/UpdateRow';

const HERO_HEIGHT = 220;

/* -- Static data (will come from API later) -- */

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

/* -- Component -- */

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
          <ProgressOverview percentage={pct} />

          {/* Stages */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="list" size={18} color={colors.primary} />
              <Text style={styles.sectionHeaderText}>שלבי הבנייה</Text>
            </View>
            {STAGES.map((stage, i) => (
              <StageRow
                key={i}
                title={stage.title}
                subtitle={stage.subtitle}
                status={stage.status}
                showDivider={i > 0}
              />
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
              <UpdateRow
                key={i}
                title={upd.title}
                date={upd.date}
                recent={upd.recent}
                showDivider={i > 0}
              />
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

