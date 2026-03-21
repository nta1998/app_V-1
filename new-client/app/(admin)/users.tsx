import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { auth, adminNotificationsApi, type User, type UserStatus } from '../../services/api';

const STATUS_FILTERS: { key: UserStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'pending', label: 'ממתינים' },
  { key: 'approved', label: 'מאושרים' },
  { key: 'blocked', label: 'חסומים' },
];

function getInitials(name: string | undefined): string {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((w) => w.charAt(0)).join('');
}

function getStatusColor(status: UserStatus | undefined, colors: ThemeColors) {
  switch (status) {
    case 'approved': return '#34d399';
    case 'pending': return '#fbbf24';
    case 'blocked': return '#f87171';
    default: return colors.textWhite50;
  }
}

function getStatusLabel(status: UserStatus | undefined) {
  switch (status) {
    case 'approved': return 'מאושר';
    case 'pending': return 'ממתין';
    case 'blocked': return 'חסום';
    default: return 'לא ידוע';
  }
}

export default function AdminUsersScreen() {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, refetch } = useApi(auth.listUsers);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<UserStatus | 'all'>('all');

  // Notification modal state
  const [notifUser, setNotifUser] = useState<User | null>(null);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSending, setNotifSending] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const users: User[] = state.status === 'success' ? state.data : [];

  const filteredUsers = useMemo(() => {
    if (activeFilter === 'all') return users;
    return users.filter((u) => u.status === activeFilter);
  }, [users, activeFilter]);

  const pendingCount = useMemo(() => users.filter((u) => u.status === 'pending').length, [users]);

  const rows = useMemo(() => {
    const result: User[][] = [];
    for (let i = 0; i < filteredUsers.length; i += 2) {
      result.push(filteredUsers.slice(i, i + 2));
    }
    return result;
  }, [filteredUsers]);

  const handleUserPress = useCallback((user: User) => {
    setSelectedUser((prev) => (prev?.id === user.id ? null : user));
  }, []);

  // ── Approve / Block ──
  const handleApprove = useCallback(async (user: User) => {
    try {
      await auth.approveUser(user.id);
      await refetch();
      setSelectedUser(null);
    } catch {
      Alert.alert('שגיאה', 'אישור המשתמש נכשל.');
    }
  }, [refetch]);

  const handleBlock = useCallback(async (user: User) => {
    Alert.alert('חסימת משתמש', `האם לחסום את ${user.full_name || 'משתמש'}?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'חסום',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth.blockUser(user.id);
            await refetch();
            setSelectedUser(null);
          } catch {
            Alert.alert('שגיאה', 'חסימת המשתמש נכשלה.');
          }
        },
      },
    ]);
  }, [refetch]);

  // ── Send notification ──
  const handleSendNotification = useCallback(async () => {
    if (!notifUser || !notifTitle.trim() || !notifMessage.trim()) return;
    setNotifSending(true);
    try {
      await adminNotificationsApi.send(notifUser.id, {
        title: notifTitle.trim(),
        message: notifMessage.trim(),
      });
      Alert.alert('ההתראה נשלחה');
      setNotifUser(null);
      setNotifTitle('');
      setNotifMessage('');
    } catch {
      Alert.alert('שגיאה', 'שליחת ההתראה נכשלה.');
    } finally {
      setNotifSending(false);
    }
  }, [notifUser, notifTitle, notifMessage]);

  const renderUserCard = (item: User) => {
    const initials = getInitials(item.full_name);
    const isSelected = selectedUser?.id === item.id;
    const statusColor = getStatusColor(item.status, colors);

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.userCardWrapper, isSelected && styles.userCardSelected]}
        activeOpacity={0.7}
        onPress={() => handleUserPress(item)}
      >
        <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.userCard}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <Text style={styles.userName} numberOfLines={1}>
            {item.full_name || 'ללא שם'}
          </Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const renderExpandedCard = (user: User) => (
    <View style={styles.expandedCard}>
      <LinearGradient
        colors={[colors.bgDeep, '#1a170980']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.expandedContent}>
        <View style={styles.expandedHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedUser(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color={colors.textWhite70} />
          </TouchableOpacity>
          <View style={styles.expandedInfo}>
            <Text style={styles.expandedName}>{user.full_name || 'ללא שם'}</Text>
            <Text style={styles.expandedPhone}>{user.phone_number || user.email}</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(user.status, colors) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(user.status, colors) }]}>
                {getStatusLabel(user.status)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.expandedActions}>
          {/* Approve button (show for pending users) */}
          {user.status === 'pending' && (
            <TouchableOpacity
              style={[styles.goldButton, { backgroundColor: '#34d399' }]}
              activeOpacity={0.7}
              onPress={() => handleApprove(user)}
            >
              <Ionicons name="checkmark-circle" size={16} color={colors.bgDark} />
              <Text style={styles.goldButtonText}>אישור משתמש</Text>
            </TouchableOpacity>
          )}
          {/* Block button (show for non-blocked users) */}
          {user.status !== 'blocked' && (
            <TouchableOpacity
              style={[styles.outlineButton, { borderColor: '#f87171' }]}
              activeOpacity={0.7}
              onPress={() => handleBlock(user)}
            >
              <Ionicons name="ban" size={16} color="#f87171" />
              <Text style={[styles.outlineButtonText, { color: '#f87171' }]}>חסום</Text>
            </TouchableOpacity>
          )}
          {/* Send notification */}
          <TouchableOpacity
            style={styles.goldButton}
            activeOpacity={0.7}
            onPress={() => {
              setNotifUser(user);
              setSelectedUser(null);
            }}
          >
            <Ionicons name="notifications" size={16} color={colors.bgDark} />
            <Text style={styles.goldButtonText}>שליחת התראה</Text>
          </TouchableOpacity>
          {/* Manage deal */}
          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.7}>
            <Ionicons name="briefcase-outline" size={16} color={colors.primary} />
            <Text style={styles.outlineButtonText}>ניהול עסקה</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <BlurView
          intensity={30}
          tint={mode === 'dark' ? 'dark' : 'light'}
          style={styles.header}
        >
          <TouchableOpacity style={styles.headerButton} onPress={() => {}}>
            <Ionicons name="search" size={20} color={colors.textWhite70} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ניהול לקוחות</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={colors.textWhite70} />
          </TouchableOpacity>
        </BlurView>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            const count = f.key === 'all' ? users.length
              : f.key === 'pending' ? pendingCount
              : users.filter((u) => u.status === f.key).length;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {f.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        {state.status === 'loading' && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : state.status === 'error' ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.primary} />
            <Text style={styles.emptyText}>לא ניתן לטעון לקוחות</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryText}>נסה שנית</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.gridWrap}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          >
            {rows.map((row, rowIndex) => {
              const rowHasSelected =
                selectedUser != null && row.some((u) => u.id === selectedUser.id);
              return rowHasSelected ? (
                <View key={rowIndex}>{renderExpandedCard(selectedUser!)}</View>
              ) : (
                <View key={rowIndex} style={styles.row}>
                  {row.map((user) => renderUserCard(user))}
                  {row.length < 2 && <View style={{ flex: 1 }} />}
                </View>
              );
            })}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ═══ Send Notification Modal ═══ */}
      <Modal visible={notifUser != null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient
              colors={[colors.bgDark, colors.bgDeep]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { setNotifUser(null); setNotifTitle(''); setNotifMessage(''); }}>
                <Ionicons name="close" size={22} color={colors.textWhite70} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>שליחת התראה ל{notifUser?.full_name}</Text>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="כותרת"
              placeholderTextColor={colors.textWhite25}
              value={notifTitle}
              onChangeText={setNotifTitle}
              textAlign="right"
            />
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="תוכן ההתראה"
              placeholderTextColor={colors.textWhite25}
              value={notifMessage}
              onChangeText={setNotifMessage}
              multiline
              textAlign="right"
            />
            <TouchableOpacity
              style={[styles.modalSendBtn, (!notifTitle.trim() || !notifMessage.trim()) && { opacity: 0.4 }]}
              onPress={handleSendNotification}
              disabled={!notifTitle.trim() || !notifMessage.trim() || notifSending}
            >
              {notifSending ? (
                <ActivityIndicator color={colors.bgDark} size="small" />
              ) : (
                <Text style={styles.modalSendText}>שלח</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: 16 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 48,
      marginTop: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
      paddingHorizontal: 10,
    },
    headerButton: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.glass20, borderWidth: 1, borderColor: colors.borderLight,
      alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontFamily: Fonts.manrope.bold, fontSize: 18, color: colors.textWhite },

    // Filter row
    filterRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      paddingVertical: 12,
    },
    filterChip: {
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 16, backgroundColor: colors.glass20,
      borderWidth: 1, borderColor: colors.borderLight,
    },
    filterChipActive: {
      backgroundColor: colors.primary, borderColor: colors.primary,
    },
    filterChipText: {
      fontFamily: Fonts.heebo.medium, fontSize: 12, color: colors.textWhite70,
    },
    filterChipTextActive: { color: colors.bgDark },

    // Status badge
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontFamily: Fonts.heebo.regular, fontSize: 11 },

    // User grid
    gridWrap: { flex: 1 },
    listContent: { gap: 12, paddingTop: 4 },
    row: { flexDirection: 'row', gap: 12 },
    userCardWrapper: {
      flex: 1, height: 150, borderRadius: 20,
      borderWidth: 1, borderColor: colors.borderLight, overflow: 'hidden',
    },
    userCard: {
      flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12,
    },
    userCardSelected: { borderColor: colors.primary, borderWidth: 2 },
    userAvatar: { width: 52, height: 52, borderRadius: 26 },
    avatarPlaceholder: {
      width: 52, height: 52, borderRadius: 26,
      backgroundColor: colors.glass60, alignItems: 'center', justifyContent: 'center',
    },
    avatarInitials: { fontFamily: Fonts.manrope.bold, fontSize: 18, color: colors.primary },
    userName: {
      fontFamily: Fonts.manrope.bold, fontSize: 14, color: colors.textWhite, textAlign: 'center',
    },

    // Expanded card
    expandedCard: {
      borderRadius: 20, borderWidth: 2, borderColor: colors.borderGold,
      overflow: 'hidden', minHeight: 220,
    },
    expandedContent: { flex: 1, padding: 16, gap: 10, justifyContent: 'space-between' },
    expandedHeader: {
      flexDirection: 'row', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: 10,
    },
    closeButton: {
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: colors.glass100, alignItems: 'center', justifyContent: 'center',
    },
    expandedInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
    expandedName: {
      fontFamily: Fonts.manrope.bold, fontSize: 16, color: colors.textWhite, textAlign: 'right',
    },
    expandedPhone: {
      fontFamily: Fonts.heebo.regular, fontSize: 12, color: colors.textWhite70, textAlign: 'right',
    },
    expandedActions: { gap: 8 },
    goldButton: {
      flexDirection: 'row', height: 40, borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    goldButtonText: { fontFamily: Fonts.manrope.bold, fontSize: 13, color: colors.bgDark },
    outlineButton: {
      flexDirection: 'row', height: 40, borderRadius: 14,
      borderWidth: 1, borderColor: colors.borderGold,
      backgroundColor: colors.bgDark,
      alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    outlineButtonText: { fontFamily: Fonts.manrope.semiBold, fontSize: 13, color: colors.primary },

    // Notification modal
    modalOverlay: {
      flex: 1, backgroundColor: '#00000099',
      justifyContent: 'flex-end',
    },
    modalCard: {
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      overflow: 'hidden', padding: 20, gap: 14,
      borderWidth: 1, borderColor: colors.borderLight,
      borderBottomWidth: 0,
    },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalTitle: { fontFamily: Fonts.manrope.bold, fontSize: 16, color: colors.textWhite },
    modalInput: {
      height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight,
      backgroundColor: colors.glass20, paddingHorizontal: 14,
      fontFamily: Fonts.heebo.regular, fontSize: 14, color: colors.textWhite,
    },
    modalSendBtn: {
      height: 48, borderRadius: 14, backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    modalSendText: { fontFamily: Fonts.manrope.bold, fontSize: 15, color: colors.bgDark },

    // States
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { fontFamily: Fonts.heebo.regular, fontSize: 15, color: colors.textWhite50 },
    retryButton: {
      backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10,
    },
    retryText: { fontFamily: Fonts.manrope.bold, fontSize: 14, color: colors.bgDark },
  });
