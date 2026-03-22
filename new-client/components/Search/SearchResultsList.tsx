import { View, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import { type Project, type Apartment } from '../../services/api';
import PropertyCard from './PropertyCard';
import EmptyState from './EmptyState';

interface SearchResultsListProps {
  isLoading: boolean;
  filteredProjects: Project[];
  filteredApartments: Apartment[];
  totalCount: number;
}

export default function SearchResultsList({
  isLoading,
  filteredProjects,
  filteredApartments,
  totalCount,
}: SearchResultsListProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView
      contentContainerStyle={styles.resultsContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : totalCount === 0 ? (
        <EmptyState message="לא נמצאו נכסים" />
      ) : (
        <>
          {filteredProjects.map((p) => (
            <PropertyCard
              key={`project-${p.id}`}
              title={p.title}
              subtitle={p.project_address}
              details={p.type ?? ''}
              price={null}
              imageUri={p.project_image_url}
              placeholderIcon="business"
              onPress={() => router.push(`/project/${p.id}` as never)}
            />
          ))}
          {filteredApartments.map((a) => {
            const price = a.price ? `₪${parseFloat(a.price).toLocaleString('he-IL')}` : 'מחיר לפי פנייה';
            const details = [
              a.number_of_rooms != null ? `${a.number_of_rooms} חדרים` : null,
              a.apartment_size_sqm != null ? `${a.apartment_size_sqm} מ"ר` : null,
              a.floor != null ? `קומה ${a.floor}` : null,
            ].filter(Boolean).join(' \u2022 ');

            return (
              <PropertyCard
                key={`apt-${a.id}`}
                title={a.apartment_specific_address}
                subtitle={a.project.title}
                details={details}
                price={price}
                imageUri={a.main_image}
                placeholderIcon="home"
                onPress={() => router.push(`/apartment/${a.id}` as never)}
              />
            );
          })}
        </>
      )}
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  resultsContent: {
    paddingHorizontal: Spacing['3xl'],
    paddingTop: Spacing.xs,
    gap: Spacing.xl,
  },
});
