import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../constants/theme';
import { Spacing, Radius, FontSize } from '../constants/tokens';
import { useTheme } from '../hooks/useTheme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  trend?: string;
};

export default function StatCard({ icon, value, label, trend }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend ? <Text style={styles.trend}>{trend}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.glass20,
      borderRadius: Radius['2xl'],
      padding: Spacing['2xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      height: 122,
      alignItems: 'flex-end',
      gap: Spacing.xs,
    },
    value: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: FontSize['7xl'],
      color: colors.textWhite,
    },
    label: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.md,
      color: colors.textWhite,
      textAlign: 'right',
    },
    trend: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.base,
      color: colors.success,
    },
  });
