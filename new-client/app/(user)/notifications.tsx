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
import { makeStyles } from './styles/notifications.styles';
import { useApi } from '../../hooks/useApi';
import { notificationsApi, type Notification } from '../../services/api';
import StateView from '../../components/StateView';
import NotificationRow from '../../components/Notifications/NotificationRow';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, refetch } = useApi(notificationsApi.list);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const notifications: Notification[] = state.status === 'success' ? state.data : [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handlePress = async (notif: Notification) => {
    if (!notif.is_read) {
      try { await notificationsApi.markRead(notif.id); } catch { /* ignore */ }
      refetch();
    }
  };

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
          <Text style={styles.headerTitle}>התראות</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        {(state.status === 'loading' || state.status === 'idle') && !refreshing ? (
          <StateView status="loading" />
        ) : state.status === 'error' ? (
          <StateView status="error" error={state.error} onRetry={() => refetch()} />
        ) : notifications.length === 0 ? (
          <StateView status="empty" icon="notifications-off-outline" message="אין התראות" />
        ) : (
          <ScrollView
            style={styles.scrollWrap}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          >
            {notifications.map((notif) => (
              <NotificationRow
                key={notif.id}
                notification={notif}
                onPress={handlePress}
              />
            ))}

            <View style={{ height: 16 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

