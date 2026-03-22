import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import type { Deal } from '../../services/api';

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `\u20AA${num.toLocaleString('he-IL')}`;
}

interface ApartmentDetailsCardProps {
  apartment: Deal['apartment'];
  project: Deal['project'];
}

export default function ApartmentDetailsCard({ apartment, project }: ApartmentDetailsCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      {apartment?.apartment_image_url || apartment?.main_image ? (
        <Image
          source={{ uri: apartment.main_image || apartment.apartment_image_url! }}
          style={styles.aptImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.aptImagePlaceholder}>
          <Ionicons name="home" size={36} color={colors.primary} />
        </View>
      )}
      <View style={styles.aptInfo}>
        <Text style={styles.aptAddress}>{apartment?.apartment_specific_address ?? '\u2014'}</Text>
        <Text style={styles.aptProject}>
          {project?.title ?? ''}{project?.project_address ? `, ${project.project_address}` : ''}
        </Text>
        <View style={styles.aptSpecsRow}>
          {apartment?.price && (
            <View style={styles.specItem}>
              <Ionicons name="cash-outline" size={14} color={colors.primary} />
              <Text style={styles.specText}>{formatCurrency(apartment.price)}</Text>
            </View>
          )}
          {apartment?.apartment_size_sqm && (
            <View style={styles.specItem}>
              <Ionicons name="resize-outline" size={14} color={colors.primary} />
              <Text style={styles.specText}>{apartment.apartment_size_sqm} \u05DE"\u05E8</Text>
            </View>
          )}
          {apartment?.number_of_rooms && (
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={14} color={colors.primary} />
              <Text style={styles.specText}>{apartment.number_of_rooms} \u05D7\u05D3\u05E8\u05D9\u05DD</Text>
            </View>
          )}
          {apartment?.floor != null && (
            <View style={styles.specItem}>
              <Ionicons name="layers-outline" size={14} color={colors.primary} />
              <Text style={styles.specText}>\u05E7\u05D5\u05DE\u05D4 {apartment.floor}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.glass20,
      borderRadius: Radius['4xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
      padding: Spacing['3xl'],
    },
    aptImage: { width: '100%', height: 160, borderRadius: Radius.xl },
    aptImagePlaceholder: {
      width: '100%',
      height: 160,
      borderRadius: Radius.xl,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aptInfo: { marginTop: Spacing.xl, gap: Spacing.xs, alignItems: 'flex-end' },
    aptAddress: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['4xl'],
      color: colors.textWhite,
      textAlign: 'right',
    },
    aptProject: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.lg,
      color: colors.textWhite70,
      textAlign: 'right',
    },
    aptSpecsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xl,
      marginTop: Spacing.lg,
      justifyContent: 'flex-end',
    },
    specItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: colors.glass20,
      paddingHorizontal: Spacing.lg,
      paddingVertical: 5,
      borderRadius: Radius.md,
    },
    specText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.base,
      color: colors.textWhite,
    },
  });
