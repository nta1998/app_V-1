import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Linking,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import {
  dealsApi,
  dealTeamApi,
  paymentsApi,
  type Deal,
  type DealStage,
  type DealTeamMember,
  type DealDocument,
  type Payment,
  type SigningStatus,
} from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES: { key: DealStage; label: string }[] = [
  { key: 'ATTACHMENT', label: 'הצמדה' },
  { key: 'CONTRACT', label: 'חוזה' },
  { key: 'SIGNING', label: 'חתימה' },
  { key: 'CLOSING', label: 'סגירה' },
];

const STAGE_INDEX: Record<DealStage, number> = {
  ATTACHMENT: 0,
  CONTRACT: 1,
  SIGNING: 2,
  CLOSING: 3,
};

const SIGNING_STATUS_CONFIG: Record<SigningStatus, { label: string; color: string; icon: string }> = {
  NONE: { label: '', color: '#888', icon: '' },
  PENDING: { label: 'ממתין לחתימה', color: '#f59e0b', icon: '⏳' },
  SIGNED: { label: 'נחתם, ממתין לאישור', color: '#3b82f6', icon: '📝' },
  APPROVED: { label: 'אושר', color: '#22c55e', icon: '✅' },
  REJECTED: { label: 'נדחה - נדרשת חתימה מחדש', color: '#ef4444', icon: '❌' },
};

