import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

export default function QuoteCard() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteText}>
        אני מאמין שהאנרגיה הגבוהה והדיוק בהם אני מפעיל את שיווק הפרויקט
        ומערך המכירות מביאים אותנו לתוצאות יוצאות דופן. המכירות שלנו
        מנוהלות בעזרת מערכת מתקדמת המאפשרת לנו לשלוט ולנהל את כל מקורות
        המידע.
      </Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  quoteCard: {
    backgroundColor: colors.glass20,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing['4xl'],
  },
  quoteText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.6,
    color: colors.textWhite70,
    textAlign: 'right',
  },
});
