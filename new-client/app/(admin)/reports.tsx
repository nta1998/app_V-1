import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { dealsApi, projectsApi, auth, type Deal, type Project, type User } from '../../services/api';
import { Fonts } from '../../constants/theme';

function computeReports(deals: Deal[], projects: Project[], users: User[]) {
  const activeDeals = deals.filter((d) => d.status === 'Active');
  const completedDeals = deals.filter((d) => d.status === 'Completed');

  // KPIs
  const totalValue = activeDeals.reduce((sum, d) => {
    const price = parseFloat(d.apartment?.price || '0');
    return sum + (isNaN(price) ? 0 : price);
  }, 0);
  const pendingTransactions = activeDeals.reduce((sum, d) => {
    return sum + (d.transactions?.filter((t) => t.status === 'WAITING_APPROVAL').length || 0);
  }, 0);

  // Chart bars — deals per project (up to 6 projects)
  const projectDealCounts = projects.slice(0, 6).map((p) => {
    const count = deals.filter((d) => d.project?.id === p.id || d.apartment?.project?.id === p.id).length;
    return count;
  });
  const maxCount = Math.max(...projectDealCounts, 1);
  const bars = projectDealCounts.map((count, i) => ({
    height: Math.max(20, (count / maxCount) * 140),
    solid: count > 0,
    opacity: 0.4 + (count / maxCount) * 0.6,
  }));

  // Deal stage progress
  const allTransactions = deals.flatMap((d) => d.transactions || []);
  const totalTx = allTransactions.length || 1;
  const initialPct = Math.round((allTransactions.filter((t) => t.stage === 'INITIAL' || t.stage === 'IN_PROGRESS').length / totalTx) * 100);
  const pendingPct = Math.round((allTransactions.filter((t) => t.stage === 'PENDING').length / totalTx) * 100);
  const completedPct = Math.round((allTransactions.filter((t) => t.stage === 'COMPLETED').length / totalTx) * 100);

  const progress = [
    { label: 'בטיפול', value: initialPct },
    { label: 'ממתין לאישור', value: pendingPct },
    { label: 'הושלם', value: completedPct },
  ];

  // Insights from real data
  const insights: string[] = [];
  if (deals.length > 0) {
    insights.push(`${activeDeals.length} עסקאות פעילות מתוך ${deals.length} סה"כ`);
  }
  if (completedDeals.length > 0) {
    insights.push(`${completedDeals.length} עסקאות הושלמו`);
  }
  insights.push(`${projects.length} פרויקטים פעילים, ${users.length} משתמשים רשומים`);

  return { totalValue, activeCount: activeDeals.length, pendingTransactions, bars, progress, insights };
}

