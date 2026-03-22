import { StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
      paddingHorizontal: Spacing['4xl'],
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    title: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['8xl'],
      color: colors.textWhite,
      textAlign: 'right',
    },
    list: {
      paddingHorizontal: Spacing['4xl'],
      paddingTop: Spacing.md,
      gap: Spacing['3xl'],
    },
    dealCard: {
      backgroundColor: colors.glass20,
      borderRadius: Radius['4xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
    },
    separator: {
      height: 1,
      backgroundColor: colors.borderLight,
    },
    transactionsList: {
      gap: 0,
    },
    noTxRow: {
      padding: Spacing['2xl'],
      alignItems: 'center',
    },
    noTxText: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.base,
      color: colors.textWhite50,
    },
  });
