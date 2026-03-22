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
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { dealsApi, type Deal } from '../../services/api';
import { DealsMetricsCard, DealRowItem } from '../../components/Admin';
import { makeStyles } from './styles/deals.styles';

const SUCCESS     = '#34d399';
const ERROR       = '#f87171';

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
    case 'Completed': return '#c8a455';
    case 'Cancelled': return ERROR;
    default:          return '#ffffff80';
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
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
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
              <Ionicons name="chevron-back" size={18} color={colors.textWhite50} />
            </View>
            <Text style={s.headerTitle}>עסקאות פעילות</Text>
            {/* right slot — empty to balance */}
            <View style={s.iconBtn} />
          </View>
        </View>

        {/* ── Main Metrics card ── */}
        <DealsMetricsCard
          totalValue={formatPrice(totalValue)}
          trendPercent="+8.2%"
          completionRate={completionRate}
          dealCount={allDeals.length}
          conversionRate={conversionRate}
        />

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

        {/* ── Deals Table ── */}
        {state.status === 'loading' && !refreshing ? (
          <View style={s.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <ScrollView
            style={s.dealsList}
            contentContainerStyle={s.dealsContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          >
            {deals.map((deal) => (
              <DealRowItem
                key={deal.id}
                name={deal.apartment?.apartment_specific_address || 'דירה'}
                subtitle={[deal.apartment?.project?.project_address, deal.user?.full_name]
                  .filter(Boolean).join(' · ')}
                price={formatDealPrice(deal.apartment?.price)}
                statusLabel={getDealStatusLabel(deal.status)}
                statusColor={getDealStatusColor(deal.status)}
                onPress={() => router.push(`/admin/deal/${deal.id}` as never)}
              />
            ))}
            <View style={{ height: 120 }} />
          </ScrollView>
        )}

        {/* FAB — Create Deal */}
        <TouchableOpacity
          style={s.fab}
          activeOpacity={0.85}
          onPress={() => router.push('/admin/create-deal' as never)}
        >
          <Ionicons name="add" size={28} color={colors.bgDark} />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}
