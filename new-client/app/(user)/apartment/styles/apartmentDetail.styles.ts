import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../../constants/theme';
import { Spacing, Radius, FontSize } from '../../../../constants/tokens';

const HERO_HEIGHT = 385;

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
  heroContainer: { height: HERO_HEIGHT, position: 'relative' },
  heroImage: { width: '100%', height: HERO_HEIGHT },
  heroPlaceholderIcon: {
    position: 'absolute',
    bottom: 80,
    left: '50%',
    transform: [{ translateX: -36 }],
  },
  heroScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },

  // Body
  bodyContent: { paddingTop: Spacing['4xl'], paddingHorizontal: Spacing['3xl'], gap: Spacing['3xl'] },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
    marginBottom: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  priceIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius['2xl'],
    backgroundColor: 'rgba(200,164,85,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontFamily: Fonts.spaceGrotesk.bold,
    fontSize: FontSize['5xl'],
    color: colors.primary,
    textAlign: 'right',
  },

  // Glass card
  glassCard: {
    backgroundColor: colors.glass20,
    borderRadius: Radius['4xl'],
    padding: Spacing['3xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  goldIndicator: { width: 3, height: 18, backgroundColor: colors.primary, borderRadius: Spacing.xxs },
  sectionTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.xl,
    color: colors.textWhite,
    textAlign: 'right',
  },

  // Description
  descriptionText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.md,
    color: colors.textWhite70,
    textAlign: 'right',
    lineHeight: 22,
  },

  // Documents
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  docLabel: {
    flex: 1,
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.base,
    color: colors.textWhite70,
    textAlign: 'right',
  },
});
