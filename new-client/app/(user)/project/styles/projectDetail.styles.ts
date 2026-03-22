import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../../constants/theme';
import { Spacing, Radius, FontSize } from '../../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  scrollContent: { flexGrow: 1 },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['3xl'],
    backgroundColor: colors.bgDeep,
  },
  errorText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.xl,
    color: colors.textWhite70,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing['5xl'],
    paddingVertical: Spacing.xl,
  },
  retryText: { fontFamily: Fonts.manrope.bold, fontSize: FontSize.md, color: colors.bgDark },

  // Hero
  heroContainer: { height: 374, position: 'relative' },
  heroImage: { width: '100%', height: 374 },
  heroDecor: { position: 'absolute', bottom: 80, right: 30, opacity: 0.5 },

  // Body
  bodyContent: { paddingTop: Spacing['4xl'], paddingHorizontal: Spacing['4xl'], gap: Spacing['3xl'] },
  // Used by Units section (has custom header with count badge)
  glassCard: {
    backgroundColor: colors.glass20,
    borderRadius: Radius['4xl'],
    padding: Spacing['3xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.xl,
    color: colors.textWhite,
    textAlign: 'right',
  },
  goldIndicator: { width: 3, height: 18, backgroundColor: colors.primary, borderRadius: Spacing.xxs },

  // Overview
  descriptionText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.md,
    color: colors.textWhite70,
    textAlign: 'right',
    lineHeight: 22,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  expandText: { fontFamily: Fonts.manrope.semiBold, fontSize: FontSize.base, color: colors.primary },

  // Specs
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },

  // Documents
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  docInfo: { flex: 1, alignItems: 'flex-end' },
  docTitle: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.base,
    color: colors.textWhite,
    textAlign: 'right',
  },
  docType: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.xs,
    color: colors.textWhite50,
    textAlign: 'right',
  },

  // Units
  unitsTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing['2xl'] },
  unitsTitleRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
  },
  countBadgeText: { fontFamily: Fonts.manrope.bold, fontSize: FontSize.sm, color: colors.bgDark },
  showAllText: { fontFamily: Fonts.manrope.semiBold, fontSize: FontSize.base, color: colors.primary },
});
