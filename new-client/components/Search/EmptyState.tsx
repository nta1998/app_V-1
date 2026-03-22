import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={32} color={colors.textWhite50} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    gap: Spacing.xl,
  },
  emptyText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.xl,
    color: colors.textWhite50,
  },
});
