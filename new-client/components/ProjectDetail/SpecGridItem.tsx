import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface SpecGridItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
}

export default function SpecGridItem({ icon, value, label }: SpecGridItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.specItem}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.specValue}>{value}</Text>
      <Text style={styles.specLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    specItem: {
      flexBasis: '48%',
      flexGrow: 1,
      height: 100,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: Radius.lg,
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    specValue: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: FontSize['4xl'],
      color: colors.textWhite,
      textAlign: 'center',
    },
    specLabel: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
      textAlign: 'center',
    },
  });
