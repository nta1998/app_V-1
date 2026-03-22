import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type ThemeColors } from '../../constants/theme';
import { Spacing } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import FeaturesTile from './FeaturesTile';

interface FeatureItem {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}

interface FeaturesGridProps {
  features: FeatureItem[];
}

export default function FeaturesGrid({ features }: FeaturesGridProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (features.length === 0) return null;

  return (
    <View style={styles.featuresGrid}>
      {features.map((f, i) => (
        <FeaturesTile key={i} icon={f.icon} label={f.label} value={f.value} />
      ))}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.lg,
    },
  });
