import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  // Header
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.xl,
  },
  header: {
    height: Height.headerBar,
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    alignSelf: 'stretch',
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['3xl'],
    color: colors.textWhite,
    textAlign: 'center',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: Spacing['4xl'],
    paddingTop: 32,
    paddingBottom: 40,
    gap: Spacing['5xl'],
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.borderGold,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(200,164,85,0.1)',
    borderWidth: 3,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['7xl'],
    color: colors.primary,
  },
  avatarSubtitle: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.md,
    color: colors.textWhite,
  },

  // Form Card
  formCard: {
    borderRadius: Radius['5xl'],
    overflow: 'hidden',
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  formCardBlur: {
    borderRadius: Radius['5xl'],
    overflow: 'hidden',
  },
  formCardInner: {
    padding: Spacing['4xl'],
    gap: Spacing['3xl'],
  },

  // Fields
  fieldWrapper: { gap: Spacing.md },
  fieldLabel: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.sm,
    color: colors.textWhite,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff12',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: Spacing['2xl'],
    height: 52,
    gap: 5,
  },
  inputRowReadonly: {
    opacity: 0.6,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  fieldErrorText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.sm,
    color: colors.error,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.lg,
    color: colors.textWhite,
    height: '100%',
  },
  readonlyText: {
    flex: 1,
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.lg,
    color: colors.textWhite70,
    textAlign: 'right',
  },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  errorText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.base,
    color: colors.error,
    textAlign: 'right',
  },

  // Save button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: Radius['2xl'],
    height: 54,
    gap: Spacing.lg,
    marginTop: Spacing.xs,
    shadowColor: '#c8a455',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    fontFamily: Fonts.heebo.bold,
    fontSize: FontSize.xl,
    color: colors.bgDark,
  },

  // Cancel button
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff99',
    borderRadius: Radius['2xl'],
    height: Height.buttonXl,
    borderWidth: 1,
    borderColor: '#ffffff26',
  },
  cancelButtonText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.xl,
    color: colors.textWhite,
  },
});
