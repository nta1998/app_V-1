import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing['3xl'],
      paddingTop: Spacing.md,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glass20,
      borderRadius: Radius['3xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      height: Height.headerBar,
      width: '100%',
      overflow: 'hidden',
    },
    headerTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['3xl'],
      color: colors.textWhite,
      textAlign: 'center',
    },

    scrollContent: {
      paddingHorizontal: Spacing['4xl'],
      paddingTop: 28,
    },

    // Admin button
    adminButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryGlow,
      borderRadius: Radius['2xl'],
      borderWidth: 1,
      borderColor: colors.borderGold,
      paddingVertical: Spacing['3xl'],
      marginTop: Spacing.md,
      gap: Spacing.md,
    },
    adminButtonText: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.xl,
      color: colors.primary,
    },

    // Logout button
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ef444420',
      borderRadius: Radius['2xl'],
      borderWidth: 1,
      borderColor: '#ef444440',
      height: Height.buttonXl,
      marginTop: Spacing.md,
      gap: Spacing.md,
    },
    logoutText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.lg,
      color: colors.error,
    },

    // Version
    versionText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
      textAlign: 'center',
      marginTop: Spacing['3xl'],
    },
  });
