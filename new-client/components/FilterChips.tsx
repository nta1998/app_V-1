import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../constants/theme';
import { Spacing, Radius, FontSize } from '../constants/tokens';
import { useTheme } from '../hooks/useTheme';

type Props = {
  items: string[];
  active: string;
  onSelect: (item: string) => void;
};

export default function FilterChips({ items, active, onSelect }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={[styles.wrapper, { direction: 'rtl' }]}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.chip, active === item && styles.chipActive]}
          onPress={() => onSelect(item)}
          activeOpacity={0.75}
        >
          <Text style={[styles.chipText, active === item && styles.chipTextActive]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginTop: Spacing.xl,
      marginBottom: Spacing.xs,
      flexGrow: 0,
    },
    row: {
      paddingHorizontal: Spacing['3xl'],
      gap: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    chip: {
      paddingHorizontal: Spacing['3xl'],
      paddingVertical: Spacing.md,
      borderRadius: Radius['4xl'],
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.base,
      lineHeight: Spacing['3xl'],
      color: colors.textWhite,
      textAlign: 'center',
      includeFontPadding: false,
    },
    chipTextActive: {
      color: colors.textWhite,
    },
  });
