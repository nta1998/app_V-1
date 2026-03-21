import React from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  I18nManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Fonts } from '../constants/theme';

interface HomeHeaderProps {
  userName: string;
  avatarUri?: string;
  onBellPress?: () => void;
  onAvatarPress?: () => void;
}

/**
 * Home screen header — RTL layout.
 * Generated from Pencil design node ZTqP2.
 */
export function HomeHeader({
  userName,
  avatarUri,
  onBellPress,
  onAvatarPress,
}: HomeHeaderProps) {
  const { colors, mode } = useTheme();

  // Time-based Hebrew greeting
  const greeting = getHebrewGreeting();

  return (
    <View style={styles.container}>
      {/* Bell button (left in RTL) */}
      <Pressable onPress={onBellPress} style={styles.bellButton}>
        <BlurView
          intensity={20}
          tint={mode === 'dark' ? 'dark' : 'light'}
          style={[
            styles.bellBlur,
            {
              backgroundColor: colors.glass20,
              borderColor: colors.borderMedium,
            },
          ]}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.textWhite} />
        </BlurView>
      </Pressable>

      {/* Right section: greeting + avatar */}
      <Pressable onPress={onAvatarPress} style={styles.rightSection}>
        <View style={styles.greetWrap}>
          <Text
            style={[
              styles.greetText,
              { color: colors.textWhite, fontFamily: Fonts.manrope.semiBold },
            ]}
          >
            {greeting}
          </Text>
          <Text
            style={[
              styles.nameText,
              { color: colors.textWhite, fontFamily: Fonts.manrope.semiBold },
            ]}
            numberOfLines={1}
          >
            {userName}
          </Text>
        </View>

        <Image
          source={
            avatarUri
              ? { uri: avatarUri }
              : require('../assets/icon.png')
          }
          style={[styles.avatar, { borderColor: colors.borderGold }]}
        />
      </Pressable>
    </View>
  );
}

function getHebrewGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'בוקר טוב,';
  if (hour >= 12 && hour < 17) return 'צהריים טובים,';
  if (hour >= 17 && hour < 21) return 'ערב טוב,';
  return 'לילה טוב,';
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 45,
    width: '100%',
    // RTL: bell stays left, avatar+greeting stays right
    direction: I18nManager.isRTL ? 'rtl' : 'ltr',
  },

  // Bell button
  bellButton: {
    width: 42,
    height: 42,
  },
  bellBlur: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Right section
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  greetText: {
    fontSize: 12,
    textAlign: 'right',
  },
  nameText: {
    fontSize: 20,
    textAlign: 'right',
  },

  // Avatar
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
});
