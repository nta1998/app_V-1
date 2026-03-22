import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Header - glass pill bar
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing['3xl'],
    marginTop: Spacing.md,
    height: Height.headerBar,
    borderRadius: Radius['3xl'],
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
    overflow: 'hidden',
  },
  headerBtn: {
    width: Height.buttonSm,
    height: Height.buttonSm,
    borderRadius: Radius['3xl'],
    backgroundColor: '#ffffff14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['3xl'],
    color: colors.textWhite,
    textAlign: 'center',
    flex: 1,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: Spacing['3xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: 40,
  },

  // Properties Sheet - glass wrapper
  propertiesSheet: {
    borderRadius: Radius['5xl'],
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
    padding: Spacing['3xl'],
    gap: Spacing['3xl'],
    overflow: 'hidden',
  },

  // Individual property card
  propertyCard: {
    borderRadius: Radius['2xl'],
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
    height: 110,
    overflow: 'hidden',
  },
});
