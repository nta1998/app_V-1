import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface FeaturesTileProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}

export default function FeaturesTile({ icon, label, value }: FeaturesTileProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.featureTile}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.featureValue}>{value}</Text>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    featureTile: {
      flexBasis: '30%',
      flexGrow: 1,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: Radius.xl,
      padding: Spacing['2xl'],
      alignItems: 'center',
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    featureValue: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: FontSize.lg,
      color: colors.textWhite,
      textAlign: 'center',
    },
    featureLabel: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.xs,
      color: colors.textWhite50,
      textAlign: 'center',
    },
  });
