import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Header
  headerWrapper: {
    height: Height.buttonXl,
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    marginHorizontal: Spacing['3xl'],
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: {
    flex: 1,
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['3xl'],
    color: colors.textWhite,
    textAlign: 'center',
  },

  // Filters
  filtersWrapper: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
    flexGrow: 0,
  },
  filtersRow: {
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.md,
    borderRadius: Radius['4xl'],
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.base,
    lineHeight: 16,
    color: colors.textWhite,
    textAlign: 'center',
    includeFontPadding: false,
  },
  chipTextActive: {
    color: colors.bgDark,
  },

  // States
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  emptyText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize['2xl'],
    color: colors.textWhite50,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing['5xl'],
    paddingVertical: Spacing.lg,
  },
  retryText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.xl,
    color: colors.bgDark,
  },

  // Card list
  listContent: {
    paddingHorizontal: Spacing['3xl'],
    paddingTop: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing['3xl'],
  },
  columnWrapper: {
    gap: Spacing['3xl'],
  },
});
