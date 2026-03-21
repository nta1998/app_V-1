import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import { Fonts } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { auth, type User } from '../../services/api';

type LeadStatus = 'חדש' | 'בטיפול' | 'נקבע סיור';

function getLeadStatus(user: User, index: number): LeadStatus {
  const statuses: LeadStatus[] = ['חדש', 'בטיפול', 'נקבע סיור'];
  if (user.is_staff) return 'נקבע סיור';
  if (user.is_active) return 'בטיפול';
  return statuses[index % statuses.length];
}

function getLeadDescription(user: User): string {
  if (user.is_staff) return 'חבר צוות';
  if (user.phone_number && user.email) return `${user.email}`;
  if (user.email) return user.email;
  return 'משתמש רשום';
}

export default function AdminLeadsScreen() {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(), []);
  const { state, refetch } = useApi(auth.listUsers);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const allUsers: User[] = state.status === 'success' ? state.data : [];

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    const q = searchQuery.trim().toLowerCase();
    return allUsers.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.phone_number?.includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [allUsers, searchQuery]);

  const newCount = allUsers.filter((u, i) => getLeadStatus(u, i) === 'חדש').length;
  const inProgressCount = allUsers.filter((u, i) => getLeadStatus(u, i) === 'בטיפול').length;
  const tourCount = allUsers.filter((u, i) => getLeadStatus(u, i) === 'נקבע סיור').length;

  const blurTint = mode === 'dark' ? 'dark' : 'light';

  return (
    <LinearGradient
      colors={['#221f10', '#0e0d07']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <BlurView intensity={30} tint={blurTint} style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#ffffffB3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ניהול לידים</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="notifications-outline" size={20} color="#ffffffB3" />
          </TouchableOpacity>
        </BlurView>

        {/* Search row — fixed */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#ffffff80" />
            <TextInput
              style={styles.searchInput}
              placeholder="חיפוש לפי שם או נכס"
              placeholderTextColor="#ffffff80"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* KPIs — fixed */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>לידים חדשים</Text>
            <Text style={[styles.kpiValue, { color: '#ffffff' }]}>
              {state.status === 'loading' ? '–' : newCount}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>בטיפול</Text>
            <Text style={[styles.kpiValue, { color: '#c8a455' }]}>
              {state.status === 'loading' ? '–' : inProgressCount}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>נסגרו החודש</Text>
            <Text style={[styles.kpiValue, { color: '#34d399' }]}>
              {state.status === 'loading' ? '–' : tourCount}
            </Text>
          </View>
        </View>

        {/* Leads list — scrollable */}
        <ScrollView
          style={styles.leadsWrap}
          contentContainerStyle={styles.leadsContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#c8a455"
            />
          }
        >
          {/* Lead cards */}
          {state.status === 'loading' && !refreshing ? (
            <ActivityIndicator color="#c8a455" style={{ marginVertical: 40 }} />
          ) : (
            filteredUsers.map((user, index) => {
              const status = getLeadStatus(user, index);
              const desc = getLeadDescription(user);
              const contact = user.phone_number || user.email || '';
              const isPhone = !!user.phone_number;

              const badgeBg =
                status === 'חדש'
                  ? '#c8a45526'
                  : '#ffffff0D';
              const badgeColor =
                status === 'חדש'
                  ? '#c8a455'
                  : status === 'נקבע סיור'
                  ? '#34d399'
                  : '#ffffffB3';

              return (
                <View key={user.id} style={styles.leadCard}>
                  {/* Top row: info (right) + status badge (left) */}
                  <View style={styles.leadTop}>
                    <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.statusText, { color: badgeColor }]}>{status}</Text>
                    </View>
                    <View style={styles.leadInfo}>
                      <Text style={styles.leadName}>{user.full_name || 'ללא שם'}</Text>
                      <Text style={styles.leadDesc} numberOfLines={1}>{desc}</Text>
                    </View>
                  </View>

                  {/* Bottom row: contact (left) + time (right) */}
                  <View style={styles.leadMeta}>
                    <View style={styles.contactRow}>
                      <Ionicons
                        name={isPhone ? 'call-outline' : 'mail-outline'}
                        size={14}
                        color="#ffffff80"
                      />
                      <Text style={styles.contactText} numberOfLines={1}>{contact}</Text>
                    </View>
                    <Text style={styles.timeText}>{user.is_active ? 'פעיל' : 'לא פעיל'}</Text>
                  </View>
                </View>
              );
            })
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Bottom action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionIconBtn}>
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionGoldBtn}>
            <Text style={styles.actionGoldText}>ליד חדש</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn}>
            <Ionicons name="options-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: 16, gap: 12 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 48,
      marginTop: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#ffffff14',
      overflow: 'hidden',
      paddingHorizontal: 10,
    },
    headerBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#ffffff14',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 18,
      color: '#ffffff',
    },

    // Leads scroll
    leadsWrap: { flex: 1 },
    leadsContent: {
      gap: 8,
      paddingBottom: 8,
    },

    // Search row
    searchRow: {
      flexDirection: 'row',
      gap: 8,
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      height: 40,
      borderRadius: 14,
      backgroundColor: '#ffffff0D',
      borderWidth: 1,
      borderColor: '#ffffff14',
      paddingHorizontal: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontFamily: Fonts.heebo.regular,
      fontSize: 13,
      color: '#ffffff',
      textAlign: 'right',
      height: '100%',
    },
    filterBtn: {
      width: 44,
      height: 40,
      borderRadius: 14,
      backgroundColor: '#ffffff1A',
      borderWidth: 1,
      borderColor: '#ffffff2E',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // KPIs
    kpiRow: {
      flexDirection: 'row',
      gap: 8,
    },
    kpiCard: {
      flex: 1,
      height: 84,
      borderRadius: 16,
      backgroundColor: '#ffffff0D',
      borderWidth: 1,
      borderColor: '#ffffff14',
      padding: 10,
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 4,
    },
    kpiLabel: {
      fontFamily: Fonts.heebo.medium,
      fontSize: 11,
      color: '#ffffffB3',
      textAlign: 'right',
    },
    kpiValue: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 24,
      textAlign: 'right',
    },

    // Lead card
    leadCard: {
      borderRadius: 18,
      backgroundColor: '#ffffff1A',
      borderWidth: 1,
      borderColor: '#ffffff2E',
      padding: 12,
      gap: 8,
    },
    leadTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusText: {
      fontFamily: Fonts.heebo.bold,
      fontSize: 11,
    },
    leadInfo: {
      alignItems: 'flex-end',
      gap: 2,
      flex: 1,
      paddingLeft: 8,
    },
    leadName: {
      fontFamily: Fonts.heebo.bold,
      fontSize: 15,
      color: '#ffffff',
      textAlign: 'right',
    },
    leadDesc: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 12,
      color: '#ffffffB3',
      textAlign: 'right',
    },
    leadMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    contactText: {
      fontFamily: Fonts.manrope.regular,
      fontSize: 11,
      color: '#ffffff80',
    },
    timeText: {
      fontFamily: Fonts.manrope.regular,
      fontSize: 11,
      color: '#ffffff80',
    },

    // Bottom action bar
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 62,
      borderRadius: 20,
      backgroundColor: '#ffffff0D',
      borderWidth: 1,
      borderColor: '#ffffff2E',
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 8,
      marginBottom: 8,
    },
    actionIconBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: '#ffffff1A',
      borderWidth: 1,
      borderColor: '#ffffff14',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionGoldBtn: {
      flex: 1,
      height: 44,
      borderRadius: 14,
      backgroundColor: '#c8a455',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionGoldText: {
      fontFamily: Fonts.heebo.bold,
      fontSize: 15,
      color: '#0e0d07',
    },
  });
