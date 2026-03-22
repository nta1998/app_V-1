import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

interface AdminPropertyCardProps {
  imageUrl?: string | null;
  address: string;
  title?: string | null;
  type?: string | null;
  onPress: () => void;
}

export default function AdminPropertyCard({
  imageUrl,
  address,
  title,
  type,
  onPress,
}: AdminPropertyCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.propertyCard} activeOpacity={0.8} onPress={onPress}>
      <BlurView intensity={26} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={styles.propertyCardInner}>
        <View style={styles.propImgWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.propImg} />
          ) : (
            <Ionicons name="business" size={28} color={colors.primary} />
          )}
        </View>
        <View style={styles.propInfo}>
          <Text style={styles.propTitle} numberOfLines={1}>
            {address}
          </Text>
          {title ? (
            <Text style={styles.propSub} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {type ? <Text style={styles.propPrice}>{type}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    propertyCard: {
      borderRadius: Radius['3xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderMedium,
      backgroundColor: colors.glass60,
      height: 90,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.55,
      shadowRadius: 24,
    },
    propertyCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.xl,
      gap: Spacing.xl,
      flex: 1,
    },
    propImgWrap: {
      width: 66,
      height: 66,
      borderRadius: Radius.xl,
      overflow: 'hidden',
      backgroundColor: colors.glass60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    propImg: {
      width: '100%',
      height: '100%',
    },
    propInfo: {
      flex: 1,
      alignItems: 'flex-end',
      gap: Spacing.xs,
    },
    propTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.md,
      color: colors.textWhite,
      textAlign: 'right',
    },
    propSub: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
      textAlign: 'right',
    },
    propPrice: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.md,
      color: colors.primary,
      textAlign: 'right',
    },
  });
