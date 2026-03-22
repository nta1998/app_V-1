import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { makeStyles } from './styles/transactions.styles';
import { useApi } from '../../hooks/useApi';
import { dealsApi, type Deal } from '../../services/api';
import StateView from '../../components/StateView';
import TransactionDealHeader from '../../components/Transactions/TransactionDealHeader';
import TransactionRowItem from '../../components/Transactions/TransactionRowItem';

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state } = useApi(dealsApi.list);

  const deals: Deal[] = state.status === 'success' ? state.data : [];

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>עסקאות</Text>
        </View>

        {state.status === 'loading' && (
          <StateView status="loading" />
        )}

        {state.status === 'error' && (
          <StateView status="error" message="שגיאה בטעינת הנתונים" />
        )}

        {state.status === 'success' && deals.length === 0 && (
          <StateView status="empty" icon="receipt-outline" message="אין עסקאות להצגה" />
        )}

        {state.status === 'success' && deals.length > 0 && (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {deals.map((deal) => (
              <View key={deal.id} style={styles.dealCard}>
                {/* Deal Header */}
                <TransactionDealHeader deal={deal} />

                {/* Transactions List */}
                {deal.transactions.length > 0 && (
                  <View style={styles.transactionsList}>
                    <View style={styles.separator} />
                    {deal.transactions.map((tx, idx) => (
                      <TransactionRowItem
                        key={tx.id}
                        transaction={tx}
                        showSeparator={idx < deal.transactions.length - 1}
                      />
                    ))}
                  </View>
                )}

                {deal.transactions.length === 0 && (
                  <View style={styles.noTxRow}>
                    <Text style={styles.noTxText}>אין עדכוני עסקה</Text>
                  </View>
                )}
              </View>
            ))}
            <View style={{ height: 110 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

