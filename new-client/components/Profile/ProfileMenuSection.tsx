import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import MenuItem from '../MenuItem';

interface MenuItemConfig {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightControl?: ReactNode;
}

interface ProfileMenuSectionProps {
  title: string;
  items: MenuItemConfig[];
}

export default function ProfileMenuSection({ title, items }: ProfileMenuSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <View key={item.label}>
            {index > 0 && <View style={styles.separator} />}
            <MenuItem
              label={item.label}
              icon={item.icon}
              onPress={item.onPress}
              rightControl={item.rightControl}
            />
          </View>
        ))}
      </View>
    </>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  sectionHeader: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.xl,
    color: colors.textWhite,
    textAlign: 'right',
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.glass20,
    borderRadius: Radius['4xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: Spacing['4xl'],
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
