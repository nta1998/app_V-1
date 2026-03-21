import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { DarkColors, Fonts, type ThemeColors } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { ApiError, NetworkError, TimeoutError } from '../services/api';

export default function LoginScreen() {
  const { socialLogin } = useAuth();
  const colors = DarkColors;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError(null);
    setLoading(provider);
    try {
      // TODO: Replace with real expo-auth-session flow
      // For now, using simplified flow — backend accepts email directly
      // Real implementation will pass id_token from Google/Apple
      await socialLogin(provider, `test.${provider}@example.com`, 'משתמש בדיקה');
    } catch (err) {
      if (err instanceof NetworkError) setError('אין חיבור לאינטרנט');
      else if (err instanceof TimeoutError) setError('השרת לא מגיב — נסה שוב');
      else if (err instanceof ApiError && err.status === 403) setError('החשבון חסום. פנה לתמיכה.');
      else if (err instanceof ApiError && err.isServer) setError('שגיאת שרת — נסה שוב מאוחר יותר');
      else setError('ההתחברות נכשלה — נסה שוב');
    } finally {
      setLoading(null);
    }
  };

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
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Ionicons name="business" size={28} color={colors.primary} />
            </View>

            {/* Title */}
            <Text style={styles.appTitle}>פרויקטים 360</Text>
            <Text style={styles.appSubtitle}>ברוכים הבאים</Text>

            {/* Spacer */}
            <View style={{ height: 36 }} />

            {/* Social Auth Buttons */}
            <View style={styles.buttonsSection}>
              {/* Google Sign-In */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('google')}
                disabled={loading !== null}
                activeOpacity={0.85}
              >
                {loading === 'google' ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <>
                    <View style={styles.socialIconContainer}>
                      <Text style={styles.googleIcon}>G</Text>
                    </View>
                    <Text style={styles.socialButtonText}>התחבר עם Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Apple Sign-In */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={() => handleSocialLogin('apple')}
                  disabled={loading !== null}
                  activeOpacity={0.85}
                >
                  {loading === 'apple' ? (
                    <ActivityIndicator color={colors.textWhite} />
                  ) : (
                    <>
                      <View style={styles.socialIconContainer}>
                        <Ionicons name="logo-apple" size={20} color={colors.textWhite} />
                      </View>
                      <Text style={styles.socialButtonText}>התחבר עם Apple</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Spacer */}
            <View style={{ height: 24 }} />

            {/* Version text */}
            <Text style={styles.versionText}>גרסה 3.0.1 • כל הזכויות שמורות</Text>
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

    // Glass Card
    card: {
      backgroundColor: colors.glass20,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: colors.borderGold,
      paddingVertical: 36,
      paddingHorizontal: 28,
      alignItems: 'center',
    },

    // Logo
    logoContainer: {
      width: 64,
      height: 64,
      borderRadius: 22,
      backgroundColor: '#ffffff1A',
      borderWidth: 1,
      borderColor: colors.borderGold,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    // Title
    appTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 28,
      color: colors.textWhite,
      textAlign: 'center',
    },
    appSubtitle: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 16,
      color: colors.textWhite,
      textAlign: 'center',
      marginTop: 4,
    },

    // Social Buttons
    buttonsSection: {
      width: '100%',
      gap: 14,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glass20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderMedium,
      height: 54,
      gap: 12,
      width: '100%',
    },
    appleButton: {
      backgroundColor: '#000000',
      borderColor: '#333333',
    },
    socialIconContainer: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleIcon: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 18,
      color: '#4285F4',
    },
    socialButtonText: {
      fontFamily: Fonts.heebo.medium,
      fontSize: 16,
      color: colors.textWhite,
    },

    // Error
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 6,
      width: '100%',
      marginTop: 16,
    },
    errorText: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 13,
      color: colors.error,
      textAlign: 'right',
    },

    // Version
    versionText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 11,
      color: colors.textWhite,
      textAlign: 'center',
    },
  });
