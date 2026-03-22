import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import OpportunityCard from './OpportunityCard';
import type { Project } from '../../services/api';

type Props = {
  projects: Project[];
  onProjectPress: (project: Project) => void;
};

export default function OpportunitiesSection({ projects, onProjectPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (projects.length === 0) return null;

  return (
    <View style={styles.opportunitiesSection}>
      <Text style={styles.sectionTitle}>הזדמנויות חדשות</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.opportunitiesScroll}
        style={{ direction: 'rtl' }}
      >
        {projects.map((project) => (
          <OpportunityCard
            key={project.id}
            project={project}
            onPress={() => onProjectPress(project)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  opportunitiesSection: { marginBottom: Spacing.md, marginHorizontal: -Spacing['4xl'] },
  sectionTitle: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize['5xl'],
    color: colors.textWhite,
    textAlign: 'right',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing['4xl'],
  },
  opportunitiesScroll: {
    gap: Spacing.xl,
    paddingRight: Spacing['4xl'],
  },
});
