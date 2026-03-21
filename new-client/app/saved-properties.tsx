import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { Fonts, type ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useApi } from '../hooks/useApi';
import { favoritesApi, type Favorite } from '../services/api';

export default function SavedPropertiesScreen() {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, refetch } = useApi(favoritesApi.list);
  const [removing, setRemoving] = useState<number | null>(null);

  const favorites: Favorite[] = state.status === 'success' ? state.data : [];

  const handleRemove = useCallback(
    (fav: Favorite) => {
      const name =
        fav.apartment?.apartment_specific_address ??
        fav.project?.title ??
        'נכס';
      Alert.alert('הסרה מהמועדפים', `להסיר את "${name}" מהמועדפים?`, [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'הסר',
          style: 'destructive',
          onPress: async () => {
            setRemoving(fav.id);
            try {
              await favoritesApi.remove(fav.id);
              await refetch();
            } catch {
              Alert.alert('שגיאה', 'לא ניתן להסיר את הנכס. נסה שנית.');
            } finally {
              setRemoving(null);
            }
          },
        },
      ]);
    },
    [refetch]
  );

  return (
    <LinearGradient
      colors={[colors.bgDeep, colors.bgDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header – glass pill bar */}
        <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.headerWrapper}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={colors.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>נכסים שמורים</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="filter" size={20} color={colors.textWhite} />
          </TouchableOpacity>
        </BlurView>

        {/* Body */}
        {state.status === 'loading' ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : state.status === 'error' ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.primary} />
            <Text style={styles.emptyText}>לא ניתן לטעון מועדפים</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryText}>נסה שנית</Text>
            </TouchableOpacity>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="heart-outline" size={48} color={colors.textWhite50} />
            <Text style={styles.emptyTitle}>אין נכסים שמורים</Text>
            <Text style={styles.emptyText}>נכסים שתסמן כמועדפים יופיעו כאן</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Properties Sheet – glass wrapper */}
            <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.propertiesSheet}>
              {favorites.map((fav) => (
                <View key={fav.id} style={styles.propertyCard}>
                  <FavoriteItem
                    fav={fav}
                    onRemove={() => handleRemove(fav)}
                    removing={removing === fav.id}
                  />
                </View>
              ))}
            </BlurView>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Favorite item ─────────────────────────────────────────────────────────────

function FavoriteItem({
  fav,
  onRemove,
  removing,
}: {
  fav: Favorite;
  onRemove: () => void;
  removing: boolean;
}) {
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
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Header – glass pill bar
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    height: 48,
    borderRadius: 18,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
    overflow: 'hidden',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 18,
    color: colors.textWhite,
    textAlign: 'center',
    flex: 1,
  },

  // States
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 18,
    color: colors.textWhite,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 14,
    color: colors.textWhite50,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 14,
    color: colors.bgDark,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // Properties Sheet – glass wrapper
  propertiesSheet: {
    borderRadius: 24,
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
    padding: 16,
    gap: 16,
    overflow: 'hidden',
  },

  // Individual property card
  propertyCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
    height: 110,
    overflow: 'hidden',
  },

  // Favorite item
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    flex: 1,
  },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00000033',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favInfo: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  favTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 17,
    color: colors.textWhite,
    textAlign: 'right',
  },
  favLocation: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: colors.textWhite,
    textAlign: 'right',
  },
  favPrice: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 14,
    color: colors.primary,
  },

  // Property image
  propImg: {
    width: 86,
    height: 86,
    borderRadius: 12,
    overflow: 'hidden',
  },
  propImgInner: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
