import { StyleSheet, Platform } from 'react-native';
import { Fonts, type ThemeColors } from '../../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../../constants/tokens';

export const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl },
    emptyText: { fontFamily: Fonts.heebo.regular, fontSize: FontSize.xl, color: colors.textWhite50 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing['3xl'],
      paddingVertical: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerBtn: { width: Height.buttonSm, height: Height.buttonSm, borderRadius: Radius['3xl'], alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: Fonts.manrope.bold, fontSize: FontSize['3xl'], color: colors.textWhite },

    // Scroll
    scrollView: { flex: 1 },
    scrollContent: { padding: Spacing['4xl'], gap: Spacing['3xl'] },

    // Document Info
    docInfoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.glass20,
      borderRadius: Radius['2xl'],
      padding: Spacing['2xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: Spacing.xl,
    },
    docIconWrap: {
      width: Height.buttonXl,
      height: Height.buttonXl,
      borderRadius: Radius.xl,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    docDetails: { flex: 1, alignItems: 'flex-end', gap: Spacing.xs },
    docName: { fontFamily: Fonts.manrope.bold, fontSize: FontSize.xl, color: colors.textWhite, textAlign: 'right' },
    docMeta: { fontFamily: Fonts.heebo.regular, fontSize: FontSize.base, color: colors.textWhite50 },

    // PDF toggle
    pdfToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.sm,
    },
    pdfToggleText: { fontFamily: Fonts.heebo.medium, fontSize: FontSize.md, color: colors.primary },

    // PDF container
    pdfContainer: {
      borderRadius: Radius['2xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.glass20,
    },
    pdfPlaceholder: {
      height: 280,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xl,
    },
    pdfPlaceholderText: { fontFamily: Fonts.heebo.regular, fontSize: FontSize.md, color: colors.textWhite50 },
    viewFullBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing['3xl'],
      paddingVertical: Spacing.lg,
      marginTop: Spacing.md,
    },
    viewFullBtnText: { fontFamily: Fonts.heebo.bold, fontSize: FontSize.md, color: colors.bgDark },

    // Signature Section
    signatureSection: {
      backgroundColor: colors.glass20,
      borderRadius: Radius['4xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: Spacing['3xl'],
      gap: Spacing.xl,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.md },
    sectionTitle: { fontFamily: Fonts.manrope.bold, fontSize: FontSize['3xl'], color: colors.textWhite },

    // Signature Canvas
    signatureCanvasWrap: {
      height: 180,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.borderGold,
      borderStyle: 'dashed',
      backgroundColor: '#00000020',
      overflow: 'hidden',
      position: 'relative',
    },
    signatureCanvas: { flex: 1 },
    signaturePlaceholder: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
    },
    signaturePlaceholderText: { fontFamily: Fonts.heebo.regular, fontSize: FontSize.md, color: colors.textWhite25 },

    // Clear button
    clearBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    clearBtnText: { fontFamily: Fonts.heebo.medium, fontSize: FontSize.md, color: colors.error },

    // Confirmation
    confirmRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
      paddingVertical: Spacing.xs,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    confirmText: {
      flex: 1,
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.base,
      color: colors.textWhite70,
      textAlign: 'right',
      lineHeight: 20,
    },

    // Submit
    submitWrap: {
      paddingHorizontal: Spacing['4xl'],
      paddingBottom: Platform.OS === 'ios' ? 0 : Spacing['3xl'],
      paddingTop: Spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: Radius['2xl'],
      height: 54,
      gap: Spacing.lg,
      shadowColor: '#c8a455',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 8,
    },
    submitBtnDisabled: {
      backgroundColor: colors.glass60,
      shadowOpacity: 0,
      elevation: 0,
    },
    submitBtnText: {
      fontFamily: Fonts.heebo.bold,
      fontSize: FontSize['2xl'],
      color: colors.bgDark,
    },
    submitBtnTextDisabled: { color: colors.textWhite25 },
  });
