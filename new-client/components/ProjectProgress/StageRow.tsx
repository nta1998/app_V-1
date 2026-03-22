import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

export type StageStatus = 'completed' | 'current' | 'pending';

interface StageRowProps {
  title: string;
  subtitle: string;
  status: StageStatus;
  showDivider: boolean;
}

export default function StageRow({ title, subtitle, status, showDivider }: StageRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View>
      {showDivider && <View style={styles.divider} />}
      <View style={styles.stageRow}>
        <View style={styles.stageInfo}>
          <Text style={[styles.stageTitle, status === 'pending' && { color: colors.textWhite50 }]}>
            {title}
          </Text>
          <Text style={[
            styles.stageSub,
            status === 'completed' && { color: colors.success },
            status === 'current' && { color: colors.primary },
            status === 'pending' && { color: colors.textWhite25 },
          ]}>
            {subtitle}
          </Text>
        </View>
        {status === 'completed' && (
          <View style={[styles.stageIndicator, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={14} color={colors.bgDeep} />
          </View>
        )}
        {status === 'current' && (
          <View style={[styles.stageIndicator, { backgroundColor: colors.primary }]}>
            <Ionicons name="reload" size={14} color={colors.bgDeep} />
          </View>
        )}
        {status === 'pending' && (
          <View style={[styles.stageIndicator, { borderWidth: 2, borderColor: colors.borderMedium }]} />
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    divider: { height: 1, backgroundColor: colors.borderLight },
    stageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.xl,
    },
    stageInfo: { flex: 1, alignItems: 'flex-end', gap: Spacing.xxs },
    stageTitle: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.md,
      color: colors.textWhite,
    },
    stageSub: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
    },
    stageIndicator: {
      width: Spacing['5xl'],
      height: Spacing['5xl'],
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
