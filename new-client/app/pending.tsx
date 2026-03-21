import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect, useRef } from 'react';
import { DarkColors, Fonts, type ThemeColors } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export default function PendingScreen() {
  const { checkStatus, logout } = useAuth();
  const colors = DarkColors;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [checking, setChecking] = useState(false);
  const [pulseOpacity] = useState(1);

  // Pulse animation via simple interval
  const dotRef = useRef<View>(null);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await checkStatus();
      // If status changed to 'approved', the _layout.tsx will auto-redirect
    } catch {
      // Silently fail — user can try again
    } finally {
      setChecking(false);
    }
  };

  // Auto-check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkStatus().catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <LinearGradient
      colors={['#0e0d07', '#1a1709', '#221f10']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          {/* Glass Card */}
          <View style={styles.card}>
            {/* Clock Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={48} color={colors.primary} />
            </View>

            {/* Title */}
            <Text style={styles.title}>ממתין לאישור</Text>

            {/* Message */}
            <Text style={styles.message}>
              החשבון שלך ממתין לאישור.{'\n'}נודיע לך כשיאושר.
            </Text>

            {/* Spacer */}
            <View style={{ height: 32 }} />

            {/* Refresh Button */}
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={checking}
              activeOpacity={0.85}
            >
              {checking ? (
                <ActivityIndicator color={colors.bgDark} size="small" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={20} color={colors.bgDark} />
                  <Text style={styles.refreshText}>רענן סטטוס</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Spacer */}
            <View style={{ height: 16 }} />

            {/* Logout */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>התנתק</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    inner: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 28,
    },

    card: {
      backgroundColor: colors.glass20,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: colors.borderGold,
      paddingVertical: 40,
      paddingHorizontal: 28,
      alignItems: 'center',
    },

    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.primaryDim,
      borderWidth: 1,
      borderColor: colors.borderGold,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },

    title: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 24,
      color: colors.textWhite,
      textAlign: 'center',
    },

    message: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 16,
      color: colors.textWhite70,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 26,
    },

    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 16,
      height: 50,
      gap: 10,
      width: '100%',
      shadowColor: '#c8a455',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 8,
    },
    refreshText: {
      fontFamily: Fonts.heebo.bold,
      fontSize: 16,
      color: colors.bgDark,
    },

    logoutButton: {
      padding: 12,
    },
    logoutText: {
      fontFamily: Fonts.heebo.medium,
      fontSize: 14,
      color: colors.textWhite50,
    },
  });
