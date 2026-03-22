import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import type { DealDocument, SigningStatus } from '../../services/api';

const SIGNING_STATUS_CONFIG: Record<SigningStatus, { label: string; color: string; icon: string }> = {
  NONE: { label: '', color: '#888', icon: '' },
  PENDING: { label: '\u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05D7\u05EA\u05D9\u05DE\u05D4', color: '#f59e0b', icon: '\u23F3' },
  SIGNED: { label: '\u05E0\u05D7\u05EA\u05DD, \u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8', color: '#3b82f6', icon: '\uD83D\uDCDD' },
  APPROVED: { label: '\u05D0\u05D5\u05E9\u05E8', color: '#22c55e', icon: '\u2705' },
  REJECTED: { label: '\u05E0\u05D3\u05D7\u05D4 - \u05E0\u05D3\u05E8\u05E9\u05EA \u05D7\u05EA\u05D9\u05DE\u05D4 \u05DE\u05D7\u05D3\u05E9', color: '#ef4444', icon: '\u274C' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('he-IL');
}

interface DocumentCardProps {
  doc: DealDocument;
}

export default function DocumentCard({ doc }: DocumentCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const sigConfig = SIGNING_STATUS_CONFIG[doc.signing_status];
  const needsSignature = doc.signing_status === 'PENDING' || doc.signing_status === 'REJECTED';

  return (
    <View style={styles.docCard}>
      <View style={styles.docIcon}>
        <Ionicons
          name={doc.file_type === 'CONTRACT' ? 'document-text' : 'document-outline'}
          size={22}
          color={colors.primary}
        />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName} numberOfLines={1}>{doc.filename}</Text>
        <Text style={styles.docDate}>{'\u05D4\u05D5\u05E2\u05DC\u05D4: '}{formatDate(doc.uploaded_at)}</Text>
        {doc.signing_status !== 'NONE' && (
          <Text style={[styles.docStatus, { color: sigConfig.color }]}>
            {sigConfig.icon} {sigConfig.label}
          </Text>
        )}
      </View>
      <View style={styles.docActions}>
        <TouchableOpacity
          style={styles.docActionBtn}
          onPress={() => Linking.openURL(doc.file)}
        >
          <Ionicons name="eye-outline" size={16} color={colors.primary} />
          <Text style={styles.docActionText}>{'\u05E6\u05E4\u05D4'}</Text>
        </TouchableOpacity>
        {needsSignature && (
          <TouchableOpacity
            style={[styles.docActionBtn, styles.docSignBtn]}
            onPress={() => router.push({ pathname: '/sign-document', params: { docId: String(doc.id), dealId: String(doc.deal) } })}
          >
            <Ionicons name="create-outline" size={16} color={colors.bgDark} />
            <Text style={[styles.docActionText, { color: colors.bgDark }]}>{'\u05D7\u05EA\u05D5\u05DD'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    docCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.glass20,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      gap: Spacing.lg,
    },
    docIcon: {
      width: 42,
      height: 42,
      borderRadius: Radius.lg,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    docInfo: { flex: 1, alignItems: 'flex-end', gap: Spacing.xxs },
    docName: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.md,
      color: colors.textWhite,
      textAlign: 'right',
    },
    docDate: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.xs,
      color: colors.textWhite50,
    },
    docStatus: {
      fontFamily: Fonts.heebo.medium,
      fontSize: FontSize.sm,
      marginTop: Spacing.xxs,
    },
    docActions: { gap: Spacing.sm },
    docActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: colors.glass20,
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: Spacing.lg,
      paddingVertical: 5,
    },
    docSignBtn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    docActionText: {
      fontFamily: Fonts.heebo.medium,
      fontSize: FontSize.sm,
      color: colors.primary,
    },
  });
