import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../constants/theme';
import { Spacing, Radius, FontSize } from '../constants/tokens';
import { useTheme } from '../hooks/useTheme';

type Props = {
  status: 'loading' | 'idle' | 'error' | 'empty';
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function StateView({
  status,
  error,
  icon,
  message,
  onRetry,
  retryLabel = 'נסה שנית',
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (status === 'loading' || status === 'idle') {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={36} color={colors.primary} />
        <Text style={styles.text}>{error ?? message ?? 'שגיאה'}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>{retryLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // empty
  return (
    <View style={styles.container}>
      <Ionicons name={icon ?? 'document-outline'} size={48} color={colors.textWhite25} />
      <Text style={styles.text}>{message ?? 'אין תוצאות'}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xl,
    },
    text: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.xl,
      color: colors.textWhite50,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: colors.primary,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing['5xl'],
      paddingVertical: Spacing.lg,
    },
    retryText: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.xl,
      color: colors.bgDark,
    },
  });
