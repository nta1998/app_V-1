import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { useApi } from '../../../hooks/useApi';
import {
  dealsApi,
  dealDocumentsApi,
  dealTeamApi,
  paymentsApi,
  type Deal,
  type DealDocument,
  type DealTeamMember,
  type Payment,
  type DealStage,
  type SigningStatus,
} from '../../../services/api';
import { Fonts } from '../../../constants/theme';
import * as DocumentPicker from 'expo-document-picker';

// ── Design tokens ────────────────────────────────────────
const GOLD       = '#c8a455';
const GOLD_TINT  = '#c8a45526';
const GOLD_RING  = '#c8a4554D';
const GLASS      = '#ffffff0D';
const BORDER     = '#ffffff14';
const TEXT       = '#ffffff';
const TEXT_DIM   = '#ffffffB3';
const TEXT_MID   = '#ffffff80';
const TEXT_25    = '#ffffff40';
const SUCCESS    = '#34d399';
const ERROR      = '#f87171';
const WARN       = '#fbbf24';
const DARK       = '#0e0d07';

const STAGE_ORDER: DealStage[] = ['ATTACHMENT', 'CONTRACT', 'SIGNING', 'CLOSING'];
const STAGE_LABELS: Record<DealStage, string> = {
  ATTACHMENT: 'הצמדה',
  CONTRACT: 'חוזה',
  SIGNING: 'חתימות',
  CLOSING: 'סגירה',
};

const SIGNING_LABELS: Record<SigningStatus, string> = {
  NONE: 'ממתין לחתימה',
  PENDING: 'נחתם - ממתין לאישור',
  SIGNED: 'נחתם',
  APPROVED: 'אושר',
  REJECTED: 'נדחה',
};

const SIGNING_COLORS: Record<SigningStatus, string> = {
  NONE: TEXT_MID,
  PENDING: WARN,
  SIGNED: GOLD,
  APPROVED: SUCCESS,
  REJECTED: ERROR,
};

function formatPrice(price: string | null) {
  if (!price) return '';
  const num = parseFloat(price);
  if (isNaN(num)) return '';
  return `₪${num.toLocaleString('he-IL')}`;
}

