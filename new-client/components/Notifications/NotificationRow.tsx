import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import type { Notification } from '../../services/api';

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - date) / 60_000);
  if (diffMin < 1) return '\u05E2\u05DB\u05E9\u05D9\u05D5';
  if (diffMin < 60) return `\u05DC\u05E4\u05E0\u05D9 ${diffMin} \u05D3\u05E7\u05F3`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `\u05DC\u05E4\u05E0\u05D9 ${diffHours} \u05E9\u05E2\u05D5\u05EA`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '\u05D0\u05EA\u05DE\u05D5\u05DC';
  return `\u05DC\u05E4\u05E0\u05D9 ${diffDays} \u05D9\u05DE\u05D9\u05DD`;
}

interface NotificationRowProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

export default function NotificationRow({ notification, onPress }: NotificationRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.notifRow}
      activeOpacity={0.7}
      onPress={() => onPress(notification)}
    >
      {/* Icon */}
      <View style={styles.iconBg}>
        <Ionicons
          name={notification.is_read ? 'notifications-outline' : 'notifications'}
          size={20}
          color={colors.primary}
        />
      </View>

      {/* Text group */}
      <View style={styles.textGroup}>
        <Text style={styles.notifTitle} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.notifSub} numberOfLines={2}>
          {notification.message}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.timeText}>{timeAgo(notification.created_at)}</Text>
        </View>
      </View>

      {/* Unread dot */}
      <View
        style={[
          styles.unreadDot,
          !notification.is_read && styles.unreadDotActive,
        ]}
      />
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    notifRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: Height.listItem,
      borderRadius: Radius['2xl'],
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: Spacing['2xl'],
      gap: Spacing.xl,
    },
    iconBg: {
      width: Height.buttonMd,
      height: Height.buttonMd,
      borderRadius: Radius.lg,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textGroup: {
      flex: 1,
      alignItems: 'flex-end',
      gap: 3,
    },
    notifTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.md,
      color: colors.textWhite,
      textAlign: 'right',
    },
    notifSub: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
      textAlign: 'right',
      alignSelf: 'stretch',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      alignSelf: 'stretch',
      gap: Spacing.sm,
    },
    timeText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.xs,
      color: colors.textWhite50,
      textAlign: 'right',
    },
    unreadDot: {
      width: Spacing.md,
      height: Spacing.md,
      borderRadius: Radius.xs,
      backgroundColor: 'transparent',
    },
    unreadDotActive: {
      backgroundColor: colors.primary,
    },
  });
