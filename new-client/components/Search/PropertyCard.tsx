import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface PropertyCardProps {
  title: string;
  subtitle: string;
  details: string;
  price: string | null;
  imageUri?: string | null;
  placeholderIcon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function PropertyCard({
  title,
  subtitle,
  details,
  price,
  imageUri,
  placeholderIcon,
  onPress,
}: PropertyCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.resultImage} resizeMode="cover" />
      ) : (
        <View style={[styles.resultImage, styles.resultImagePlaceholder]}>
          <Ionicons name={placeholderIcon} size={22} color={colors.primary} />
        </View>
      )}
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>{title}</Text>
        {details ? <Text style={styles.resultDetails}>{details}</Text> : null}
        {price ? <Text style={styles.resultPrice}>{price}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass20,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: Spacing.xl,
    height: 90,
    gap: Spacing.xl,
  },
  resultImage: {
    width: 66,
    height: 66,
    borderRadius: Radius.lg,
  },
  resultImagePlaceholder: {
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
    gap: Spacing.xs,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  resultTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.md,
    color: colors.textWhite,
    textAlign: 'right',
    flexShrink: 1,
  },
  resultDetails: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.sm,
    color: colors.textWhite,
    textAlign: 'right',
  },
  resultPrice: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.md,
    color: colors.primary,
    textAlign: 'right',
  },
});
