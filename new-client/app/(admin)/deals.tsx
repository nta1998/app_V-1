import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { Fonts } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { dealsApi, type Deal } from '../../services/api';

// ── Design tokens (Yrb30) ────────────────────────────────────
const GOLD        = '#c8a455';
const GOLD_TINT   = '#c8a45526';
const GLASS       = '#ffffff0D';
const BORDER      = '#ffffff14';
const TEXT        = '#ffffff';
const TEXT_DIM    = '#ffffffB3';
const TEXT_MID    = '#ffffff80';
const SUCCESS     = '#34d399';
const ERROR       = '#f87171';
const DARK        = '#0e0d07';

const DEAL_FILTERS = ['פעילות', 'הכל'] as const;

function getDealStatusLabel(status: string) {
  switch (status) {
    case 'Active':    return 'פעילה';
    case 'Completed': return 'הושלמה';
    case 'Cancelled': return 'בוטלה';
    default:          return status;
  }
}

function getDealStatusColor(status: string) {
  switch (status) {
    case 'Active':    return SUCCESS;
    case 'Completed': return GOLD;
    case 'Cancelled': return ERROR;
    default:          return TEXT_MID;
  }
}

function formatPrice(num: number) {
  if (num >= 1_000_000) return `₪${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `₪${(num / 1_000).toFixed(0)}K`;
  return `₪${num.toLocaleString('he-IL')}`;
}

function formatDealPrice(price: string | null) {
  if (!price) return '';
  const num = parseFloat(price);
  if (isNaN(num)) return '';
  return `₪${num.toLocaleString('he-IL')}`;
}

export default function AdminDealsScreen() {
  const { state, refetch } = useApi(dealsApi.list);
  const [refreshing, setRefreshing]   = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('פעילות');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const allDeals: Deal[] = state.status === 'success' ? state.data : [];

  const deals = useMemo(() => {
    if (activeFilter === 'הכל') return allDeals;
    return allDeals.filter((d) => d.status === 'Active');
  }, [allDeals, activeFilter]);

  const totalValue = useMemo(() =>
    allDeals.reduce((sum, d) => {
      const p = parseFloat(d.apartment?.price || '0');
      return sum + (isNaN(p) ? 0 : p);
    }, 0),
  [allDeals]);

  const completionRate = useMemo(() => {
    if (!allDeals.length) return 0;
    return Math.round(
      (allDeals.filter((d) => d.status === 'Completed').length / allDeals.length) * 100
    );
  }, [allDeals]);

  const conversionRate = useMemo(() => {
    if (!allDeals.length) return 0;
    return Math.round(
      (allDeals.filter((d) => d.status !== 'Cancelled').length / allDeals.length) * 100
    );
  }, [allDeals]);

  return (
    <LinearGradient
      colors={['#0e0d07', '#221f10']}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={s.safeArea} edges={['top']}>

        {/* ── Header (Kj9Yx) ── */}
        <View style={s.headerArea}>
          <View style={s.header}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={s.iconBtn}>
              <Ionicons name="chevron-back" size={18} color={TEXT_MID} />
            </View>
            <Text style={s.headerTitle}>עסקאות פעילות</Text>
            {/* right slot — empty to balance */}
            <View style={s.iconBtn} />
          </View>
        </View>

        {/* ── Main Metrics card (9zHIv) ── */}
        <View style={s.metricsCard}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

          {/* Total value */}
          <View style={s.valCol}>
            <Text style={s.valLabel}>סה"כ ערך עסקאות</Text>
            <View style={s.valRow}>
              <View style={s.trendBadge}>
                <Text style={s.trendTxt}>+8.2%</Text>
              </View>
              <Text style={s.valTxt}>{formatPrice(totalValue)}</Text>
            </View>
          </View>

          {/* Progress (bPXE4) */}
          <View style={s.progressSection}>
            <Text style={s.progressLabel}>{completionRate}% השלמה</Text>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${completionRate}%` }]} />
            </View>
          </View>

          {/* Small metric cards (WzEH1) */}
          <View style={s.smCardsRow}>
            <View style={s.smCard}>
              <Ionicons name="document-outline" size={20} color={GOLD} />
              <Text style={s.smVal}>{allDeals.length}</Text>
              <Text style={s.smLbl}>עסקאות</Text>
            </View>
            <View style={s.smCard}>
              <Ionicons name="trending-up" size={20} color={GOLD} />
              <Text style={s.smVal}>{conversionRate}%</Text>
              <Text style={s.smLbl}>יחס המרה</Text>
            </View>
          </View>
        </View>

        {/* ── Filter Bar (M3z5m) ── */}
        <View style={s.filterBar}>
          {DEAL_FILTERS.map((f) => {
            const isActive = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[s.chip, isActive && s.chipActive]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
              >
                <Text style={[s.chipText, isActive && s.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Deals Table (0s01K) ── */}
        {state.status === 'loading' && !refreshing ? (
          <View style={s.centered}>
            <ActivityIndicator color={GOLD} size="large" />
          </View>
        ) : (
          <ScrollView
            style={s.dealsList}
            contentContainerStyle={s.dealsContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />
            }
          >
            {deals.map((deal) => {
              const statusColor = getDealStatusColor(deal.status);
              return (
                <TouchableOpacity
                  key={deal.id}
                  style={s.dealRow}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/admin/deal/${deal.id}` as never)}
                >
                  {/* Info — left side (RTL: visually right) */}
                  <View style={s.dealInfo}>
                    <Text style={s.dealName} numberOfLines={1}>
                      {deal.apartment?.apartment_specific_address || 'דירה'}
                    </Text>
                    <Text style={s.dealAddr} numberOfLines={1}>
                      {[deal.apartment?.project?.project_address, deal.user?.full_name]
                        .filter(Boolean).join(' · ')}
                    </Text>
                  </View>

                  {/* Price + status — right side */}
                  <View style={s.dealRight}>
                    <Text style={s.dealPrice}>
                      {formatDealPrice(deal.apartment?.price)}
                    </Text>
                    <View style={[s.statusTag, { backgroundColor: GOLD_TINT }]}>
                      <Text style={[s.statusTxt, { color: statusColor }]}>
                        {getDealStatusLabel(deal.status)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 120 }} />
          </ScrollView>
        )}

        {/* FAB — Create Deal */}
        <TouchableOpacity
          style={s.fab}
          activeOpacity={0.85}
          onPress={() => router.push('/admin/create-deal' as never)}
        >
          <Ionicons name="add" size={28} color={DARK} />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16, gap: 16, paddingTop: 4, paddingBottom: 12 },

  // ── Header (Kj9Yx) ──
  headerArea: {},
  header: {
    height: 48,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    backgroundColor: GLASS,
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 16,
    color: TEXT,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Metrics card (9zHIv) ──
  metricsCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
    padding: 16,
    gap: 12,
  },
  valCol: { gap: 4 },
  valLabel: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: TEXT_DIM,
    textAlign: 'right',
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  trendBadge: {
    borderRadius: 8,
    backgroundColor: GOLD_TINT,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trendTxt: {
    fontFamily: Fonts.heebo.bold,
    fontSize: 11,
    color: SUCCESS,
  },
  valTxt: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 28,
    color: TEXT,
  },

  // Progress (bPXE4)
  progressSection: { gap: 6, alignItems: 'flex-end' },
  progressLabel: {
    fontFamily: Fonts.heebo.medium,
    fontSize: 11,
    color: TEXT_DIM,
  },
  progressBg: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    backgroundColor: GLASS,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: GOLD,
  },

  // Small cards (WzEH1)
  smCardsRow: { flexDirection: 'row', gap: 10 },
  smCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
    padding: 12,
    gap: 6,
    alignItems: 'center',
  },
  smVal: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 20,
    color: TEXT,
  },
  smLbl: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 11,
    color: TEXT_MID,
  },

  // ── Filter bar (M3z5m) ──
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  chipText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 13,
    color: TEXT,
  },
  chipTextActive: {
    color: DARK,
  },

  // ── Deals list (0s01K) ──
  dealsList: { flex: 1 },
  dealsContent: { gap: 8 },

  // Deal row (eifka / HAckl / ...)
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
    padding: 12,
    gap: 10,
    height: 67,
  },
  dealInfo: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
  },
  dealName: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 14,
    color: TEXT,
    textAlign: 'right',
  },
  dealAddr: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: TEXT_DIM,
    textAlign: 'right',
  },
  dealRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dealPrice: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 14,
    color: TEXT,
  },
  statusTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusTxt: {
    fontFamily: Fonts.heebo.bold,
    fontSize: 11,
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c8a455',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },

  // ── States ──
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
