import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: Spacing['3xl'], gap: Spacing.xl },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.md,
      gap: Spacing.lg,
    },
    headerTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['8xl'],
      color: colors.textWhite,
      textAlign: 'right',
    },
    headerBadge: {
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xxs,
      minWidth: Spacing['4xl'],
      alignItems: 'center',
    },
    headerBadgeText: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.xs,
      color: colors.bgDeep,
    },

    // Scroll
    scrollWrap: { flex: 1 },
    scrollContent: { gap: Spacing.md, paddingBottom: Spacing.md },
  });
