import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import { type Favorite } from '../../services/api';

interface FavoriteItemProps {
  fav: Favorite;
  onRemove: () => void;
  removing: boolean;
}

export default function FavoriteItem({ fav, onRemove, removing }: FavoriteItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const apt = fav.apartment;
  const proj = fav.project ?? apt?.project ?? null;

  const title = apt?.apartment_specific_address ?? proj?.title ?? '—';
  const location = proj?.project_address ?? apt?.project.project_address ?? '—';
  const price = apt?.price
    ? `₪ ${parseFloat(apt.price).toLocaleString('he-IL')}`
    : null;

  const handlePress = () => {
    if (apt) {
      router.push(`/apartment/${apt.id}` as never);
    } else if (proj) {
      router.push(`/project/${proj.id}` as never);
    }
  };

  const imageUri = apt?.apartment_image_url ?? proj?.project_image_url ?? null;

  return (
    <TouchableOpacity style={styles.favItem} onPress={handlePress} activeOpacity={0.8}>
      {/* Heart button – left side */}
      <TouchableOpacity
        style={styles.heartButton}
        onPress={onRemove}
        disabled={removing}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {removing ? (
          <ActivityIndicator size="small" color="#f87171" />
        ) : (
          <Ionicons name="heart" size={16} color="#f87171" />
        )}
      </TouchableOpacity>

      {/* Info – right-aligned, fills remaining space */}
      <View style={styles.favInfo}>
        <Text style={styles.favTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.favLocation} numberOfLines={1}>
          {location}
        </Text>
        {price ? (
          <Text style={styles.favPrice}>{price}</Text>
        ) : null}
      </View>

      {/* Property image – right side */}
      <View style={styles.propImg}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.propImgInner} />
        ) : (
          <View style={[styles.propImgInner, { backgroundColor: colors.glass60 }]}>
            <Ionicons name="image-outline" size={28} color={colors.textWhite50} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xl,
    flex: 1,
  },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: Radius['2xl'],
    backgroundColor: '#00000033',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favInfo: {
    flex: 1,
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  favTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['2xl'],
    color: colors.textWhite,
    textAlign: 'right',
  },
  favLocation: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.sm,
    color: colors.textWhite,
    textAlign: 'right',
  },
  favPrice: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.md,
    color: colors.primary,
  },
  propImg: {
    width: 86,
    height: 86,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  propImgInner: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
