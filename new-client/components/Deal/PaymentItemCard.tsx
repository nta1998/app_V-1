import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import type { Payment } from '../../services/api';

const PAYMENT_STATUS_CONFIG: Record<Payment['status'], { label: string; color: string }> = {
  paid: { label: '\u05E9\u05D5\u05DC\u05DD', color: '#22c55e' },
  pending: { label: '\u05DE\u05DE\u05EA\u05D9\u05DF', color: '#f59e0b' },
  upcoming: { label: '\u05E2\u05EA\u05D9\u05D3\u05D9', color: '#6b7280' },
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `\u20AA${num.toLocaleString('he-IL')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('he-IL');
}

interface PaymentItemCardProps {
  payment: Payment;
}

export default function PaymentItemCard({ payment }: PaymentItemCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const config = PAYMENT_STATUS_CONFIG[payment.status];

  return (
    <View style={[styles.paymentItem, { borderLeftColor: config.color }]}>
      <View style={styles.paymentHeader}>
        <View style={[styles.paymentStatusBadge, { backgroundColor: config.color + '22' }]}>
          <Text style={[styles.paymentStatusText, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={styles.paymentNumber}>#{payment.payment_number}</Text>
      </View>
      <Text style={styles.paymentDescription}>{payment.description}</Text>
      <View style={styles.paymentFooter}>
        <Text style={styles.paymentDate}>{formatDate(payment.due_date)}</Text>
        <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    paymentItem: {
      backgroundColor: colors.glass20,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderLeftWidth: 3,
      gap: Spacing.sm,
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentNumber: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.md,
      color: colors.textWhite,
    },
    paymentStatusBadge: {
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xxs,
    },
    paymentStatusText: {
      fontFamily: Fonts.heebo.medium,
      fontSize: FontSize.sm,
    },
    paymentDescription: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.base,
      color: colors.textWhite70,
      textAlign: 'right',
    },
    paymentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentDate: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
    },
    paymentAmount: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: FontSize.xl,
      color: colors.textWhite,
    },
  });
