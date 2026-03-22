import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface KPICardProps {
  label: string;
  value: number | string;
  delta: string;
  deltaColor?: string;
}

export default function KPICard({ label, value, delta, deltaColor }: KPICardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.kpiCard}>
      <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={styles.kpiInner}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={[styles.kpiDelta, deltaColor ? { color: deltaColor } : undefined]}>
          {delta}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    kpiCard: {
      flex: 1,
      borderRadius: Radius['2xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderMedium,
      backgroundColor: colors.glass60,
    },
    kpiInner: {
      padding: Spacing.xl,
      alignItems: 'flex-end',
      gap: Spacing.xs,
    },
    kpiLabel: {
      fontFamily: Fonts.heebo.medium,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
      textAlign: 'right',
    },
    kpiValue: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['7xl'],
      color: colors.textWhite,
      textAlign: 'right',
    },
    kpiDelta: {
      fontFamily: Fonts.heebo.bold,
      fontSize: FontSize.sm,
      color: colors.primary,
      textAlign: 'right',
    },
  });
