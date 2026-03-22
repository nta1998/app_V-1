import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface DealAttentionCardProps {
  name: string;
  reason: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
}

export default function DealAttentionCard({
  name,
  reason,
  iconName,
  iconColor,
  onPress,
}: DealAttentionCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.attentionCard} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.attentionIcon}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.attentionInfo}>
        <Text style={styles.attentionName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.attentionReason}>{reason}</Text>
      </View>
      <Ionicons name="chevron-back" size={16} color={colors.textWhite50} />
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    attentionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
      borderRadius: Radius.xl,
      backgroundColor: colors.glass60,
      borderWidth: 1,
      borderColor: '#fbbf2440',
      padding: Spacing.xl,
    },
    attentionIcon: {
      width: Height.buttonSm,
      height: Height.buttonSm,
      borderRadius: Radius.lg,
      backgroundColor: '#fbbf2420',
      alignItems: 'center',
      justifyContent: 'center',
    },
    attentionInfo: {
      flex: 1,
      alignItems: 'flex-end',
      gap: Spacing.xxs,
    },
    attentionName: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.base,
      color: colors.textWhite,
      textAlign: 'right',
    },
    attentionReason: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.xs,
      color: '#fbbf24',
      textAlign: 'right',
    },
  });
