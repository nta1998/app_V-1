import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../../constants/theme';
import { Spacing, Radius, FontSize } from '../../../../constants/tokens';

const HERO_HEIGHT = 220;

export const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 40 },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bgDeep,
    },

    // Hero
    heroContainer: { height: HERO_HEIGHT, position: 'relative' },
    heroImage: { width: '100%', height: HERO_HEIGHT },
    heroGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: HERO_HEIGHT,
    },
    infoCard: {
      position: 'absolute',
      bottom: -40,
      left: Spacing['3xl'],
      right: Spacing['3xl'],
      borderRadius: Radius['4xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderGold,
    },
    infoCardContent: {
      padding: Spacing['3xl'],
      alignItems: 'flex-end',
      gap: Spacing.sm,
    },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
    badgeText: { fontFamily: Fonts.manrope.semiBold, fontSize: FontSize.sm, color: colors.success },
    heroTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['5xl'],
      color: colors.textWhite,
      textAlign: 'right',
    },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    locText: { fontFamily: Fonts.heebo.regular, fontSize: FontSize.md, color: colors.textWhite70 },

    // Body
    body: { paddingTop: 56, paddingHorizontal: Spacing['4xl'], gap: Spacing['3xl'] },

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
    divider: { height: 1, backgroundColor: colors.borderLight },

    // Stats Row
    statsRow: { flexDirection: 'row', gap: Spacing.lg },
    statCard: {
      flex: 1,
      backgroundColor: colors.glass20,
      borderRadius: Radius['2xl'],
      padding: Spacing['2xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      height: 120,
      alignItems: 'flex-end',
      gap: Spacing.xs,
    },
    statValue: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: FontSize['8xl'],
      color: colors.textWhite,
    },
    statLabel: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
      textAlign: 'right',
    },
    statSub: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.xs,
      color: colors.success,
    },

    // Team
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.xl,
    },
    memberInfo: { flex: 1, alignItems: 'flex-end', gap: 1 },
    memberName: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.md,
      color: colors.textWhite,
    },
    memberRole: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
    },
    memberAvatar: {
      width: 36,
      height: 36,
      borderRadius: Radius['3xl'],
      backgroundColor: colors.glass60,
      borderWidth: 1,
      borderColor: colors.borderMedium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberInitial: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.md,
      color: colors.primary,
    },
  });
