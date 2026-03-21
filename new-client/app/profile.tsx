import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Fonts, type ThemeColors } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../hooks/useTheme';
import { auth } from '../services/api';
import { useState, useMemo } from 'react';
import { NativeToggle } from '../components/NativeToggle';

export default function ProfileScreen() {
  const { state, logout } = useAuth();
  const { mode, colors, toggleMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);

  const { state: profileState } = useApi(auth.profile);
  const user =
    profileState.status === 'success'
      ? profileState.data
      : state.status === 'authenticated'
      ? state.user
      : null;

  const handleLogout = () => {
    Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'התנתק', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').slice(0, 2).map((w) => w.charAt(0)).join('')
    : '?';

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header with back button */}
        <View style={styles.header}>
          <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.headerBar}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={colors.textWhite70} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>פרופיל</Text>
            <View style={styles.headerBtn} />
          </BlurView>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={() => router.push('/edit-profile')} activeOpacity={0.8}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  {profileState.status === 'loading' ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.userName}>{user?.full_name ?? 'Admin User'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
          </View>

          {/* Section: מידע אישי */}
          <Text style={styles.sectionHeader}>מידע אישי</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={16} color="#ffffff80" />
              <Text style={styles.menuLabel}>עריכת פרופיל</Text>
              <View style={styles.menuIconWrap}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/saved-properties')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={16} color="#ffffff80" />
              <Text style={styles.menuLabel}>ההשקעות שלי</Text>
              <View style={styles.menuIconWrap}>
                <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Section: הגדרות */}
          <Text style={styles.sectionHeader}>הגדרות</Text>
          <View style={styles.sectionCard}>
            <View style={styles.menuItem}>
              <NativeToggle
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                tintColor={colors.primary}
              />
              <Text style={styles.menuLabel}>התראות</Text>
              <View style={styles.menuIconWrap}>
                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.menuItem}>
              <NativeToggle
                value={mode === 'dark'}
                onValueChange={toggleMode}
                tintColor={colors.primary}
              />
              <Text style={styles.menuLabel}>מצב לילה</Text>
              <View style={styles.menuIconWrap}>
                <Ionicons name="moon-outline" size={20} color={colors.primary} />
              </View>
            </View>
          </View>

          {/* Section: אבטחה */}
          <Text style={styles.sectionHeader}>אבטחה</Text>
          <View style={styles.sectionCard}>
            <View style={styles.menuItem}>
              <NativeToggle
                value={faceIdEnabled}
                onValueChange={setFaceIdEnabled}
                tintColor={colors.primary}
              />
              <Text style={styles.menuLabel}>Face ID</Text>
              <View style={styles.menuIconWrap}>
                <Ionicons name="scan-outline" size={20} color={colors.primary} />
              </View>
            </View>
          </View>

          {/* Back to admin */}
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.primary} />
            <Text style={styles.adminButtonText}>חזרה לניהול</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.logoutText}>התנתקות</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>V 2.4.0</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    // Header
    header: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 48,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
      paddingHorizontal: 10,
    },
    headerBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 18,
      color: colors.textWhite,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 28,
    },

    // Avatar
    avatarSection: {
      alignItems: 'center',
      marginBottom: 28,
      gap: 8,
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.borderGold,
      marginBottom: 4,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryDim,
      borderWidth: 3,
      borderColor: colors.borderGold,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    avatarInitials: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 26,
      color: colors.primary,
    },
    userName: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 22,
      color: colors.textWhite,
      textAlign: 'center',
    },
    userEmail: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 14,
      color: colors.textWhite,
      textAlign: 'center',
    },

    // Sections
    sectionHeader: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 16,
      color: colors.textWhite,
      textAlign: 'right',
      marginBottom: 10,
      marginTop: 8,
    },
    sectionCard: {
      backgroundColor: colors.glass20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
      marginBottom: 20,
    },
    separator: {
      height: 1,
      backgroundColor: colors.borderLight,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    menuIconWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLabel: {
      flex: 1,
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 15,
      color: colors.textWhite,
      textAlign: 'right',
    },

    // Admin button
    adminButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryGlow,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderGold,
      paddingVertical: 16,
      marginTop: 8,
      gap: 8,
    },
    adminButtonText: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 16,
      color: colors.primary,
    },

    // Logout
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ef444420',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#ef444440',
      height: 48,
      marginTop: 8,
      gap: 8,
    },
    logoutText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 15,
      color: colors.error,
    },

    versionText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 12,
      color: colors.textWhite50,
      textAlign: 'center',
      marginTop: 16,
    },
  });
