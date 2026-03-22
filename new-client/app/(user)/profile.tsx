import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../hooks/useTheme';
import { makeStyles } from './styles/profile.styles';
import { auth } from '../../services/api';
import { useState, useMemo } from 'react';
import { NativeToggle } from '../../components/NativeToggle';
import { ProfileHeader } from '../../components/Profile';
import { ProfileMenuSection } from '../../components/Profile';

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
          <ProfileHeader
            avatar={user?.avatar}
            fullName={user?.full_name ?? null}
            email={user?.email ?? null}
            initials={initials}
            isLoading={profileState.status === 'loading'}
          />

          {/* Section: מידע אישי */}
          <ProfileMenuSection
            title="מידע אישי"
            items={[
              { label: 'עריכת פרופיל', icon: 'person-outline', onPress: () => router.push('/edit-profile' as never) },
              { label: 'ההשקעות שלי', icon: 'briefcase-outline', onPress: () => router.push('/saved-properties' as never) },
            ]}
          />

          {/* Section: הגדרות */}
          <ProfileMenuSection
            title="הגדרות"
            items={[
              {
                label: 'התראות',
                icon: 'notifications-outline',
                rightControl: <NativeToggle value={notificationsEnabled} onValueChange={setNotificationsEnabled} tintColor={colors.primary} />,
              },
              {
                label: 'מצב לילה',
                icon: 'moon-outline',
                rightControl: <NativeToggle value={mode === 'dark'} onValueChange={toggleMode} tintColor={colors.primary} />,
              },
            ]}
          />

          {/* Section: אבטחה */}
          <ProfileMenuSection
            title="אבטחה"
            items={[
              {
                label: 'Face ID',
                icon: 'scan-outline',
                rightControl: <NativeToggle value={faceIdEnabled} onValueChange={setFaceIdEnabled} tintColor={colors.primary} />,
              },
            ]}
          />

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

