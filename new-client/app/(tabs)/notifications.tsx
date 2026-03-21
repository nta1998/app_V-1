import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, useCallback } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { notificationsApi, type Notification } from '../../services/api';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - date) / 60_000);
  if (diffMin < 1) return 'עכשיו';
  if (diffMin < 60) return `לפני ${diffMin} דק׳`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'אתמול';
  return `לפני ${diffDays} ימים`;
}

export default function NotificationsScreen() {
  const { colors, mode } = useTheme();
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
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : state.status === 'error' ? (
          <View style={styles.loadingWrap}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.primary} />
            <Text style={styles.errorText}>{state.error}</Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={[styles.errorText, { color: colors.primary }]}>נסה שוב</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.loadingWrap}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textWhite25} />
            <Text style={styles.emptyText}>אין התראות</Text>
          </View>
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
              <TouchableOpacity
                key={notif.id}
                style={styles.notifRow}
                activeOpacity={0.7}
                onPress={() => handlePress(notif)}
              >
                {/* Icon */}
                <View style={styles.iconBg}>
                  <Ionicons
                    name={notif.is_read ? 'notifications-outline' : 'notifications'}
                    size={20}
                    color={colors.primary}
                  />
                </View>

                {/* Text group */}
                <View style={styles.textGroup}>
                  <Text style={styles.notifTitle} numberOfLines={1}>
                    {notif.title}
                  </Text>
                  <Text style={styles.notifSub} numberOfLines={2}>
                    {notif.message}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.timeText}>{timeAgo(notif.created_at)}</Text>
                  </View>
                </View>

                {/* Unread dot */}
                <View
                  style={[
                    styles.unreadDot,
                    !notif.is_read && styles.unreadDotActive,
                  ]}
                />
              </TouchableOpacity>
            ))}

            <View style={{ height: 16 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: 16, gap: 12 },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingTop: 12,
      paddingBottom: 8,
      gap: 10,
    },
    headerTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 28,
      color: colors.textWhite,
      textAlign: 'right',
    },
    headerBadge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      minWidth: 20,
      alignItems: 'center',
    },
    headerBadgeText: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 11,
      color: colors.bgDeep,
    },

    // Scroll
    scrollWrap: { flex: 1 },
    scrollContent: { gap: 8, paddingBottom: 8 },

    // Notification Row — matches Pencil component dMQyG exactly
    notifRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 68,
      borderRadius: 16,
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: 14,
      gap: 12,
    },

    // Icon bg — 40x40 rounded with gold tint
    iconBg: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Text group
    textGroup: {
      flex: 1,
      alignItems: 'flex-end',
      gap: 3,
    },
    notifTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 14,
      color: colors.textWhite,
      textAlign: 'right',
    },
    notifSub: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 12,
      color: colors.textWhite50,
      textAlign: 'right',
      alignSelf: 'stretch',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      alignSelf: 'stretch',
      gap: 6,
    },
    timeText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 11,
      color: colors.textWhite50,
      textAlign: 'right',
    },

    // Unread dot — 8x8 ellipse
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'transparent',
    },
    unreadDotActive: {
      backgroundColor: colors.primary,
    },

    // States
    errorText: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 15,
      color: colors.textWhite50,
    },
    emptyText: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 16,
      color: colors.textWhite50,
    },
  });
