import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useRef, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { makeStyles } from './styles/signDocument.styles';
import { useApi } from '../../hooks/useApi';
import { dealDocumentsApi, type DealDocument } from '../../services/api';
import SignaturePad, { type SignaturePadRef } from '../../components/SignaturePad';

export default function SignDocumentScreen() {
  const { docId, dealId } = useLocalSearchParams<{ docId: string; dealId: string }>();
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const signatureRef = useRef<SignaturePadRef>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPdf, setShowPdf] = useState(true);

  // Fetch the document details
  const { state: docsState } = useApi(
    dealId ? () => dealDocumentsApi.list(Number(dealId)) : null,
    [dealId],
  );

  const doc: DealDocument | null = useMemo(() => {
    if (docsState.status !== 'success' || !docId) return null;
    return docsState.data.find((d) => d.id === Number(docId)) ?? null;
  }, [docsState, docId]);

  const canSubmit = hasSignature && confirmed && !submitting;

  const handleClear = useCallback(() => {
    signatureRef.current?.clear();
    setHasSignature(false);
  }, []);

  const handleSubmit = async () => {
    if (!canSubmit || !doc) return;

    const signatureBase64 = signatureRef.current?.getBase64();
    if (!signatureBase64) {
      Alert.alert('שגיאה', 'לא נמצאה חתימה. אנא חתום שוב.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('signature_image', {
        uri: signatureBase64,
        type: 'image/png',
        name: 'signature.png',
      } as unknown as Blob);

      await dealDocumentsApi.sign(doc.id, formData);

      Alert.alert(
        'החתימה נשלחה בהצלחה!',
        'החתימה שלך נשלחה לאישור. תקבל התראה כשתאושר.',
        [{ text: 'אישור', onPress: () => router.back() }],
      );
    } catch {
      Alert.alert('שגיאה', 'שליחת החתימה נכשלה. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (docsState.status === 'loading' || docsState.status === 'idle') {
    return (
      <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!doc) {
    return (
      <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <Ionicons name="document-outline" size={48} color={colors.textWhite25} />
            <Text style={styles.emptyText}>המסמך לא נמצא</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.emptyText, { color: colors.primary }]}>חזור</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={colors.textWhite70} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>חתימה על מסמך</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Document info */}
          <View style={styles.docInfoCard}>
            <View style={styles.docIconWrap}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
            </View>
            <View style={styles.docDetails}>
              <Text style={styles.docName} numberOfLines={1}>{doc.filename}</Text>
              <Text style={styles.docMeta}>
                {doc.file_type === 'CONTRACT' ? 'חוזה' : doc.file_type === 'ID' ? 'תעודה' : 'מסמך'}
                {' • '}
                הועלה {new Date(doc.uploaded_at).toLocaleDateString('he-IL')}
              </Text>
            </View>
          </View>

          {/* PDF View Toggle */}
          <TouchableOpacity
            style={styles.pdfToggle}
            onPress={() => setShowPdf(!showPdf)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showPdf ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.primary}
            />
            <Text style={styles.pdfToggleText}>
              {showPdf ? 'הסתר מסמך' : 'הצג מסמך'}
            </Text>
          </TouchableOpacity>

          {/* PDF Preview Area */}
          {showPdf && (
            <View style={styles.pdfContainer}>
              <View style={styles.pdfPlaceholder}>
                <Ionicons name="document-text-outline" size={48} color={colors.textWhite25} />
                <Text style={styles.pdfPlaceholderText}>תצוגת המסמך</Text>
                <TouchableOpacity
                  style={styles.viewFullBtn}
                  onPress={() => {
                    if (doc.file) Linking.openURL(doc.file);
                  }}
                >
                  <Ionicons name="open-outline" size={16} color={colors.bgDark} />
                  <Text style={styles.viewFullBtnText}>צפה במסמך המלא</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>חתום כאן</Text>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </View>

            {/* Signature Canvas */}
            <View style={styles.signatureCanvasWrap}>
              <SignaturePad
                ref={signatureRef}
                onBegin={() => setHasSignature(true)}
                strokeColor={colors.textWhite}
                backgroundColor="transparent"
                style={styles.signatureCanvas}
              />
              {!hasSignature && (
                <View style={styles.signaturePlaceholder} pointerEvents="none">
                  <Ionicons name="finger-print-outline" size={32} color={colors.textWhite25} />
                  <Text style={styles.signaturePlaceholderText}>
                    חתום כאן באצבע או בעט
                  </Text>
                </View>
              )}
            </View>

            {/* Clear button */}
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
              disabled={!hasSignature}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color={hasSignature ? colors.error : colors.textWhite25} />
              <Text style={[styles.clearBtnText, !hasSignature && { color: colors.textWhite25 }]}>נקה</Text>
            </TouchableOpacity>

            {/* Confirmation checkbox */}
            <TouchableOpacity
              style={styles.confirmRow}
              onPress={() => setConfirmed(!confirmed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                {confirmed && <Ionicons name="checkmark" size={14} color={colors.bgDark} />}
              </View>
              <Text style={styles.confirmText}>
                אני מאשר/ת שקראתי את המסמך ואני חותם/ת מרצוני החופשי.
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Submit Button (fixed at bottom) */}
        <View style={styles.submitWrap}>
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={colors.bgDark} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={canSubmit ? colors.bgDark : colors.textWhite25} />
                <Text style={[styles.submitBtnText, !canSubmit && styles.submitBtnTextDisabled]}>
                  שלח חתימה
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

