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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../hooks/useTheme';
import { auth } from '../../services/api';
import { useState, useMemo } from 'react';
import { NativeToggle } from '../../components/NativeToggle';
import MenuItem from '../../components/MenuItem';

export default function ProfileScreen() {
  const { state, logout } = useAuth();
  const { mode, colors, toggleMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);

  // Fetch fresh profile data from server; fall back to cached user from auth state
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
    ? user.full_name
        .split(' ')
        .slice(0, 2)
        .map((w) => w.charAt(0))
        .join('')
    : '?';

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>פרופיל</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={() => router.push('/edit-profile' as never)} activeOpacity={0.8}>
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
            <Text style={styles.userName}>
              {user?.full_name ?? 'Admin User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
          </View>

          {/* Section: מידע אישי */}
          <Text style={styles.sectionHeader}>מידע אישי</Text>
          <View style={styles.sectionCard}>
            <MenuItem label="עריכת פרופיל" icon="person-outline" onPress={() => router.push('/edit-profile' as never)} />
            <View style={styles.separator} />
            <MenuItem label="ההשקעות שלי" icon="briefcase-outline" onPress={() => router.push('/saved-properties' as never)} />
          </View>

          {/* Section: הגדרות */}
          <Text style={styles.sectionHeader}>הגדרות</Text>
          <View style={styles.sectionCard}>
            <MenuItem
              label="התראות"
              icon="notifications-outline"
              rightControl={<NativeToggle value={notificationsEnabled} onValueChange={setNotificationsEnabled} tintColor={colors.primary} />}
            />
            <View style={styles.separator} />
            <MenuItem
              label="מצב לילה"
              icon="moon-outline"
              rightControl={<NativeToggle value={mode === 'dark'} onValueChange={toggleMode} tintColor={colors.primary} />}
            />
          </View>

          {/* Section: אבטחה */}
          <Text style={styles.sectionHeader}>אבטחה</Text>
          <View style={styles.sectionCard}>
            <MenuItem
              label="Face ID"
              icon="scan-outline"
              rightControl={<NativeToggle value={faceIdEnabled} onValueChange={setFaceIdEnabled} tintColor={colors.primary} />}
            />
          </View>

          {/* Admin Button — only visible to staff */}
          {user?.is_staff && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/(admin)/dashboard' as never)}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.bgDark} />
              <Text style={styles.adminButtonText}>ניהול מערכת</Text>
            </TouchableOpacity>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.logoutText}>התנתקות</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.versionText}>V 2.4.0</Text>

          <View style={{ height: 110 }} />
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glass20,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderLight,
      height: 48,
      width: '100%',
      overflow: 'hidden',
    },
    headerTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 18,
      color: colors.textWhite,
      textAlign: 'center',
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

    // Section headers
    sectionHeader: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 16,
      color: colors.textWhite,
      textAlign: 'right',
      marginBottom: 10,
      marginTop: 8,
    },

    // Section card (groups menu items)
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

    // Menu item styles moved to MenuItem component

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

    // Logout button
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

    // Version
    versionText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 12,
      color: colors.textWhite50,
      textAlign: 'center',
      marginTop: 16,
    },
  });
