import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { makeStyles } from './styles/savedProperties.styles';
import { useApi } from '../../hooks/useApi';
import { favoritesApi, type Favorite } from '../../services/api';
import StateView from '../../components/StateView';
import { FavoriteItem } from '../../components/SavedProperties';

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
          <StateView status="loading" />
        ) : state.status === 'error' ? (
          <StateView status="error" message="לא ניתן לטעון מועדפים" onRetry={refetch} />
        ) : favorites.length === 0 ? (
          <StateView status="empty" icon="heart-outline" message="אין נכסים שמורים" />
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

