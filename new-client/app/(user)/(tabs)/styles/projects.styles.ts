import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Header
  headerWrapper: {
    height: Height.headerBar,
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
  headerIcon: {
    width: Height.buttonSm,
    height: Height.buttonSm,
    borderRadius: Radius['3xl'],
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
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
    direction: 'rtl' as const,
  },

});
