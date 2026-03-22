import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { makeStyles } from './styles/deal.styles';
import { useApi } from '../../hooks/useApi';
import {
  dealsApi,
  dealTeamApi,
  paymentsApi,
  type Deal,
  type DealTeamMember,
  type Payment,
} from '../../services/api';
import StateView from '../../components/StateView';
import ApartmentDetailsCard from '../../components/Deal/ApartmentDetailsCard';
import DealProgressTracker from '../../components/Deal/DealProgressTracker';
import DealTeamSection from '../../components/Deal/DealTeamSection';
import DocumentCard from '../../components/Deal/DocumentCard';
import PaymentSummarySection from '../../components/Deal/PaymentSummarySection';
import PaymentItemCard from '../../components/Deal/PaymentItemCard';

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
          <StateView status="loading" />
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
          <StateView status="error" message="שגיאה בטעינת הנתונים" onRetry={() => refetch()} />
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
          <StateView status="empty" icon="home-outline" message="אין עסקה פעילה" />
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          {/* Section 1: Apartment Details */}
          <ApartmentDetailsCard apartment={deal.apartment} project={deal.project} />

          {/* Section 2: Progress Tracker */}
          <DealProgressTracker currentStage={deal.stage} transactions={deal.transactions} />

          {/* Section 3: Team */}
          <DealTeamSection team={team} />

          {/* Section 4: Documents */}
          {deal.documents.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>מסמכים</Text>
              <View style={styles.docList}>
                {deal.documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </View>
            </View>
          )}

          {/* Section 5: Payment Schedule */}
          {payments.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>לוח תשלומים</Text>
              <PaymentSummarySection
                totalPayments={totalPayments}
                paidPayments={paidPayments}
                paidPercent={paidPercent}
              />
              <View style={styles.paymentList}>
                {payments.map((payment) => (
                  <PaymentItemCard key={payment.id} payment={payment} />
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