export default function AdminReportsScreen() {
  const { mode } = useTheme();
  const blurTint = mode === 'dark' ? 'dark' : 'light';

  const { state: dealsState } = useApi(dealsApi.list);
  const { state: projectsState } = useApi(projectsApi.list);
  const { state: usersState } = useApi(auth.listUsers);

  const isLoading = dealsState.status === 'loading' || dealsState.status === 'idle'
    || projectsState.status === 'loading' || projectsState.status === 'idle'
    || usersState.status === 'loading' || usersState.status === 'idle';

  const deals: Deal[] = dealsState.status === 'success' ? dealsState.data : [];
  const projects: Project[] = projectsState.status === 'success' ? projectsState.data : [];
  const users: User[] = usersState.status === 'success' ? usersState.data : [];

  const report = useMemo(() => computeReports(deals, projects, users), [deals, projects, users]);

  return (
    <LinearGradient
      colors={['#221f10', '#0e0d07']}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <BlurView intensity={30} tint={blurTint} style={s.header}>
          <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#ffffffB3" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>דוחות ונתונים</Text>
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="options-outline" size={20} color="#ffffffB3" />
          </TouchableOpacity>
        </BlurView>

        {/* KPI section title — fixed */}
        <Text style={s.sectionTitle}>מדדי ביצוע</Text>

        {isLoading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color="#c8a455" size="large" />
          </View>
        ) : (
        <ScrollView
          style={s.scrollWrap}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* KPI row */}
          <View style={s.kpiRow}>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>שווי עסקאות פעילות</Text>
              <Text style={s.kpiValue}>₪{report.totalValue.toLocaleString('he-IL')}</Text>
              <Text style={[s.kpiDelta, { color: '#34d399' }]}>{report.activeCount} עסקאות פעילות</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>ממתינים לאישור</Text>
              <Text style={s.kpiValue}>{report.pendingTransactions}</Text>
              <Text style={[s.kpiDelta, { color: '#c8a455' }]}>שלבי עסקה בהמתנה</Text>
            </View>
          </View>

          {/* Chart card — deals per project */}
          <View style={s.chartCard}>
            <View style={s.chartHead}>
              <Text style={s.chartRange}>עסקאות לפי פרויקט</Text>
              <Text style={s.chartTitle}>התפלגות עסקאות</Text>
            </View>
            <View style={s.plot}>
              {report.bars.length > 0 ? (
                report.bars.map((bar, i) => (
                  <View
                    key={i}
                    style={[
                      s.bar,
                      bar.solid
                        ? { backgroundColor: '#c8a455', opacity: bar.opacity }
                        : s.barDim,
                      { height: bar.height },
                    ]}
                  />
                ))
              ) : (
                <Text style={s.emptyChart}>אין נתונים להצגה</Text>
              )}
            </View>
          </View>

          {/* Deal stage progress */}
          <View style={s.card}>
            <Text style={s.cardTitle}>התקדמות בעסקאות</Text>
            {report.progress.map((row) => (
              <View key={row.label} style={s.progressRow}>
                <View style={s.progressHeader}>
                  <Text style={s.progressValue}>{row.value}%</Text>
                  <Text style={s.progressLabel}>{row.label}</Text>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: `${row.value}%` }]} />
                </View>
              </View>
            ))}
          </View>

          {/* Insights */}
          <View style={s.card}>
            <Text style={s.cardTitle}>סיכום נתונים</Text>
            {report.insights.map((text, i) => (
              <Text key={i} style={s.insightText}>• {text}</Text>
            ))}
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16, gap: 14 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ffffff14',
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 18,
    color: '#ffffff',
  },

  // Scroll
  scrollWrap: { flex: 1 },
  scrollContent: { gap: 14, paddingBottom: 8 },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  dateRange: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    backgroundColor: '#ffffff1A',
    borderWidth: 1,
    borderColor: '#ffffff2E',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateRangeText: {
    fontFamily: Fonts.heebo.medium,
    fontSize: 12,
    color: '#ffffff',
  },
  filterQuick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterQuickText: {
    fontFamily: Fonts.heebo.medium,
    fontSize: 12,
    color: '#ffffffB3',
  },

  // Section title
  sectionTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'right',
  },

  // KPI
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiCard: {
    flex: 1,
    height: 104,
    borderRadius: 18,
    backgroundColor: '#ffffff1A',
    borderWidth: 1,
    borderColor: '#ffffff2E',
    padding: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  kpiLabel: {
    fontFamily: Fonts.heebo.medium,
    fontSize: 12,
    color: '#ffffffB3',
    textAlign: 'right',
  },
  kpiValue: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'right',
  },
  kpiDelta: {
    fontFamily: Fonts.heebo.medium,
    fontSize: 11,
    textAlign: 'right',
  },

  // Chart
  chartCard: {
    borderRadius: 20,
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff2E',
    padding: 12,
    gap: 10,
  },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  chartRange: {
    fontFamily: Fonts.heebo.medium,
    fontSize: 12,
    color: '#ffffff80',
  },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 150,
    backgroundColor: '#ffffff1A',
    borderWidth: 1,
    borderColor: '#ffffff14',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 8,
  },
  bar: {
    flex: 1,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  barDim: {
    backgroundColor: '#c8a45526',
    borderWidth: 1,
    borderColor: '#c8a45559',
  },
  emptyChart: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 13,
    color: '#ffffff80',
    textAlign: 'center',
    flex: 1,
    alignSelf: 'center',
  },

  // Generic card
  card: {
    borderRadius: 18,
    backgroundColor: '#ffffff1A',
    borderWidth: 1,
    borderColor: '#ffffff2E',
    padding: 12,
    gap: 10,
  },
  cardTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'right',
  },

  // Progress bars
  progressRow: { gap: 6 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: Fonts.heebo.medium,
    fontSize: 12,
    color: '#ffffffB3',
  },
  progressValue: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 12,
    color: '#c8a455',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff1A',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#c8a455',
  },

  // Insights
  insightText: {
    fontFamily: Fonts.heebo.medium,
    fontSize: 12,
    color: '#ffffffB3',
    textAlign: 'right',
    lineHeight: 20,
  },
});
