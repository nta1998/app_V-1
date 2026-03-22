import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface UpdateRowProps {
  title: string;
  date: string;
  recent: boolean;
  showDivider: boolean;
}

export default function UpdateRow({ title, date, recent, showDivider }: UpdateRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View>
      {showDivider && <View style={styles.divider} />}
      <View style={styles.updateRow}>
        <View style={styles.updateInfo}>
          <Text style={styles.updateTitle}>{title}</Text>
          <Text style={styles.updateDate}>{date}</Text>
        </View>
        <View style={[styles.updateDot, { backgroundColor: recent ? colors.primary : colors.textWhite25 }]} />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    divider: { height: 1, backgroundColor: colors.borderLight },
    updateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.xl,
    },
    updateInfo: { flex: 1, alignItems: 'flex-end', gap: Spacing.xxs },
    updateTitle: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.base,
      color: colors.textWhite,
    },
    updateDate: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
    },
    updateDot: { width: Spacing.md, height: Spacing.md, borderRadius: Radius.xs },
  });
