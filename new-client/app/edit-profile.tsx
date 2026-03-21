import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Fonts, type ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { auth, getErrorMessage } from '../services/api';
import { validateRequired, validatePhone } from '../utils/validation';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { state } = useAuth();
  const user = state.status === 'authenticated' ? state.user : null;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const nameParts = (user?.full_name ?? '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] ?? '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') ?? '');
  const [phone, setPhone] = useState(user?.phone_number ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar ?? null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; lastName?: string; phone?: string }>({});

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('הרשאה נדרשת', 'נא לאשר גישה לגלריה בהגדרות האפליקציה.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setAvatarChanged(true);
    }
  };

  const handleSave = async () => {
    const firstErr = validateRequired(firstName, 'שם פרטי');
    const lastErr = validateRequired(lastName, 'שם משפחה');
    const phoneErr = validatePhone(phone);
    if (firstErr || lastErr || phoneErr) {
      setFieldErrors({
        firstName: firstErr ?? undefined,
        lastName: lastErr ?? undefined,
        phone: phoneErr ?? undefined,
      });
      return;
    }
    setFieldErrors({});
    setError(null);
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const formData = new FormData();
      formData.append('full_name', fullName);
      if (phone.trim()) {
        formData.append('phone_number', phone.trim());
      }
      if (avatarChanged && avatarUri) {
        const filename = avatarUri.split('/').pop() ?? 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        // React Native FormData accepts this shape for file uploads
        formData.append('avatar', { uri: avatarUri, name: filename, type } as unknown as Blob);
      }
      await auth.updateProfile(formData);
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <BlurView intensity={30} tint="dark" style={styles.header}>
            <Text style={styles.headerTitle}>עריכת פרופיל</Text>
          </BlurView>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={10}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickAvatar} activeOpacity={0.8}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.avatarSubtitle}>עדכן את פרטיך האישיים</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <BlurView intensity={30} tint="dark" style={styles.formCardBlur}>
              <View style={styles.formCardInner}>

                {/* First Name */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>שם פרטי</Text>
                  <View style={[styles.inputRow, fieldErrors.firstName && styles.inputRowError]}>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={(t) => { setFirstName(t); setError(null); setFieldErrors((p) => ({ ...p, firstName: undefined })); }}
                      placeholder="ישראל"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      textAlign="right"
                      autoCorrect={false}
                      editable={!saving}
                    />
                    <Ionicons name="person-outline" size={18} color="#ffffff80" />
                  </View>
                  {fieldErrors.firstName && <Text style={styles.fieldErrorText}>{fieldErrors.firstName}</Text>}
                </View>

                {/* Last Name */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>שם משפחה</Text>
                  <View style={[styles.inputRow, fieldErrors.lastName && styles.inputRowError]}>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={(t) => { setLastName(t); setError(null); setFieldErrors((p) => ({ ...p, lastName: undefined })); }}
                      placeholder="ישראלי"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      textAlign="right"
                      autoCorrect={false}
                      editable={!saving}
                    />
                    <Ionicons name="person-outline" size={18} color="#ffffff80" />
                  </View>
                  {fieldErrors.lastName && <Text style={styles.fieldErrorText}>{fieldErrors.lastName}</Text>}
                </View>

                {/* Email — read-only */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>אימייל</Text>
                  <View style={[styles.inputRow, styles.inputRowReadonly]}>
                    <Text style={styles.readonlyText}>{user?.email ?? ''}</Text>
                    <Ionicons name="mail-outline" size={18} color="#ffffff80" />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>מספר טלפון</Text>
                  <View style={[styles.inputRow, fieldErrors.phone && styles.inputRowError]}>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={(t) => { setPhone(t); setError(null); setFieldErrors((p) => ({ ...p, phone: undefined })); }}
                      placeholder="054-1234567"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      keyboardType="phone-pad"
                      textAlign="right"
                      editable={!saving}
                    />
                    <Ionicons name="call-outline" size={18} color="#ffffff80" />
                  </View>
                  {fieldErrors.phone && <Text style={styles.fieldErrorText}>{fieldErrors.phone}</Text>}
                </View>

                {/* Error */}
                {error && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle-outline" size={15} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Save */}
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.bgDark} />
                  ) : (
                    <>
                      <Text style={styles.saveButtonText}>שמור שינויים</Text>
                      <Ionicons name="checkmark" size={18} color={colors.bgDark} />
                    </>
                  )}
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cancelButtonText}>ביטול</Text>
                </TouchableOpacity>
              </View>
              </BlurView>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  // Header
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    height: 48,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    alignSelf: 'stretch',
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 18,
    color: colors.textWhite,
    textAlign: 'center',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 24,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.borderGold,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(200,164,85,0.1)',
    borderWidth: 3,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 26,
    color: colors.primary,
  },
  avatarSubtitle: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 14,
    color: colors.textWhite,
  },

  // Form Card
  formCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  formCardBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  formCardInner: {
    padding: 20,
    gap: 16,
  },

  // Fields
  fieldWrapper: { gap: 8 },
  fieldLabel: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 12,
    color: colors.textWhite,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 14,
    height: 52,
    gap: 5,
  },
  inputRowReadonly: {
    opacity: 0.6,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  fieldErrorText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: colors.error,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.heebo.regular,
    fontSize: 15,
    color: colors.textWhite,
    height: '100%',
  },
  readonlyText: {
    flex: 1,
    fontFamily: Fonts.heebo.regular,
    fontSize: 15,
    color: colors.textWhite70,
    textAlign: 'right',
  },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  errorText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 13,
    color: colors.error,
    textAlign: 'right',
  },

  // Save button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 54,
    gap: 10,
    marginTop: 4,
    shadowColor: '#c8a455',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    fontFamily: Fonts.heebo.bold,
    fontSize: 16,
    color: colors.bgDark,
  },

  // Cancel button
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff99',
    borderRadius: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#ffffff26',
  },
  cancelButtonText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 16,
    color: colors.textWhite,
  },
});
