import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../../constants/theme';
import { Spacing, Radius, FontSize } from '../../../../constants/tokens';

const HERO_HEIGHT = 600;

export const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgDark,
    },
    scrollContent: {
      flexGrow: 1,
    },

    // ========== HERO ==========
    hero: {
      height: HERO_HEIGHT,
      width: '100%',
      position: 'relative',
    },
    heroImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#00000040',
    },
    heroGradientBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 300,
    },
    heroContent: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      alignItems: 'flex-end',
      paddingHorizontal: Spacing['4xl'],
      gap: Spacing.md,
    },
    heroName: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['8xl'],
      color: colors.textWhite,
    },
    roleBadge: {
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: Radius.lg,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing['2xl'],
    },
    roleBadgeText: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite,
    },

    // Quote wrapper
    quoteWrapper: {
      paddingHorizontal: Spacing['4xl'],
      paddingTop: Spacing['4xl'],
      paddingBottom: Spacing['5xl'],
      backgroundColor: colors.bgDark,
    },
  });
