import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface DealRowItemProps {
  name: string;
  subtitle: string;
  price: string;
  statusLabel: string;
  statusColor: string;
  onPress: () => void;
}

export default function DealRowItem({
  name,
  subtitle,
  price,
  statusLabel,
  statusColor,
  onPress,
}: DealRowItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.dealRow} activeOpacity={0.75} onPress={onPress}>
      {/* Info — left side (RTL: visually right) */}
      <View style={styles.dealInfo}>
        <Text style={styles.dealName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.dealAddr} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Price + status — right side */}
      <View style={styles.dealRight}>
        <Text style={styles.dealPrice}>{price}</Text>
        <View style={[styles.statusTag, { backgroundColor: colors.primaryDim }]}>
          <Text style={[styles.statusTxt, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    dealRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: Radius['2xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.glass20,
      padding: Spacing.xl,
      gap: Spacing.lg,
      height: 67,
    },
    dealInfo: {
      flex: 1,
      alignItems: 'flex-end',
      gap: 3,
    },
    dealName: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.md,
      color: colors.textWhite,
      textAlign: 'right',
    },
    dealAddr: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite70,
      textAlign: 'right',
    },
    dealRight: {
      alignItems: 'flex-end',
      gap: Spacing.xs,
    },
    dealPrice: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.md,
      color: colors.textWhite,
    },
    statusTag: {
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xxs,
    },
    statusTxt: {
      fontFamily: Fonts.heebo.bold,
      fontSize: FontSize.xs,
    },
  });
