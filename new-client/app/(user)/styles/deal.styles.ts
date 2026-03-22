import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    // Header
    header: {
      paddingHorizontal: Spacing['4xl'],
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.lg,
    },
    title: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['8xl'],
      color: colors.textWhite,
      textAlign: 'right',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: 3,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusBadgeText: { fontFamily: Fonts.manrope.semiBold, fontSize: FontSize.base },

    // Scroll
    scrollContent: { paddingHorizontal: Spacing['4xl'], paddingTop: Spacing.md, gap: Spacing['3xl'] },

    // Card (used for documents and payments wrapper)
    card: {
      backgroundColor: colors.glass20,
      borderRadius: Radius['4xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
      padding: Spacing['3xl'],
    },

    // Section title
    sectionTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['3xl'],
      color: colors.textWhite,
      textAlign: 'right',
      marginBottom: Spacing.xl,
    },

    // Documents
    docList: { gap: Spacing.lg },

    // Payments
    paymentList: { gap: Spacing.lg },
  });
