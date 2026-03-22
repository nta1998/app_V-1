import { View, Text } from 'react-native';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import type { Deal } from '../../services/api';

const DEAL_STATUS_LABELS: Record<Deal['status'], string> = {
  Active: '\u05E4\u05E2\u05D9\u05DC',
  Completed: '\u05D4\u05D5\u05E9\u05DC\u05DD',
  Cancelled: '\u05D1\u05D5\u05D8\u05DC',
};

const DEAL_STATUS_COLORS: Record<Deal['status'], string> = {
  Active: '#22c55e',
  Completed: '#3b82f6',
  Cancelled: '#ef4444',
};

interface TransactionDealHeaderProps {
  deal: Deal;
}

export default function TransactionDealHeader({ deal }: TransactionDealHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const statusColor = DEAL_STATUS_COLORS[deal.status];

  return (
    <View style={styles.dealHeader}>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor + '44' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusBadgeText, { color: statusColor }]}>
          {DEAL_STATUS_LABELS[deal.status]}
        </Text>
      </View>
      <Text style={styles.dealTitle}>
        {deal.project?.title ?? deal.apartment?.apartment_specific_address ?? `\u05E2\u05E1\u05E7\u05D4 #${deal.id}`}
      </Text>
      <Text style={styles.dealDate}>
        {new Date(deal.created_at).toLocaleDateString('he-IL')}
      </Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => ({
  dealHeader: {
    padding: Spacing['3xl'],
    gap: Spacing.sm,
    alignItems: 'flex-end' as const,
  },
  statusBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 3,
  },
  statusDot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.base,
  },
  dealTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['3xl'],
    color: colors.textWhite,
    textAlign: 'right' as const,
  },
  dealDate: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.base,
    color: colors.textWhite50,
  },
});
