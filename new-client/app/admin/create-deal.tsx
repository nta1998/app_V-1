import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import {
  auth,
  projectsApi,
  apartmentsApi,
  dealsApi,
  type User,
  type Project,
  type Apartment,
  type CreateDealPayload,
} from '../../services/api';

type Step = 1 | 2 | 3;

interface TeamMemberForm {
  role: 'DEAL_MANAGER' | 'LAWYER';
  name: string;
  phone: string;
  email: string;
}

interface PaymentForm {
  due_date: string;
  amount: string;
  description: string;
}

const STEP_LABELS = ['בחירת לקוח', 'בחירת דירה', 'הגדרות'];

export default function CreateDealScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Client selection
  const { state: usersState } = useApi(() => auth.listUsers('approved'));
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Step 2: Apartment selection
  const { state: projectsState } = useApi(projectsApi.list);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);
  const { state: aptsState } = useApi(
    selectedProjectId ? () => apartmentsApi.list(selectedProjectId) : null,
    [selectedProjectId],
  );

  // Step 3: Setup
  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>([
    { role: 'DEAL_MANAGER', name: '', phone: '', email: '' },
    { role: 'LAWYER', name: '', phone: '', email: '' },
  ]);
  const [payments, setPayments] = useState<PaymentForm[]>([
    { due_date: '', amount: '', description: 'תשלום ראשון' },
  ]);

  const users: User[] = usersState.status === 'success' ? usersState.data : [];
  const projects: Project[] = projectsState.status === 'success' ? projectsState.data : [];
  const apartments: Apartment[] = aptsState?.status === 'success' ? aptsState.data : [];

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
    );
  }, [users, userSearch]);

  const canNext = useCallback(() => {
    switch (step) {
      case 1: return !!selectedUserId;
      case 2: return !!selectedApartmentId;
      case 3: return teamMembers.some((t) => t.name && t.phone);
      default: return false;
    }
  }, [step, selectedUserId, selectedApartmentId, teamMembers]);

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
    else router.back();
  };

  const addPayment = () => {
    setPayments((prev) => [...prev, { due_date: '', amount: '', description: `תשלום ${prev.length + 1}` }]);
  };

  const updateTeamMember = (index: number, field: keyof TeamMemberForm, value: string) => {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updatePayment = (index: number, field: keyof PaymentForm, value: string) => {
    setPayments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedApartmentId) return;

    const validTeam = teamMembers.filter((t) => t.name && t.phone);
    const validPayments = payments.filter((p) => p.amount && p.description);

    setSubmitting(true);
    try {
      const payload: CreateDealPayload = {
        user_id: selectedUserId,
        apartment_id: selectedApartmentId,
        team_members: validTeam,
        payments: validPayments,
      };

      await dealsApi.create(payload);

      Alert.alert('העסקה נוצרה בהצלחה!', 'הלקוח יקבל התראה.', [
        { text: 'אישור', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('שגיאה', 'יצירת העסקה נכשלה. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPayments = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

  return (
    <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleBack}>
            <Ionicons name={step > 1 ? 'arrow-forward' : 'close'} size={20} color={colors.textWhite70} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>יצירת עסקה חדשה</Text>
          <View style={styles.headerBtn} />
        </View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepCircle, s <= step && styles.stepCircleActive]}>
                {s < step ? (
                  <Ionicons name="checkmark" size={12} color={colors.bgDark} />
                ) : (
                  <Text style={[styles.stepNum, s <= step && styles.stepNumActive]}>{s}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, s === step && styles.stepLabelActive]}>
                {STEP_LABELS[s - 1]}
              </Text>
            </View>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ── Step 1: Client Selection ── */}
          {step === 1 && (
            <>
              <TextInput
                style={styles.searchInput}
                placeholder="חפש לקוח..."
                placeholderTextColor={colors.textWhite25}
                value={userSearch}
                onChangeText={setUserSearch}
                textAlign="right"
              />
              {usersState.status === 'loading' ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
              ) : (
                filteredUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[styles.selectCard, selectedUserId === user.id && styles.selectCardActive]}
                    onPress={() => setSelectedUserId(user.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.selectCardIcon}>
                      <Ionicons name="person" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.selectCardInfo}>
                      <Text style={styles.selectCardTitle}>{user.full_name || 'ללא שם'}</Text>
                      <Text style={styles.selectCardSub}>{user.email}</Text>
                    </View>
                    {selectedUserId === user.id && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* ── Step 2: Apartment Selection ── */}
          {step === 2 && (
            <>
              <Text style={styles.fieldLabel}>בחר פרויקט</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ direction: 'rtl', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {projects.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.chipBtn, selectedProjectId === p.id && styles.chipBtnActive]}
                      onPress={() => { setSelectedProjectId(p.id); setSelectedApartmentId(null); }}
                    >
                      <Text style={[styles.chipBtnText, selectedProjectId === p.id && styles.chipBtnTextActive]}>
                        {p.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {selectedProjectId && (
                <>
                  <Text style={styles.fieldLabel}>בחר דירה</Text>
                  {aptsState?.status === 'loading' ? (
                    <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
                  ) : apartments.length === 0 ? (
                    <Text style={styles.emptyText}>אין דירות בפרויקט זה</Text>
                  ) : (
                    apartments.map((apt) => (
                      <TouchableOpacity
                        key={apt.id}
                        style={[styles.selectCard, selectedApartmentId === apt.id && styles.selectCardActive]}
                        onPress={() => setSelectedApartmentId(apt.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.selectCardIcon}>
                          <Ionicons name="home" size={18} color={colors.primary} />
                        </View>
                        <View style={styles.selectCardInfo}>
                          <Text style={styles.selectCardTitle}>{apt.apartment_specific_address}</Text>
                          <Text style={styles.selectCardSub}>
                            {apt.number_of_rooms} חד' • {apt.apartment_size_sqm} מ"ר • קומה {apt.floor}
                            {apt.price ? ` • ₪${parseFloat(apt.price).toLocaleString('he-IL')}` : ''}
                          </Text>
                        </View>
                        {selectedApartmentId === apt.id && (
                          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </>
              )}
            </>
          )}

          {/* ── Step 3: Setup ── */}
          {step === 3 && (
            <>
              {/* Team Members */}
              <Text style={styles.sectionTitle}>צוות טיפול</Text>
              {teamMembers.map((member, idx) => (
                <View key={idx} style={styles.formCard}>
                  <Text style={styles.formCardTitle}>
                    {member.role === 'DEAL_MANAGER' ? 'מנהל עסקה' : 'עורך דין'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="שם מלא"
                    placeholderTextColor={colors.textWhite25}
                    value={member.name}
                    onChangeText={(v) => updateTeamMember(idx, 'name', v)}
                    textAlign="right"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="טלפון"
                    placeholderTextColor={colors.textWhite25}
                    value={member.phone}
                    onChangeText={(v) => updateTeamMember(idx, 'phone', v)}
                    keyboardType="phone-pad"
                    textAlign="right"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="אימייל"
                    placeholderTextColor={colors.textWhite25}
                    value={member.email}
                    onChangeText={(v) => updateTeamMember(idx, 'email', v)}
                    keyboardType="email-address"
                    textAlign="right"
                  />
                </View>
              ))}

              {/* Payments */}
              <View style={styles.paymentHeader}>
                <TouchableOpacity style={styles.addBtn} onPress={addPayment}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addBtnText}>הוסף תשלום</Text>
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>לוח תשלומים</Text>
              </View>

              {payments.map((payment, idx) => (
                <View key={idx} style={styles.formCard}>
                  <View style={styles.paymentCardHeader}>
                    {payments.length > 1 && (
                      <TouchableOpacity onPress={() => removePayment(idx)}>
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                      </TouchableOpacity>
                    )}
                    <Text style={styles.formCardTitle}>תשלום #{idx + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="תיאור (לדוגמה: תשלום ראשון)"
                    placeholderTextColor={colors.textWhite25}
                    value={payment.description}
                    onChangeText={(v) => updatePayment(idx, 'description', v)}
                    textAlign="right"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="סכום (₪)"
                    placeholderTextColor={colors.textWhite25}
                    value={payment.amount}
                    onChangeText={(v) => updatePayment(idx, 'amount', v)}
                    keyboardType="numeric"
                    textAlign="right"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="תאריך יעד (DD/MM/YYYY)"
                    placeholderTextColor={colors.textWhite25}
                    value={payment.due_date}
                    onChangeText={(v) => updatePayment(idx, 'due_date', v)}
                    textAlign="right"
                  />
                </View>
              ))}

              {/* Payment summary */}
              {totalPayments > 0 && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>סה"כ תשלומים</Text>
                  <Text style={styles.summaryValue}>₪{totalPayments.toLocaleString('he-IL')}</Text>
                </View>
              )}
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom action */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canNext() || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={colors.bgDark} />
            ) : (
              <Text style={[styles.nextBtnText, !canNext() && styles.nextBtnTextDisabled]}>
                {step === 3 ? 'הצמד ויצור עסקה' : 'הבא'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    emptyText: { fontFamily: Fonts.heebo.regular, fontSize: 14, color: colors.textWhite50, textAlign: 'center', marginTop: 20 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: Fonts.manrope.bold, fontSize: 18, color: colors.textWhite },

    // Steps
    stepRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    stepItem: { alignItems: 'center', gap: 6 },
    stepCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.glass60,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    stepCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    stepNum: { fontFamily: Fonts.manrope.bold, fontSize: 12, color: colors.textWhite50 },
    stepNumActive: { color: colors.bgDark },
    stepLabel: { fontFamily: Fonts.heebo.regular, fontSize: 11, color: colors.textWhite50 },
    stepLabelActive: { color: colors.primary, fontFamily: Fonts.heebo.bold },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 8, gap: 10 },

    // Search
    searchInput: {
      backgroundColor: colors.glass20,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderLight,
      height: 48,
      paddingHorizontal: 16,
      fontFamily: Fonts.heebo.regular,
      fontSize: 15,
      color: colors.textWhite,
      marginBottom: 8,
    },

    // Selection cards
    selectCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.glass20,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 14,
      gap: 12,
    },
    selectCardActive: { borderColor: colors.primary, borderWidth: 2 },
    selectCardIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectCardInfo: { flex: 1, alignItems: 'flex-end', gap: 3 },
    selectCardTitle: { fontFamily: Fonts.manrope.bold, fontSize: 15, color: colors.textWhite, textAlign: 'right' },
    selectCardSub: { fontFamily: Fonts.heebo.regular, fontSize: 12, color: colors.textWhite50, textAlign: 'right' },

    // Field label
    fieldLabel: { fontFamily: Fonts.manrope.bold, fontSize: 16, color: colors.textWhite, textAlign: 'right', marginBottom: 8 },

    // Chips
    chipBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    chipBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipBtnText: { fontFamily: Fonts.manrope.semiBold, fontSize: 14, color: colors.textWhite },
    chipBtnTextActive: { color: colors.bgDark },

    // Section title
    sectionTitle: { fontFamily: Fonts.manrope.bold, fontSize: 18, color: colors.textWhite, textAlign: 'right' },

    // Form cards
    formCard: {
      backgroundColor: colors.glass20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 14,
      gap: 10,
    },
    formCardTitle: { fontFamily: Fonts.manrope.bold, fontSize: 14, color: colors.primary, textAlign: 'right' },
    input: {
      backgroundColor: colors.glass20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderLight,
      height: 44,
      paddingHorizontal: 14,
      fontFamily: Fonts.heebo.regular,
      fontSize: 14,
      color: colors.textWhite,
    },

    // Payments
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    paymentCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primaryDim,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    addBtnText: { fontFamily: Fonts.heebo.medium, fontSize: 13, color: colors.primary },

    // Summary
    summaryCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primaryDim,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.borderGold,
    },
    summaryLabel: { fontFamily: Fonts.heebo.medium, fontSize: 14, color: colors.primary },
    summaryValue: { fontFamily: Fonts.spaceGrotesk.bold, fontSize: 18, color: colors.primary },

    // Bottom bar
    bottomBar: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 0 : 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    nextBtn: {
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextBtnDisabled: { backgroundColor: colors.glass60 },
    nextBtnText: { fontFamily: Fonts.heebo.bold, fontSize: 17, color: colors.bgDark },
    nextBtnTextDisabled: { color: colors.textWhite25 },
  });
