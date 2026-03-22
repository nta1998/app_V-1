import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface ProgressOverviewProps {
  percentage: number;
}

export default function ProgressOverview({ percentage }: ProgressOverviewProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.glassCard}>
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="bar-chart" size={18} color={colors.primary} />
        <Text style={styles.sectionHeaderText}>סקירת התקדמות</Text>
      </View>
      <View style={styles.percentRow}>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.percentValue}>{percentage}%</Text>
          <Text style={styles.percentLabel}>הושלם מתוך הפרויקט</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <LinearGradient
          colors={[colors.primary, '#f0d080', colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]}
        />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    glassCard: {
      backgroundColor: colors.glass20,
      borderRadius: Radius['4xl'],
      padding: Spacing['3xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: Spacing['2xl'],
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.md,
    },
    sectionHeaderText: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.xl,
      color: colors.textWhite,
    },
    percentRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      width: '100%',
    },
    percentValue: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: 48,
      color: colors.primary,
    },
    percentLabel: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.base,
      color: colors.textWhite50,
      textAlign: 'right',
    },
    progressBar: {
      height: Spacing.md,
      backgroundColor: colors.glass20,
      borderRadius: Radius.xs,
      overflow: 'hidden',
    },
    progressFill: { height: Spacing.md, borderRadius: Radius.xs },
  });
