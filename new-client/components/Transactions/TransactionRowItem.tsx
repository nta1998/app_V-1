import { View, Text } from 'react-native';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import type { DealTransaction } from '../../services/api';

const STATUS_COLORS: Record<DealTransaction['status'], string> = {
  WAITING_CLIENT: '#f59e0b',
  WAITING_APPROVAL: '#3b82f6',
  DONE: '#22c55e',
};

const STATUS_LABELS: Record<DealTransaction['status'], string> = {
  WAITING_CLIENT: '\u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05DC\u05E7\u05D5\u05D7',
  WAITING_APPROVAL: '\u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8',
  DONE: '\u05D4\u05D5\u05E9\u05DC\u05DD',
};

interface TransactionRowItemProps {
  transaction: DealTransaction;
  showSeparator: boolean;
}

export default function TransactionRowItem({ transaction, showSeparator }: TransactionRowItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View>
      <View style={styles.txRow}>
        <View style={[styles.txStatusDot, { backgroundColor: STATUS_COLORS[transaction.status] }]} />
        <View style={styles.txInfo}>
          <Text style={styles.txStage}>{transaction.stage_display}</Text>
          <Text style={styles.txStatus}>{STATUS_LABELS[transaction.status]}</Text>
        </View>
        {transaction.completion_date && (
          <Text style={styles.txDate}>
            {new Date(transaction.completion_date).toLocaleDateString('he-IL')}
          </Text>
        )}
      </View>
      {showSeparator && <View style={styles.txSeparator} />}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => ({
  txRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  txStatusDot: {
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Radius.xs,
    flexShrink: 0,
  },
  txInfo: {
    flex: 1,
    alignItems: 'flex-end' as const,
    gap: Spacing.xxs,
  },
  txStage: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.md,
    color: colors.textWhite,
    textAlign: 'right' as const,
  },
  txStatus: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.sm,
    color: colors.textWhite50,
  },
  txDate: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.sm,
    color: colors.textWhite50,
    flexShrink: 0,
  },
  txSeparator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: Spacing['3xl'],
  },
});
