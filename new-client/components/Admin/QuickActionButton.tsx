import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface QuickActionButtonProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'default' | 'gold';
  badge?: number;
  blurIntensity?: number;
  borderColor?: string;
  iconBgColor?: string;
}

export default function QuickActionButton({
  label,
  iconName,
  onPress,
  variant = 'default',
  badge,
  blurIntensity = 22,
  borderColor,
  iconBgColor,
}: QuickActionButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const isGold = variant === 'gold';

  return (
    <View
      style={[
        styles.actionBtn,
        isGold && styles.actionBtnGold,
        borderColor ? { borderColor } : undefined,
      ]}
    >
      <BlurView intensity={blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
      <TouchableOpacity style={styles.actionTouchable} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.actionLabel}>{label}</Text>
        <View
          style={[
            styles.actionIcon,
            isGold && styles.actionIconGold,
            iconBgColor ? { backgroundColor: iconBgColor } : undefined,
          ]}
        >
          <Ionicons
            name={iconName}
            size={18}
            color={isGold ? colors.bgDark : colors.textWhite}
          />
          {badge != null && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    actionBtn: {
      flex: 1,
      height: 52,
      borderRadius: Radius['3xl'],
      overflow: 'hidden',
      backgroundColor: colors.glass60,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    actionBtnGold: {
      backgroundColor: colors.primaryDim,
      borderColor: colors.primaryGlow,
    },
    actionTouchable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
    },
    actionLabel: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.md,
      color: colors.textWhite,
    },
    actionIcon: {
      width: Height.buttonSm,
      height: Height.buttonSm,
      borderRadius: Radius['3xl'],
      backgroundColor: colors.glass60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIconGold: {
      backgroundColor: colors.primary,
    },
    badge: {
      position: 'absolute',
      top: -Spacing.xs,
      right: -Spacing.xs,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#f87171',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xs,
    },
    badgeText: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 10,
      color: '#ffffff',
    },
  });
