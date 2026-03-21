import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useMemo, type ReactNode } from 'react';
import { Fonts, type ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface GlassSectionProps {
  title: string;
  children: ReactNode;
  style?: ViewStyle;
}

export default function GlassSection({ title, children, style }: GlassSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.indicator} />
      </View>
      {children}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.glass20,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
      marginBottom: 14,
    },
    title: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 16,
      color: colors.textWhite,
      textAlign: 'right',
    },
    indicator: {
      width: 3,
      height: 18,
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
  });
