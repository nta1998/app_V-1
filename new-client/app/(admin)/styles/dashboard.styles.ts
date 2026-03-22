import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  pageContent: {
    paddingHorizontal: Spacing['3xl'],
    paddingTop: Spacing['3xl'],
    gap: Spacing['5xl'],
  },

  // -- Header --
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bellWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  greetWrap: {
    alignItems: 'flex-end',
    gap: Spacing.xxs,
  },
  greetText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.sm,
    color: colors.textWhite,
    textAlign: 'right',
  },
  nameText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize['4xl'],
    color: colors.textWhite,
    textAlign: 'right',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#c8a4554D',
    backgroundColor: colors.glass60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  // -- KPI --
  kpiSection: { gap: Spacing.xl },
  sectionTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.xl,
    color: colors.textWhite,
    textAlign: 'right',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },

  // -- Quick Actions --
  actionsSection: { gap: Spacing.xl },
  actionsTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['2xl'],
    color: colors.primary,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },

  // -- Attention Section --
  attentionSection: { gap: Spacing.lg },

  // -- Activity Feed --
  activitySection: { gap: Spacing.lg },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.xs,
    backgroundColor: colors.primary,
    marginTop: 5,
  },
  activityContent: { flex: 1, gap: Spacing.xxs },
  activityText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.base,
    color: colors.textWhite70,
    textAlign: 'right',
  },
  activityTime: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.xs,
    color: colors.textWhite50,
    textAlign: 'right',
  },

  // -- Recent Properties --
  recentSection: { gap: Spacing.xl },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.xl,
    color: colors.textWhite,
  },
  recentLink: {
    fontFamily: Fonts.heebo.bold,
    fontSize: FontSize.sm,
    color: colors.primary,
  },
  propertyList: { gap: Spacing.xl },
});
