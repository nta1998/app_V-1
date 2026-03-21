import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';
import { Fonts, type ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface MenuItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  /** Pass a toggle or other control to render on the left side instead of a chevron */
  rightControl?: ReactNode;
}

export default function MenuItem({ label, icon, onPress, rightControl }: MenuItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const content = (
    <>
      {rightControl ?? (
        <Ionicons name="chevron-forward" size={16} color={colors.textWhite50} />
      )}
      <Text style={styles.label}>{label}</Text>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    iconWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flex: 1,
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 15,
      color: colors.textWhite,
      textAlign: 'right',
    },
  });
