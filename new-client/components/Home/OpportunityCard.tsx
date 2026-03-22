import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import type { Project } from '../../services/api';

type Props = {
  project: Project;
  onPress: () => void;
};

export default function OpportunityCard({ project, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.opportunityCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {project.project_image_url ? (
        <Image
          source={{ uri: project.project_image_url }}
          style={styles.opportunityImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.opportunityImagePlaceholder}>
          <Ionicons name="business" size={24} color={colors.primary} />
        </View>
      )}
      <View style={styles.opportunityFooter}>
        <View style={styles.opportunityInfo}>
          <Text style={styles.opportunityName} numberOfLines={1}>
            {project.title}
          </Text>
          <Text style={styles.opportunityLocationText} numberOfLines={1}>
            {project.project_address}
          </Text>
        </View>
        {project.type && (
          <View style={styles.opportunityTypeBadge}>
            <Text style={styles.opportunityTypeBadgeText}>{project.type}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  opportunityCard: {
    width: 200,
    height: 190,
    backgroundColor: colors.glass20,
    borderRadius: Radius['3xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  opportunityImage: {
    width: 200,
    height: 130,
  },
  opportunityImagePlaceholder: {
    width: 200,
    height: 130,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opportunityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  opportunityInfo: {
    alignItems: 'flex-end',
    gap: 1,
    flex: 1,
  },
  opportunityName: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.lg,
    color: colors.textWhite,
    textAlign: 'right',
  },
  opportunityLocationText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.sm,
    color: colors.textWhite,
  },
  opportunityTypeBadge: {
    backgroundColor: colors.primaryDim,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
  },
  opportunityTypeBadgeText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.sm,
    color: colors.primary,
  },
});
