import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing['4xl'], paddingTop: Spacing.xl, gap: Spacing['4xl'] },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.glass60,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Spacing.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.xs,
    color: colors.bgDark,
  },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  greetingText: { alignItems: 'flex-end', gap: 2 },
  greetingSmall: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.md,
    color: colors.textWhite,
    textAlign: 'right',
  },
  greetingName: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize['5xl'],
    color: colors.textWhite,
    textAlign: 'right',
  },
  avatar: {
    width: Height.avatarXl,
    height: Height.avatarXl,
    borderRadius: 22,
    backgroundColor: colors.bgDark,
    borderWidth: 2,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: Height.avatarXl,
    height: Height.avatarXl,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.borderGold,
  },
  avatarText: { fontFamily: Fonts.manrope.bold, fontSize: FontSize['3xl'], color: colors.primary },

  // Stat Strip
  statStrip: { flexDirection: 'row', gap: Spacing.lg },

  // Loading / empty states
  loadingCard: {
    borderRadius: Radius['6xl'],
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: colors.glass20,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['5xl'],
  },
  emptyCard: { gap: Spacing.xl },
  emptyText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.xl,
    color: colors.textWhite50,
  },
});