const PAYMENT_STATUS_CONFIG: Record<Payment['status'], { label: string; color: string }> = {
  paid: { label: 'שולם', color: '#22c55e' },
  pending: { label: 'ממתין', color: '#f59e0b' },
  upcoming: { label: 'עתידי', color: '#6b7280' },
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₪${num.toLocaleString('he-IL')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('he-IL');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DealScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { state: dealState, refetch } = useApi(dealsApi.myDeal);
  const [refreshing, setRefreshing] = useState(false);

  const deal: Deal | null = dealState.status === 'success' ? dealState.data : null;
  const dealId = deal?.id;

  // Fetch team and payments when we have a deal (null fetcher = skip)
  const { state: teamState } = useApi(
    dealId ? () => dealTeamApi.list(dealId) : null,
    [dealId],
  );
  const { state: paymentsState } = useApi(
    dealId ? () => paymentsApi.list(dealId) : null,
    [dealId],
  );

  const team: DealTeamMember[] = teamState.status === 'success' ? teamState.data : [];
  const payments: Payment[] = paymentsState.status === 'success' ? paymentsState.data : [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Loading state
  if (dealState.status === 'loading' || dealState.status === 'idle') {
    return (
      <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>העסקה שלי</Text>
          </View>
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (dealState.status === 'error') {
    return (
      <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>העסקה שלי</Text>
          </View>
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.primary} />
            <Text style={styles.emptyText}>שגיאה בטעינת הנתונים</Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={[styles.emptyText, { color: colors.primary }]}>נסה שוב</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // No deal state
  if (!deal) {
    return (
      <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>העסקה שלי</Text>
          </View>
          <View style={styles.center}>
            <Ionicons name="home-outline" size={48} color={colors.textWhite25} />
            <Text style={styles.emptyText}>אין עסקה פעילה</Text>
            <Text style={[styles.emptyText, { fontSize: 14 }]}>
              כשתוצמד לדירה, פרטי העסקה יופיעו כאן
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const currentStageIdx = STAGE_INDEX[deal.stage] ?? 0;
  const apt = deal.apartment;
  const totalPayments = payments.reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
  const paidPayments = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
  const paidPercent = totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: deal.status === 'Active' ? '#22c55e22' : '#3b82f622' }]}>
            <View style={[styles.statusDot, { backgroundColor: deal.status === 'Active' ? '#22c55e' : '#3b82f6' }]} />
            <Text style={[styles.statusBadgeText, { color: deal.status === 'Active' ? '#22c55e' : '#3b82f6' }]}>
              {deal.status === 'Active' ? 'פעיל' : deal.status === 'Completed' ? 'הושלם' : 'בוטל'}
            </Text>
          </View>
          <Text style={styles.title}>העסקה שלי</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* ── Section 1: Apartment Details ── */}
          <View style={styles.card}>
            {apt?.apartment_image_url || apt?.main_image ? (
              <Image
                source={{ uri: apt.main_image || apt.apartment_image_url! }}
                style={styles.aptImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.aptImagePlaceholder}>
                <Ionicons name="home" size={36} color={colors.primary} />
              </View>
            )}
            <View style={styles.aptInfo}>
              <Text style={styles.aptAddress}>{apt?.apartment_specific_address ?? '—'}</Text>
              <Text style={styles.aptProject}>
                {deal.project?.title ?? ''}{deal.project?.project_address ? `, ${deal.project.project_address}` : ''}
              </Text>
              <View style={styles.aptSpecsRow}>
                {apt?.price && (
                  <View style={styles.specItem}>
                    <Ionicons name="cash-outline" size={14} color={colors.primary} />
                    <Text style={styles.specText}>{formatCurrency(apt.price)}</Text>
                  </View>
                )}
                {apt?.apartment_size_sqm && (
                  <View style={styles.specItem}>
                    <Ionicons name="resize-outline" size={14} color={colors.primary} />
                    <Text style={styles.specText}>{apt.apartment_size_sqm} מ"ר</Text>
                  </View>
                )}
                {apt?.number_of_rooms && (
                  <View style={styles.specItem}>
                    <Ionicons name="bed-outline" size={14} color={colors.primary} />
                    <Text style={styles.specText}>{apt.number_of_rooms} חדרים</Text>
                  </View>
                )}
                {apt?.floor != null && (
                  <View style={styles.specItem}>
                    <Ionicons name="layers-outline" size={14} color={colors.primary} />
                    <Text style={styles.specText}>קומה {apt.floor}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ── Section 2: Progress Tracker ── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>שלבי העסקה</Text>
            <View style={styles.progressTracker}>
              {STAGES.map((stage, idx) => {
                const isDone = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                const tx = deal.transactions.find((t) => t.stage === stage.key);
                return (
                  <View key={stage.key} style={styles.stageItem}>
                    {/* Connector line */}
                    {idx > 0 && (
                      <View
                        style={[
                          styles.connector,
                          idx <= currentStageIdx ? styles.connectorDone : styles.connectorFuture,
                        ]}
                      />
                    )}
                    {/* Circle */}
                    <View
                      style={[
                        styles.stageCircle,
                        isDone && styles.stageCircleDone,
                        isCurrent && styles.stageCircleCurrent,
                        !isDone && !isCurrent && styles.stageCircleFuture,
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      ) : isCurrent ? (
                        <View style={styles.pulseDot} />
                      ) : (
                        <View style={styles.emptyDot} />
                      )}
                    </View>
                    {/* Label */}
                    <Text
                      style={[
                        styles.stageLabel,
                        (isDone || isCurrent) && styles.stageLabelActive,
                      ]}
                    >
                      {stage.label}
                    </Text>
                    {/* Date */}
                    {tx?.completion_date && isDone && (
                      <Text style={styles.stageDate}>{formatDate(tx.completion_date)}</Text>
                    )}
                    {tx?.request_date && isCurrent && (
                      <Text style={styles.stageDate}>{formatDate(tx.request_date)}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Section 3: Team ── */}
          {team.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>הצוות שלך</Text>
              <View style={styles.teamList}>
                {team.map((member) => (
                  <View key={member.id} style={styles.teamCard}>
                    <View style={styles.teamAvatar}>
                      <Ionicons name="person" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{member.name}</Text>
                      <Text style={styles.teamRole}>
                        {member.role === 'DEAL_MANAGER' ? 'מנהל עסקה' : 'עורך דין'}
                      </Text>
                    </View>
                    <View style={styles.teamActions}>
                      <TouchableOpacity
                        style={styles.teamActionBtn}
                        onPress={() => Linking.openURL(`tel:${member.phone}`)}
                      >
                        <Ionicons name="call-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.teamActionBtn}
                        onPress={() => Linking.openURL(`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`)}
                      >
                        <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Section 4: Documents ── */}
          {deal.documents.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>מסמכים</Text>
              <View style={styles.docList}>
                {deal.documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} colors={colors} styles={styles} />
                ))}
              </View>
            </View>
          )}

          {/* ── Section 5: Payment Schedule ── */}
          {payments.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>לוח תשלומים</Text>

              {/* Summary */}
              <View style={styles.paymentSummary}>
                <View style={styles.paymentSummaryRow}>
                  <Text style={styles.paymentSummaryLabel}>סה"כ</Text>
                  <Text style={styles.paymentSummaryValue}>{formatCurrency(totalPayments)}</Text>
                </View>
                <View style={styles.paymentSummaryRow}>
                  <Text style={styles.paymentSummaryLabel}>שולם</Text>
                  <Text style={[styles.paymentSummaryValue, { color: '#22c55e' }]}>
                    {formatCurrency(paidPayments)} ({paidPercent}%)
                  </Text>
                </View>
                {/* Progress bar */}
                <View style={styles.paymentProgressBar}>
                  <View style={[styles.paymentProgressFill, { width: `${paidPercent}%` }]} />
                </View>
              </View>

              {/* Payment items */}
              <View style={styles.paymentList}>
                {payments.map((payment) => {
                  const config = PAYMENT_STATUS_CONFIG[payment.status];
                  return (
                    <View
                      key={payment.id}
                      style={[styles.paymentItem, { borderLeftColor: config.color }]}
                    >
                      <View style={styles.paymentHeader}>
                        <View style={[styles.paymentStatusBadge, { backgroundColor: config.color + '22' }]}>
                          <Text style={[styles.paymentStatusText, { color: config.color }]}>{config.label}</Text>
                        </View>
                        <Text style={styles.paymentNumber}>#{payment.payment_number}</Text>
                      </View>
                      <Text style={styles.paymentDescription}>{payment.description}</Text>
                      <View style={styles.paymentFooter}>
                        <Text style={styles.paymentDate}>{formatDate(payment.due_date)}</Text>
                        <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Document Card Sub-Component ──────────────────────────────────────────────

function DocumentCard({
  doc,
  colors,
  styles,
}: {
  doc: DealDocument;
  colors: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
}) {
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
        <Text style={styles.docDate}>הועלה: {formatDate(doc.uploaded_at)}</Text>
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
          <Text style={styles.docActionText}>צפה</Text>
        </TouchableOpacity>
        {needsSignature && (
          <TouchableOpacity
            style={[styles.docActionBtn, styles.docSignBtn]}
            onPress={() => router.push({ pathname: '/sign-document', params: { docId: String(doc.id), dealId: String(doc.deal) } })}
          >
            <Ionicons name="create-outline" size={16} color={colors.bgDark} />
            <Text style={[styles.docActionText, { color: colors.bgDark }]}>חתום</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { fontFamily: Fonts.heebo.regular, fontSize: 16, color: colors.textWhite50, textAlign: 'center' },

    // Header
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
    },
    title: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 28,
      color: colors.textWhite,
      textAlign: 'right',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusBadgeText: { fontFamily: Fonts.manrope.semiBold, fontSize: 13 },

    // Scroll
    scrollContent: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },

    // Card
    card: {
      backgroundColor: colors.glass20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
      padding: 16,
    },

    // Section title
    sectionTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 18,
      color: colors.textWhite,
      textAlign: 'right',
      marginBottom: 12,
    },

    // ── Apartment Details ──
    aptImage: { width: '100%', height: 160, borderRadius: 14 },
    aptImagePlaceholder: {
      width: '100%',
      height: 160,
      borderRadius: 14,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aptInfo: { marginTop: 12, gap: 4, alignItems: 'flex-end' },
    aptAddress: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 20,
      color: colors.textWhite,
      textAlign: 'right',
    },
    aptProject: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 15,
      color: colors.textWhite70,
      textAlign: 'right',
    },
    aptSpecsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 10,
      justifyContent: 'flex-end',
    },
    specItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.glass20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    specText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 13,
      color: colors.textWhite,
    },

    // ── Progress Tracker ──
    progressTracker: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 4,
    },
    stageItem: {
      alignItems: 'center',
      flex: 1,
      position: 'relative',
    },
    connector: {
      position: 'absolute',
      top: 14,
      right: '50%',
      width: '100%',
      height: 2,
      zIndex: -1,
    },
    connectorDone: { backgroundColor: colors.primary },
    connectorFuture: { backgroundColor: colors.glass60 },
    stageCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    stageCircleDone: { backgroundColor: '#22c55e' },
    stageCircleCurrent: { backgroundColor: colors.primary },
    stageCircleFuture: { backgroundColor: colors.glass60, borderWidth: 1, borderColor: colors.borderLight },
    pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bgDark },
    emptyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textWhite25 },
    stageLabel: {
      fontFamily: Fonts.heebo.medium,
      fontSize: 12,
      color: colors.textWhite50,
      textAlign: 'center',
    },
    stageLabelActive: { color: colors.textWhite },
    stageDate: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 10,
      color: colors.textWhite50,
      marginTop: 2,
    },

    // ── Team ──
    teamList: { gap: 10 },
    teamCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.glass20,
      borderRadius: 14,
      padding: 12,
      gap: 12,
    },
    teamAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    teamInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
    teamName: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 15,
      color: colors.textWhite,
      textAlign: 'right',
    },
    teamRole: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 13,
      color: colors.textWhite50,
    },
    teamActions: { flexDirection: 'row', gap: 8 },
    teamActionBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ── Documents ──
    docList: { gap: 10 },
    docCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.glass20,
      borderRadius: 14,
      padding: 12,
      gap: 10,
    },
    docIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    docInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
    docName: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 14,
      color: colors.textWhite,
      textAlign: 'right',
    },
    docDate: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 11,
      color: colors.textWhite50,
    },
    docStatus: {
      fontFamily: Fonts.heebo.medium,
      fontSize: 12,
      marginTop: 2,
    },
    docActions: { gap: 6 },
    docActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.glass20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    docSignBtn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    docActionText: {
      fontFamily: Fonts.heebo.medium,
      fontSize: 12,
      color: colors.primary,
    },

    // ── Payments ──
    paymentSummary: { gap: 8, marginBottom: 14 },
    paymentSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentSummaryLabel: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 14,
      color: colors.textWhite50,
    },
    paymentSummaryValue: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: 18,
      color: colors.textWhite,
    },
    paymentProgressBar: {
      height: 6,
      backgroundColor: colors.glass60,
      borderRadius: 3,
      overflow: 'hidden',
    },
    paymentProgressFill: {
      height: '100%',
      backgroundColor: '#22c55e',
      borderRadius: 3,
    },
    paymentList: { gap: 10 },
    paymentItem: {
      backgroundColor: colors.glass20,
      borderRadius: 14,
      padding: 12,
      borderLeftWidth: 3,
      gap: 6,
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentNumber: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 14,
      color: colors.textWhite,
    },
    paymentStatusBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    paymentStatusText: {
      fontFamily: Fonts.heebo.medium,
      fontSize: 12,
    },
    paymentDescription: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 13,
      color: colors.textWhite70,
      textAlign: 'right',
    },
    paymentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentDate: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 12,
      color: colors.textWhite50,
    },
    paymentAmount: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: 16,
      color: colors.textWhite,
    },
  });
