import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing['3xl'], gap: Spacing['3xl'], paddingTop: Spacing.xs, paddingBottom: Spacing.xl },

  // -- Header --
  headerArea: {},
  header: {
    height: Height.buttonXl,
    borderRadius: Radius['3xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    overflow: 'hidden',
    backgroundColor: colors.glass60,
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.xl,
    color: colors.textWhite,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- Filter bar --
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.md,
    borderRadius: Radius['4xl'],
    backgroundColor: colors.glass60,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.base,
    color: colors.textWhite,
  },
  chipTextActive: {
    color: colors.bgDark,
  },

  // -- Deals list --
  dealsList: { flex: 1 },
  dealsContent: { gap: Spacing.md },

  // -- FAB --
  fab: {
    position: 'absolute',
    bottom: Spacing['5xl'],
    left: Spacing['4xl'],
    width: 56,
    height: 56,
    borderRadius: Radius['6xl'],
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c8a455',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },

  // -- States --
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
