import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface DealsMetricsCardProps {
  totalValue: string;
  trendPercent: string;
  completionRate: number;
  dealCount: number;
  conversionRate: number;
}

export default function DealsMetricsCard({
  totalValue,
  trendPercent,
  completionRate,
  dealCount,
  conversionRate,
}: DealsMetricsCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.metricsCard}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

      {/* Total value */}
      <View style={styles.valCol}>
        <Text style={styles.valLabel}>{"סה\"כ ערך עסקאות"}</Text>
        <View style={styles.valRow}>
          <View style={styles.trendBadge}>
            <Text style={styles.trendTxt}>{trendPercent}</Text>
          </View>
          <Text style={styles.valTxt}>{totalValue}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>{completionRate}% השלמה</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
        </View>
      </View>

      {/* Small metric cards */}
      <View style={styles.smCardsRow}>
        <View style={styles.smCard}>
          <Ionicons name="document-outline" size={20} color={colors.primary} />
          <Text style={styles.smVal}>{dealCount}</Text>
          <Text style={styles.smLbl}>עסקאות</Text>
        </View>
        <View style={styles.smCard}>
          <Ionicons name="trending-up" size={20} color={colors.primary} />
          <Text style={styles.smVal}>{conversionRate}%</Text>
          <Text style={styles.smLbl}>יחס המרה</Text>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    metricsCard: {
      borderRadius: Radius['5xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.glass20,
      padding: Spacing['3xl'],
      gap: Spacing.xl,
    },
    valCol: { gap: Spacing.xs },
    valLabel: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite70,
      textAlign: 'right',
    },
    valRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      justifyContent: 'flex-end',
    },
    trendBadge: {
      borderRadius: Radius.sm,
      backgroundColor: colors.primaryDim,
      paddingHorizontal: Spacing.md,
      paddingVertical: 3,
    },
    trendTxt: {
      fontFamily: Fonts.heebo.bold,
      fontSize: FontSize.xs,
      color: colors.success,
    },
    valTxt: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['8xl'],
      color: colors.textWhite,
    },
    progressSection: { gap: Spacing.sm, alignItems: 'flex-end' },
    progressLabel: {
      fontFamily: Fonts.heebo.medium,
      fontSize: FontSize.xs,
      color: colors.textWhite70,
    },
    progressBg: {
      width: '100%',
      height: Spacing.lg,
      borderRadius: Spacing.sm,
      backgroundColor: colors.glass20,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: Spacing.sm,
      backgroundColor: colors.primary,
    },
    smCardsRow: { flexDirection: 'row', gap: Spacing.lg },
    smCard: {
      flex: 1,
      borderRadius: Radius['2xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.glass20,
      padding: Spacing.xl,
      gap: Spacing.sm,
      alignItems: 'center',
    },
    smVal: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['4xl'],
      color: colors.textWhite,
    },
    smLbl: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.xs,
      color: colors.textWhite50,
    },
  });
