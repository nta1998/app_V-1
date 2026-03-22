import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import { type Apartment } from '../../services/api';

interface ApartmentCardProps {
  apartment: Apartment;
}

export default function ApartmentCard({ apartment }: ApartmentCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const priceNum = apartment.price ? parseFloat(apartment.price) : null;
  const priceDisplay = priceNum
    ? `₪${priceNum.toLocaleString('he-IL')}`
    : 'מחיר לפי פנייה';

  const detailParts = [
    apartment.number_of_rooms != null ? `${apartment.number_of_rooms} חד'` : null,
    apartment.apartment_size_sqm != null ? `${apartment.apartment_size_sqm} מ"ר` : null,
    apartment.floor != null ? `קומה ${apartment.floor}` : null,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      style={styles.apartmentCard}
      onPress={() => router.push(`/apartment/${apartment.id}`)}
      activeOpacity={0.75}
    >
      {apartment.main_image ? (
        <Image
          source={{ uri: apartment.main_image }}
          style={styles.apartmentImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.apartmentImagePlaceholder}>
          <Ionicons name="home" size={24} color={colors.primary} />
        </View>
      )}
      <View style={styles.apartmentInfo}>
        <Text style={styles.apartmentName} numberOfLines={2}>{apartment.apartment_specific_address}</Text>
        <Text style={styles.apartmentDetails} numberOfLines={1}>{detailParts.join(' | ')}</Text>
        <Text style={styles.apartmentPrice}>{priceDisplay}</Text>
      </View>
      {apartment.type && (
        <View style={styles.apartmentTypeBadge}>
          <Text style={styles.apartmentTypeText}>{apartment.type}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    apartmentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      marginBottom: Spacing.xl,
      gap: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
    },
    apartmentImage: { width: 66, height: 66, borderRadius: Radius.lg },
    apartmentImagePlaceholder: {
      width: 66,
      height: 66,
      borderRadius: Radius.lg,
      backgroundColor: 'rgba(200,164,85,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    apartmentInfo: { flex: 1, alignItems: 'flex-end' },
    apartmentName: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.md,
      color: colors.textWhite,
      textAlign: 'right',
      marginBottom: Spacing.xxs,
    },
    apartmentDetails: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
      textAlign: 'right',
      marginBottom: Spacing.xs,
    },
    apartmentPrice: {
      fontFamily: Fonts.spaceGrotesk.bold,
      fontSize: FontSize.md,
      color: colors.primary,
    },
    apartmentTypeBadge: {
      backgroundColor: 'rgba(200,164,85,0.15)',
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      alignSelf: 'flex-start',
    },
    apartmentTypeText: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: FontSize.xs,
      color: colors.primary,
    },
  });
