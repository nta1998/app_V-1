import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { type ThemeColors } from '../constants/theme';
import { Spacing, Radius } from '../constants/tokens';
import { useTheme } from '../hooks/useTheme';

type Props = {
  percentage: number;
  height?: number;
  segments?: number;
};

export default function ProgressBar({ percentage, height = 6, segments }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors, height), [colors, height]);
  const clamped = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={{ gap: segments ? Spacing.sm : 0 }}>
      {segments && (
        <View style={styles.segmentsRow}>
          {Array.from({ length: segments }).map((_, i) => {
            const filled = i < Math.floor(clamped / (100 / segments));
            const partial = i === Math.floor(clamped / (100 / segments));
            return (
              <View
                key={i}
                style={[
                  styles.segment,
                  filled && styles.segmentFilled,
                  partial && styles.segmentPartial,
                  !filled && !partial && styles.segmentEmpty,
                ]}
              />
            );
          })}
        </View>
      )}
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, height: number) =>
  StyleSheet.create({
    segmentsRow: {
      flexDirection: 'row',
      gap: Spacing.xs,
      height: Spacing.xs,
    },
    segment: {
      flex: 1,
      borderRadius: Spacing.xxs,
    },
    segmentFilled: {
      backgroundColor: colors.primary,
    },
    segmentPartial: {
      backgroundColor: colors.primaryDim,
    },
    segmentEmpty: {
      backgroundColor: colors.glass60,
    },
    bar: {
      height,
      backgroundColor: colors.glass60,
      borderRadius: height / 2,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: height / 2,
    },
  });
