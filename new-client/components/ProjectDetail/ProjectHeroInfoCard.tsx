import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface ProjectHeroInfoCardProps {
  type: string | null;
  title: string;
  address: string;
  percentage: number;
}

export default function ProjectHeroInfoCard({
  type,
  title,
  address,
  percentage,
}: ProjectHeroInfoCardProps) {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.heroInfoCard}>
      <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={styles.heroInfoContent}>
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>{type ?? 'פרויקט'}</Text>
        </View>
        <Text style={styles.heroTitle}>{title}</Text>
        <View style={styles.locationRow}>
          <Text style={styles.locationText}>{address}</Text>
          <Ionicons name="location-outline" size={14} color={colors.primary} />
        </View>
        <View style={styles.heroProgressBar}>
          <View
            style={[
              styles.heroProgressFill,
              { width: `${Math.min(percentage, 100)}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    heroInfoCard: {
      position: 'absolute',
      bottom: Spacing['3xl'],
      left: Spacing['3xl'],
      right: Spacing['3xl'],
      borderRadius: Radius['5xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderGold,
    },
    heroInfoContent: { padding: Spacing['3xl'], alignItems: 'flex-end' },
    newBadge: {
      backgroundColor: colors.primary,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xs,
      marginBottom: Spacing.md,
      alignSelf: 'flex-end',
    },
    newBadgeText: { fontFamily: Fonts.manrope.bold, fontSize: FontSize.sm, color: colors.bgDark },
    heroTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['4xl'],
      color: colors.textWhite,
      textAlign: 'right',
      marginBottom: Spacing.sm,
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
    locationText: { fontFamily: Fonts.heebo.regular, fontSize: FontSize.base, color: colors.textWhite70 },
    heroProgressBar: {
      height: Spacing.xs,
      backgroundColor: colors.borderLight,
      borderRadius: Spacing.xxs,
      overflow: 'hidden',
      width: '100%',
    },
    heroProgressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: Spacing.xxs },
  });
