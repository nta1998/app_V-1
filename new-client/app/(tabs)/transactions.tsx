import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { dealsApi, type Deal, type DealTransaction } from '../../services/api';

const STATUS_COLORS: Record<DealTransaction['status'], string> = {
  WAITING_CLIENT: '#f59e0b',
  WAITING_APPROVAL: '#3b82f6',
  DONE: '#22c55e',
};

const STATUS_LABELS: Record<DealTransaction['status'], string> = {
  WAITING_CLIENT: 'ממתין ללקוח',
  WAITING_APPROVAL: 'ממתין לאישור',
  DONE: 'הושלם',
};

const DEAL_STATUS_LABELS: Record<Deal['status'], string> = {
  Active: 'פעיל',
  Completed: 'הושלם',
  Cancelled: 'בוטל',
};

const DEAL_STATUS_COLORS: Record<Deal['status'], string> = {
  Active: '#22c55e',
  Completed: '#3b82f6',
  Cancelled: '#ef4444',
};

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state } = useApi(dealsApi.list);

  const deals: Deal[] = state.status === 'success' ? state.data : [];

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>עסקאות</Text>
        </View>

        {state.status === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}

        {state.status === 'error' && (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            <Text style={styles.emptyText}>שגיאה בטעינת הנתונים</Text>
          </View>
        )}

        {state.status === 'success' && deals.length === 0 && (
          <View style={styles.center}>
            <Ionicons name="receipt-outline" size={40} color={colors.textWhite50} />
            <Text style={styles.emptyText}>אין עסקאות להצגה</Text>
          </View>
        )}

        {state.status === 'success' && deals.length > 0 && (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {deals.map((deal) => (
              <View key={deal.id} style={styles.dealCard}>
                {/* Deal Header */}
                <View style={styles.dealHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: DEAL_STATUS_COLORS[deal.status] + '22', borderColor: DEAL_STATUS_COLORS[deal.status] + '44' }]}>
                    <View style={[styles.statusDot, { backgroundColor: DEAL_STATUS_COLORS[deal.status] }]} />
                    <Text style={[styles.statusBadgeText, { color: DEAL_STATUS_COLORS[deal.status] }]}>
                      {DEAL_STATUS_LABELS[deal.status]}
                    </Text>
                  </View>
                  <Text style={styles.dealTitle}>
                    {deal.project?.title ?? deal.apartment?.apartment_specific_address ?? `עסקה #${deal.id}`}
                  </Text>
                  <Text style={styles.dealDate}>
                    {new Date(deal.created_at).toLocaleDateString('he-IL')}
                  </Text>
                </View>

                {/* Transactions List */}
                {deal.transactions.length > 0 && (
                  <View style={styles.transactionsList}>
                    <View style={styles.separator} />
                    {deal.transactions.map((tx, idx) => (
                      <View key={tx.id}>
                        <View style={styles.txRow}>
                          <View style={[styles.txStatusDot, { backgroundColor: STATUS_COLORS[tx.status] }]} />
                          <View style={styles.txInfo}>
                            <Text style={styles.txStage}>{tx.stage_display}</Text>
                            <Text style={styles.txStatus}>{STATUS_LABELS[tx.status]}</Text>
                          </View>
                          {tx.completion_date && (
                            <Text style={styles.txDate}>
                              {new Date(tx.completion_date).toLocaleDateString('he-IL')}
                            </Text>
                          )}
                        </View>
                        {idx < deal.transactions.length - 1 && (
                          <View style={styles.txSeparator} />
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {deal.transactions.length === 0 && (
                  <View style={styles.noTxRow}>
                    <Text style={styles.noTxText}>אין עדכוני עסקה</Text>
                  </View>
                )}
              </View>
            ))}
            <View style={{ height: 110 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (colors: ThemeColors) => ({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 28,
    color: colors.textWhite,
    textAlign: 'right' as const,
  },
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 16,
    color: colors.textWhite50,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  dealCard: {
    backgroundColor: colors.glass20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden' as const,
  },
  dealHeader: {
    padding: 16,
    gap: 6,
    alignItems: 'flex-end' as const,
  },
  statusBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 13,
  },
  dealTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 18,
    color: colors.textWhite,
    textAlign: 'right' as const,
  },
  dealDate: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 13,
    color: colors.textWhite50,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  transactionsList: {
    gap: 0,
  },
  txRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  txStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  txInfo: {
    flex: 1,
    alignItems: 'flex-end' as const,
    gap: 2,
  },
  txStage: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 14,
    color: colors.textWhite,
    textAlign: 'right' as const,
  },
  txStatus: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: colors.textWhite50,
  },
  txDate: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: colors.textWhite50,
    flexShrink: 0,
  },
  txSeparator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 16,
  },
  noTxRow: {
    padding: 14,
    alignItems: 'center' as const,
  },
  noTxText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 13,
    color: colors.textWhite50,
  },
});
