import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `\u20AA${num.toLocaleString('he-IL')}`;
}

interface PaymentSummarySectionProps {
  totalPayments: number;
  paidPayments: number;
  paidPercent: number;
}

export default function PaymentSummarySection({
  totalPayments,
  paidPayments,
  paidPercent,
}: PaymentSummarySectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.paymentSummary}>
      <View style={styles.paymentSummaryRow}>
        <Text style={styles.paymentSummaryLabel}>{'\u05E1\u05D4"\u05DB'}</Text>
        <Text style={styles.paymentSummaryValue}>{formatCurrency(totalPayments)}</Text>
      </View>
      <View style={styles.paymentSummaryRow}>
        <Text style={styles.paymentSummaryLabel}>{'\u05E9\u05D5\u05DC\u05DD'}</Text>
        <Text style={[styles.paymentSummaryValue, { color: '#22c55e' }]}>
          {formatCurrency(paidPayments)} ({paidPercent}%)
        </Text>
      </View>
      {/* Progress bar */}
      <View style={styles.paymentProgressBar}>
        <View style={[styles.paymentProgressFill, { width: `${paidPercent}%` }]} />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    paymentSummary: { gap: Spacing.md, marginBottom: Spacing['2xl'] },
    paymentSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentSummaryLabel: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.md,
      color: colors.textWhite50,
    },
    paymentSummaryValue: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: FontSize['3xl'],
      color: colors.textWhite,
    },
    paymentProgressBar: {
      height: Spacing.sm,
      backgroundColor: colors.glass60,
      borderRadius: 3,
      overflow: 'hidden',
    },
    paymentProgressFill: {
      height: '100%',
      backgroundColor: '#22c55e',
      borderRadius: 3,
    },
  });
