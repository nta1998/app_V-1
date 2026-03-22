import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface ProfileHeaderProps {
  avatar?: string | null;
  fullName: string | null;
  email: string | null;
  initials: string;
  isLoading: boolean;
}

export default function ProfileHeader({
  avatar,
  fullName,
  email,
  initials,
  isLoading,
}: ProfileHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity onPress={() => router.push('/edit-profile' as never)} activeOpacity={0.8}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.userName}>
        {fullName ?? 'Admin User'}
      </Text>
      <Text style={styles.userEmail}>{email ?? '—'}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    gap: Spacing.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.borderGold,
    marginBottom: Spacing.xs,
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
    marginBottom: Spacing.xs,
  },
  avatarInitials: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['7xl'],
    color: colors.primary,
  },
  userName: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['5xl'],
    color: colors.textWhite,
    textAlign: 'center',
  },
  userEmail: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.md,
    color: colors.textWhite,
    textAlign: 'center',
  },
});
