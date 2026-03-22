import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../../constants/theme';
import { Spacing, Radius, FontSize } from '../../../../constants/tokens';

const MAP_HEIGHT = 502;

export const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },

  // Map
  mapArea: { height: MAP_HEIGHT, overflow: 'hidden' },

  // Glass header bar
  headerBar: {
    position: 'absolute',
    left: Spacing['3xl'],
    right: Spacing['3xl'],
    height: 50,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 100,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['4xl'],
    color: colors.textWhite,
    textAlign: 'center',
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.xl,
    color: colors.textWhite,
    height: '100%',
    textAlign: 'right',
    marginHorizontal: Spacing.lg,
  },

  // Location button
  locationButton: {
    position: 'absolute',
    bottom: 60,
    left: Spacing['3xl'],
    width: 40,
    height: 40,
    borderRadius: Radius['4xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMedium,
    backgroundColor: colors.glass100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgDark,
    borderTopLeftRadius: Radius['5xl'],
    borderTopRightRadius: Radius['5xl'],
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.borderMedium,
    overflow: 'hidden',
  },
  dragArea: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing['3xl'],
    alignItems: 'center',
    gap: Spacing.xl,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textWhite50,
  },

  // Sheet header
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  sheetHeaderRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  sheetTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['3xl'],
    color: colors.textWhite,
    textAlign: 'right',
  },
  sheetSubtitle: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.base,
    color: colors.textWhite,
    textAlign: 'right',
  },
  showAllLink: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.lg,
    color: colors.primary,
    marginTop: Spacing.xs,
  },

  // Filter chips
  filterChipsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignSelf: 'flex-end',
    zIndex: 100,
    paddingRight: Spacing['3xl'],
    paddingVertical: Spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: Radius['4xl'],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  filterChipText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.base,
    color: colors.textWhite,
  },
  dropdown: {
    position: 'absolute',
    top: 38,
    right: 0,
    minWidth: 180,
    backgroundColor: colors.bgDark,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    paddingVertical: Spacing.xs,
  },
  dropdownItem: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
  },
  dropdownItemActive: {
    backgroundColor: '#c8a45515',
  },
  dropdownText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.md,
    color: colors.textWhite,
    textAlign: 'right',
  },
  dropdownTextActive: {
    color: colors.primary,
  },
});
