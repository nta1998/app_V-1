import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface ApartmentInfoCardProps {
  address: string;
  projectTitle: string;
  type: string | null;
  price: string | null;
}

export default function ApartmentInfoCard({
  address,
  projectTitle,
  type,
  price,
}: ApartmentInfoCardProps) {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const priceNum = price ? parseFloat(price) : null;
  const priceDisplay = priceNum ? `₪${priceNum.toLocaleString('he-IL')}` : null;

  return (
    <View style={styles.heroInfoCard}>
      <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={styles.heroInfoContent}>
        <View style={styles.projectRowWithBadge}>
          {type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{type}</Text>
            </View>
          )}
          <View style={styles.projectRow}>
            <Text style={styles.projectName}>{projectTitle}</Text>
            <Ionicons name="business-outline" size={14} color={colors.primary} />
          </View>
        </View>
        <Text style={styles.aptName}>{address}</Text>
        {priceDisplay && (
          <Text style={styles.heroPrice}>{priceDisplay}</Text>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    heroInfoCard: {
      position: 'absolute',
      bottom: Spacing['3xl'],
      left: Spacing['3xl'],
      right: Spacing['3xl'],
      borderRadius: Radius['4xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderGold,
    },
    heroInfoContent: { padding: Spacing.xl, alignItems: 'flex-end' },
    projectRowWithBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: Spacing.xs,
    },
    typeBadge: {
      backgroundColor: colors.primary,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: 3,
    },
    typeBadgeText: { fontFamily: Fonts.manrope.bold, fontSize: FontSize.xs, color: colors.bgDark },
    aptName: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['2xl'],
      color: colors.textWhite,
      textAlign: 'right',
      marginBottom: Spacing.xxs,
    },
    projectRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    projectName: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.base,
      color: colors.textWhite50,
      textAlign: 'right',
    },
    heroPrice: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: FontSize['2xl'],
      color: colors.primary,
      textAlign: 'right',
    },
  });