export default function AdminDealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dealId = Number(id);

  const { state: dealState, refetch: refetchDeal } = useApi(() => dealsApi.get(dealId), [id]);
  const { state: docsState, refetch: refetchDocs } = useApi(() => dealDocumentsApi.list(dealId), [id]);
  const { state: teamState, refetch: refetchTeam } = useApi(() => dealTeamApi.list(dealId), [id]);
  const { state: paymentsState, refetch: refetchPayments } = useApi(() => paymentsApi.list(dealId), [id]);

  const [refreshing, setRefreshing] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Add team member form
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamRole, setNewTeamRole] = useState<'DEAL_MANAGER' | 'LAWYER'>('DEAL_MANAGER');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamPhone, setNewTeamPhone] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');

  // Add payment form
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayAmount, setNewPayAmount] = useState('');
  const [newPayDate, setNewPayDate] = useState('');
  const [newPayDesc, setNewPayDesc] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDeal(), refetchDocs(), refetchTeam(), refetchPayments()]);
    setRefreshing(false);
  }, [refetchDeal, refetchDocs, refetchTeam, refetchPayments]);

  const deal: Deal | null = dealState.status === 'success' ? dealState.data : null;
  const docs: DealDocument[] = docsState.status === 'success' ? docsState.data : [];
  const team: DealTeamMember[] = teamState.status === 'success' ? teamState.data : [];
  const payments: Payment[] = paymentsState.status === 'success' ? paymentsState.data : [];

  // ── Stage advancement ──
  const currentStageIdx = deal ? STAGE_ORDER.indexOf(deal.stage) : 0;
  const canAdvance = deal && currentStageIdx < STAGE_ORDER.length - 1;

  const handleAdvanceStage = useCallback(async () => {
    if (!deal || !canAdvance) return;
    const nextStage = STAGE_LABELS[STAGE_ORDER[currentStageIdx + 1]];
    Alert.alert(
      'קידום שלב',
      `האם לקדם את העסקה לשלב "${nextStage}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'אישור',
          onPress: async () => {
            setAdvancing(true);
            try {
              await dealsApi.advanceStage(deal.id);
              await refetchDeal();
            } catch {
              Alert.alert('שגיאה', 'לא ניתן לקדם את העסקה.');
            } finally {
              setAdvancing(false);
            }
          },
        },
      ],
    );
  }, [deal, canAdvance, currentStageIdx, refetchDeal]);

  // ── Document upload ──
  const handleUploadDoc = useCallback(async () => {
    if (!deal) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      setUploading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/pdf',
        name: file.name || 'document.pdf',
      } as unknown as Blob);
      formData.append('file_type', 'CONTRACT');

      await dealDocumentsApi.upload(deal.id, formData);
      await refetchDocs();
      Alert.alert('המסמך הועלה בהצלחה');
    } catch {
      Alert.alert('שגיאה', 'העלאת המסמך נכשלה.');
    } finally {
      setUploading(false);
    }
  }, [deal, refetchDocs]);

  // ── Approve/Reject document ──
  const handleApproveDoc = useCallback(async (docId: number) => {
    try {
      await dealDocumentsApi.approve(docId);
      await refetchDocs();
    } catch {
      Alert.alert('שגיאה', 'אישור החתימה נכשל.');
    }
  }, [refetchDocs]);

  const handleRejectDoc = useCallback(async (docId: number) => {
    Alert.alert('דחיית חתימה', 'האם לדחות את החתימה?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'דחה',
        style: 'destructive',
        onPress: async () => {
          try {
            await dealDocumentsApi.reject(docId);
            await refetchDocs();
          } catch {
            Alert.alert('שגיאה', 'דחיית החתימה נכשלה.');
          }
        },
      },
    ]);
  }, [refetchDocs]);

  // ── Add team member ──
  const handleAddTeamMember = useCallback(async () => {
    if (!deal || !newTeamName.trim()) return;
    try {
      await dealTeamApi.add(deal.id, {
        role: newTeamRole,
        name: newTeamName.trim(),
        phone: newTeamPhone.trim(),
        email: newTeamEmail.trim(),
      });
      await refetchTeam();
      setShowAddTeam(false);
      setNewTeamName('');
      setNewTeamPhone('');
      setNewTeamEmail('');
    } catch {
      Alert.alert('שגיאה', 'הוספת איש צוות נכשלה.');
    }
  }, [deal, newTeamRole, newTeamName, newTeamPhone, newTeamEmail, refetchTeam]);

  const handleRemoveTeamMember = useCallback(async (memberId: number) => {
    if (!deal) return;
    Alert.alert('הסרת איש צוות', 'האם להסיר את איש הצוות?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'הסר',
        style: 'destructive',
        onPress: async () => {
          try {
            await dealTeamApi.remove(deal.id, memberId);
            await refetchTeam();
          } catch {
            Alert.alert('שגיאה', 'הסרת איש הצוות נכשלה.');
          }
        },
      },
    ]);
  }, [deal, refetchTeam]);

  // ── Add payment ──
  const handleAddPayment = useCallback(async () => {
    if (!deal || !newPayAmount.trim() || !newPayDate.trim()) return;
    try {
      await paymentsApi.add(deal.id, {
        amount: newPayAmount.trim(),
        due_date: newPayDate.trim(),
        description: newPayDesc.trim() || `תשלום ${payments.length + 1}`,
      });
      await refetchPayments();
      setShowAddPayment(false);
      setNewPayAmount('');
      setNewPayDate('');
      setNewPayDesc('');
    } catch {
      Alert.alert('שגיאה', 'הוספת תשלום נכשלה.');
    }
  }, [deal, newPayAmount, newPayDate, newPayDesc, payments.length, refetchPayments]);

  const handleMarkPaid = useCallback(async (paymentId: number) => {
    if (!deal) return;
    try {
      await paymentsApi.markPaid(deal.id, paymentId);
      await refetchPayments();
    } catch {
      Alert.alert('שגיאה', 'סימון התשלום נכשל.');
    }
  }, [deal, refetchPayments]);

  // ── Payment summary ──
  const paymentSummary = useMemo(() => {
    const total = payments.reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
    const paid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
    return { total, paid, pct: total > 0 ? Math.round((paid / total) * 100) : 0 };
  }, [payments]);

  // ── Loading / Error ──
  if (dealState.status === 'loading' || dealState.status === 'idle') {
    return (
      <LinearGradient colors={['#0e0d07', '#221f10']} style={s.container}>
        <View style={s.centered}>
          <ActivityIndicator color={GOLD} size="large" />
        </View>
      </LinearGradient>
    );
  }

  if (dealState.status === 'error' || !deal) {
    return (
      <LinearGradient colors={['#0e0d07', '#221f10']} style={s.container}>
        <SafeAreaView style={s.safeArea} edges={['top']}>
          <View style={s.centered}>
            <Ionicons name="alert-circle-outline" size={36} color={GOLD} />
            <Text style={s.errorText}>לא ניתן לטעון עסקה</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[s.errorText, { color: GOLD }]}>חזור</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0e0d07', '#221f10']}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={s.headerArea}>
          <View style={s.header}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={18} color={TEXT_MID} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>ניהול עסקה</Text>
            <View style={s.iconBtn} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />
          }
        >
          {/* ═══ Section 1: Deal Info + Stage Progress ═══ */}
          <View style={s.card}>
            <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Client + apartment info */}
            <View style={s.infoRow}>
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>לקוח</Text>
                <Text style={s.infoValue}>{deal.user?.full_name || 'לא ידוע'}</Text>
              </View>
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>דירה</Text>
                <Text style={s.infoValue} numberOfLines={1}>
                  {deal.apartment?.apartment_specific_address || 'לא ידוע'}
                </Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>מחיר</Text>
                <Text style={s.infoValue}>{formatPrice(deal.apartment?.price)}</Text>
              </View>
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>סטטוס</Text>
                <Text style={[s.infoValue, { color: GOLD }]}>
                  {deal.status === 'Active' ? 'פעילה' : deal.status === 'Completed' ? 'הושלמה' : 'בוטלה'}
                </Text>
              </View>
            </View>

            {/* Stage tracker */}
            <Text style={s.sectionSubtitle}>שלב נוכחי</Text>
            <View style={s.stagesRow}>
              {STAGE_ORDER.map((stage, i) => {
                const isDone = i < currentStageIdx;
                const isCurrent = i === currentStageIdx;
                return (
                  <View
                    key={stage}
                    style={[s.stageChip, isDone && s.stageChipDone, isCurrent && s.stageChipCurrent]}
                  >
                    {isDone && <Ionicons name="checkmark" size={12} color={DARK} />}
                    <Text style={[s.stageChipText, isDone && s.stageChipTextDone, isCurrent && s.stageChipTextCurrent]}>
                      {STAGE_LABELS[stage]}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Advance stage button */}
            {canAdvance && (
              <TouchableOpacity
                style={s.advanceBtn}
                onPress={handleAdvanceStage}
                disabled={advancing}
                activeOpacity={0.85}
              >
                {advancing ? (
                  <ActivityIndicator color={DARK} size="small" />
                ) : (
                  <>
                    <Text style={s.advanceBtnText}>
                      קדם לשלב: {STAGE_LABELS[STAGE_ORDER[currentStageIdx + 1]]}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={DARK} />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* ═══ Section 2: Documents ═══ */}
          <View style={s.card}>
            <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={s.cardHeader}>
              <TouchableOpacity
                style={s.addBtn}
                onPress={handleUploadDoc}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={GOLD} size="small" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={18} color={GOLD} />
                )}
                <Text style={s.addBtnText}>העלאה</Text>
              </TouchableOpacity>
              <Text style={s.cardTitle}>מסמכים</Text>
            </View>

            {docs.length === 0 ? (
              <Text style={s.emptyText}>אין מסמכים</Text>
            ) : (
              docs.map((doc) => (
                <View key={doc.id} style={s.docRow}>
                  <View style={s.docActions}>
                    {/* View */}
                    {doc.file && (
                      <TouchableOpacity onPress={() => Linking.openURL(doc.file)} style={s.miniBtn}>
                        <Ionicons name="eye-outline" size={16} color={TEXT_DIM} />
                      </TouchableOpacity>
                    )}
                    {/* Approve/Reject for pending signatures */}
                    {doc.signing_status === 'PENDING' && (
                      <>
                        <TouchableOpacity
                          onPress={() => handleApproveDoc(doc.id)}
                          style={[s.miniBtn, { backgroundColor: SUCCESS + '26' }]}
                        >
                          <Ionicons name="checkmark" size={16} color={SUCCESS} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRejectDoc(doc.id)}
                          style={[s.miniBtn, { backgroundColor: ERROR + '26' }]}
                        >
                          <Ionicons name="close" size={16} color={ERROR} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  <View style={s.docInfo}>
                    <Text style={s.docName} numberOfLines={1}>{doc.filename}</Text>
                    <View style={s.docMeta}>
                      <View style={[s.statusDot, { backgroundColor: SIGNING_COLORS[doc.signing_status] }]} />
                      <Text style={[s.docStatus, { color: SIGNING_COLORS[doc.signing_status] }]}>
                        {SIGNING_LABELS[doc.signing_status]}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ═══ Section 3: Team ═══ */}
          <View style={s.card}>
            <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={s.cardHeader}>
              <TouchableOpacity style={s.addBtn} onPress={() => setShowAddTeam(!showAddTeam)}>
                <Ionicons name={showAddTeam ? 'close' : 'add'} size={18} color={GOLD} />
                <Text style={s.addBtnText}>{showAddTeam ? 'ביטול' : 'הוסף'}</Text>
              </TouchableOpacity>
              <Text style={s.cardTitle}>צוות</Text>
            </View>

            {showAddTeam && (
              <View style={s.formCard}>
                {/* Role toggle */}
                <View style={s.roleRow}>
                  {(['DEAL_MANAGER', 'LAWYER'] as const).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[s.roleChip, newTeamRole === role && s.roleChipActive]}
                      onPress={() => setNewTeamRole(role)}
                    >
                      <Text style={[s.roleChipText, newTeamRole === role && s.roleChipTextActive]}>
                        {role === 'DEAL_MANAGER' ? 'מנהל עסקה' : 'עורך דין'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={s.input}
                  placeholder="שם"
                  placeholderTextColor={TEXT_25}
                  value={newTeamName}
                  onChangeText={setNewTeamName}
                  textAlign="right"
                />
                <TextInput
                  style={s.input}
                  placeholder="טלפון"
                  placeholderTextColor={TEXT_25}
                  value={newTeamPhone}
                  onChangeText={setNewTeamPhone}
                  keyboardType="phone-pad"
                  textAlign="right"
                />
                <TextInput
                  style={s.input}
                  placeholder="אימייל"
                  placeholderTextColor={TEXT_25}
                  value={newTeamEmail}
                  onChangeText={setNewTeamEmail}
                  keyboardType="email-address"
                  textAlign="right"
                />
                <TouchableOpacity
                  style={[s.formSubmitBtn, !newTeamName.trim() && { opacity: 0.4 }]}
                  onPress={handleAddTeamMember}
                  disabled={!newTeamName.trim()}
                >
                  <Text style={s.formSubmitText}>הוסף</Text>
                </TouchableOpacity>
              </View>
            )}

            {team.length === 0 && !showAddTeam ? (
              <Text style={s.emptyText}>אין אנשי צוות</Text>
            ) : (
              team.map((member) => (
                <View key={member.id} style={s.teamRow}>
                  <TouchableOpacity onPress={() => handleRemoveTeamMember(member.id)} style={s.miniBtn}>
                    <Ionicons name="trash-outline" size={14} color={ERROR} />
                  </TouchableOpacity>
                  <View style={s.teamInfo}>
                    <Text style={s.teamName}>{member.name}</Text>
                    <Text style={s.teamRole}>
                      {member.role === 'DEAL_MANAGER' ? 'מנהל עסקה' : 'עורך דין'}
                      {member.phone ? ` • ${member.phone}` : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ═══ Section 4: Payments ═══ */}
          <View style={s.card}>
            <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={s.cardHeader}>
              <TouchableOpacity style={s.addBtn} onPress={() => setShowAddPayment(!showAddPayment)}>
                <Ionicons name={showAddPayment ? 'close' : 'add'} size={18} color={GOLD} />
                <Text style={s.addBtnText}>{showAddPayment ? 'ביטול' : 'הוסף'}</Text>
              </TouchableOpacity>
              <Text style={s.cardTitle}>תשלומים</Text>
            </View>

            {/* Summary bar */}
            {payments.length > 0 && (
              <View style={s.paySummary}>
                <View style={s.paySummaryRow}>
                  <Text style={s.paySummaryPct}>{paymentSummary.pct}%</Text>
                  <Text style={s.paySummaryLabel}>
                    {formatPrice(String(paymentSummary.paid))} מתוך {formatPrice(String(paymentSummary.total))}
                  </Text>
                </View>
                <View style={s.payBar}>
                  <View style={[s.payBarFill, { width: `${paymentSummary.pct}%` }]} />
                </View>
              </View>
            )}

            {showAddPayment && (
              <View style={s.formCard}>
                <TextInput
                  style={s.input}
                  placeholder="סכום (₪)"
                  placeholderTextColor={TEXT_25}
                  value={newPayAmount}
                  onChangeText={setNewPayAmount}
                  keyboardType="numeric"
                  textAlign="right"
                />
                <TextInput
                  style={s.input}
                  placeholder="תאריך (YYYY-MM-DD)"
                  placeholderTextColor={TEXT_25}
                  value={newPayDate}
                  onChangeText={setNewPayDate}
                  textAlign="right"
                />
                <TextInput
                  style={s.input}
                  placeholder="תיאור (אופציונלי)"
                  placeholderTextColor={TEXT_25}
                  value={newPayDesc}
                  onChangeText={setNewPayDesc}
                  textAlign="right"
                />
                <TouchableOpacity
                  style={[s.formSubmitBtn, (!newPayAmount.trim() || !newPayDate.trim()) && { opacity: 0.4 }]}
                  onPress={handleAddPayment}
                  disabled={!newPayAmount.trim() || !newPayDate.trim()}
                >
                  <Text style={s.formSubmitText}>הוסף תשלום</Text>
                </TouchableOpacity>
              </View>
            )}

            {payments.length === 0 && !showAddPayment ? (
              <Text style={s.emptyText}>אין תשלומים</Text>
            ) : (
              payments.map((pay) => (
                <View key={pay.id} style={s.payRow}>
                  {/* Mark paid button */}
                  {pay.status !== 'paid' && (
                    <TouchableOpacity
                      onPress={() => handleMarkPaid(pay.id)}
                      style={[s.miniBtn, { backgroundColor: SUCCESS + '26' }]}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color={SUCCESS} />
                    </TouchableOpacity>
                  )}
                  {pay.status === 'paid' && (
                    <View style={s.miniBtn}>
                      <Ionicons name="checkmark-circle" size={16} color={SUCCESS} />
                    </View>
                  )}
                  <View style={s.payInfo}>
                    <View style={s.payTop}>
                      <Text style={[s.payStatus, {
                        color: pay.status === 'paid' ? SUCCESS : pay.status === 'pending' ? WARN : TEXT_MID,
                      }]}>
                        {pay.status === 'paid' ? 'שולם' : pay.status === 'pending' ? 'ממתין' : 'עתידי'}
                      </Text>
                      <Text style={s.payAmount}>{formatPrice(pay.amount)}</Text>
                    </View>
                    <Text style={s.payDesc}>
                      {pay.description} • {new Date(pay.due_date).toLocaleDateString('he-IL')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontFamily: Fonts.heebo.regular, fontSize: 15, color: TEXT_MID },

  // Header
  headerArea: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  header: {
    height: 48,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    backgroundColor: GLASS,
  },
  headerTitle: { fontFamily: Fonts.manrope.bold, fontSize: 18, color: TEXT },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  // Scroll
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, gap: 16 },

  // Card
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { fontFamily: Fonts.manrope.bold, fontSize: 16, color: TEXT },

  // Info rows
  infoRow: { flexDirection: 'row', gap: 12 },
  infoCol: { flex: 1, alignItems: 'flex-end', gap: 2 },
  infoLabel: { fontFamily: Fonts.heebo.regular, fontSize: 12, color: TEXT_MID },
  infoValue: { fontFamily: Fonts.manrope.bold, fontSize: 14, color: TEXT, textAlign: 'right' },
  sectionSubtitle: { fontFamily: Fonts.manrope.bold, fontSize: 14, color: TEXT, textAlign: 'right' },

  // Stage chips
  stagesRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  stageChip: {
    flex: 1, borderRadius: 12, backgroundColor: GLASS, borderWidth: 1, borderColor: BORDER,
    paddingVertical: 7, paddingHorizontal: 4, alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: 4,
  },
  stageChipDone: { backgroundColor: GOLD, borderColor: GOLD },
  stageChipCurrent: { backgroundColor: GOLD_TINT, borderColor: GOLD_RING },
  stageChipText: { fontFamily: Fonts.manrope.bold, fontSize: 11, color: TEXT_MID },
  stageChipTextDone: { color: DARK },
  stageChipTextCurrent: { color: GOLD },

  // Advance button
  advanceBtn: {
    height: 44, borderRadius: 14, backgroundColor: GOLD,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  advanceBtnText: { fontFamily: Fonts.manrope.bold, fontSize: 14, color: DARK },

  // Add button (inline)
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontFamily: Fonts.heebo.medium, fontSize: 13, color: GOLD },

  // Document row
  docRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER,
  },
  docInfo: { flex: 1, alignItems: 'flex-end', gap: 4 },
  docName: { fontFamily: Fonts.manrope.semiBold, fontSize: 13, color: TEXT, textAlign: 'right' },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  docStatus: { fontFamily: Fonts.heebo.regular, fontSize: 11 },
  docActions: { flexDirection: 'row', gap: 6 },

  // Mini button (icon actions)
  miniBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: GLASS, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },

  // Team row
  teamRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER,
  },
  teamInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
  teamName: { fontFamily: Fonts.manrope.bold, fontSize: 14, color: TEXT },
  teamRole: { fontFamily: Fonts.heebo.regular, fontSize: 12, color: TEXT_MID },

  // Form card (inline)
  formCard: {
    gap: 10, backgroundColor: '#ffffff08', borderRadius: 14,
    padding: 12, borderWidth: 1, borderColor: BORDER,
  },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: {
    flex: 1, borderRadius: 10, paddingVertical: 8,
    backgroundColor: GLASS, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center',
  },
  roleChipActive: { backgroundColor: GOLD, borderColor: GOLD },
  roleChipText: { fontFamily: Fonts.manrope.semiBold, fontSize: 12, color: TEXT_MID },
  roleChipTextActive: { color: DARK },
  input: {
    height: 42, borderRadius: 10, borderWidth: 1, borderColor: BORDER,
    backgroundColor: GLASS, paddingHorizontal: 12,
    fontFamily: Fonts.heebo.regular, fontSize: 14, color: TEXT,
  },
  formSubmitBtn: {
    height: 40, borderRadius: 10, backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
  formSubmitText: { fontFamily: Fonts.manrope.bold, fontSize: 13, color: DARK },

  // Payment rows
  paySummary: { gap: 6 },
  paySummaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paySummaryLabel: { fontFamily: Fonts.heebo.regular, fontSize: 12, color: TEXT_DIM },
  paySummaryPct: { fontFamily: Fonts.manrope.bold, fontSize: 13, color: GOLD },
  payBar: { height: 8, borderRadius: 4, backgroundColor: GLASS, overflow: 'hidden' },
  payBarFill: { height: '100%', borderRadius: 4, backgroundColor: GOLD },

  payRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER,
  },
  payInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
  payTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  payAmount: { fontFamily: Fonts.manrope.bold, fontSize: 14, color: TEXT },
  payStatus: { fontFamily: Fonts.heebo.medium, fontSize: 11 },
  payDesc: { fontFamily: Fonts.heebo.regular, fontSize: 12, color: TEXT_MID, textAlign: 'right' },

  // Empty
  emptyText: { fontFamily: Fonts.heebo.regular, fontSize: 14, color: TEXT_MID, textAlign: 'right' },
});
