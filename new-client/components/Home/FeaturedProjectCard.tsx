import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import ProgressBar from '../ProgressBar';
import type { Project } from '../../services/api';

type Props = {
  project: Project;
  onPress: () => void;
  onViewProgress: () => void;
};

export default function FeaturedProjectCard({ project, onPress, onViewProgress }: Props) {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <BlurView intensity={40} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={styles.projectCardInner}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{project.type || 'בבנייה'}</Text>
            <View style={styles.statusDot} />
          </View>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>{project.project_address}</Text>
            <Ionicons name="navigate-outline" size={14} color="#ffffff80" />
          </View>
        </View>

        {/* Stage Section */}
        <View style={styles.stageSection}>
          <View style={styles.stageLabelsRow}>
            <Text style={styles.stageLabelLeft}>סיום שלד</Text>
            <Text style={styles.stageLabelRight}>שלב נוכחי</Text>
          </View>
          <ProgressBar percentage={project.percentage} segments={4} />
          <Text style={styles.progressPercent}>
            {project.percentage}% הושלם
          </Text>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Card Footer */}
        <View style={styles.projectFooter}>
          <TouchableOpacity
            style={styles.ctaRow}
            onPress={onViewProgress}
            activeOpacity={0.7}
          >
            <View style={styles.ctaCircle}>
              <Ionicons name="chevron-back" size={14} color={colors.primary} />
            </View>
            <Text style={styles.ctaText}>צפה בהתקדמות</Text>
          </TouchableOpacity>
          <View style={styles.teamRow}>
            <View style={[styles.teamAvatar, { left: 0, backgroundColor: colors.bgDark }]}>
              <Text style={styles.teamExtraText}>+{Math.max(project.documents.length, 2)}</Text>
            </View>
            <View style={[styles.teamAvatar, { left: 28, backgroundColor: colors.glass60 }]}>
              <Ionicons name="person" size={14} color={colors.textWhite50} />
            </View>
            <View style={[styles.teamAvatar, { left: 48, backgroundColor: colors.glass60 }]}>
              <Ionicons name="person" size={14} color={colors.textWhite50} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  projectCard: {
    borderRadius: Radius['6xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: colors.glass20,
  },
  projectCardInner: {
    paddingTop: Spacing['4xl'],
    paddingHorizontal: Spacing['4xl'],
    paddingBottom: Spacing['3xl'],
    gap: Spacing['3xl'],
  },
  cardHeader: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusBadgeText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.md,
    color: colors.success,
  },
  projectTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['5xl'],
    color: colors.textWhite,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.xl,
    color: colors.textWhite,
  },
  stageSection: { gap: Spacing.lg },
  stageLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageLabelLeft: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.xl,
    color: colors.primary,
  },
  stageLabelRight: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.md,
    color: colors.textWhite,
  },
  progressPercent: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.md,
    color: colors.textWhite,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ctaCircle: {
    width: 30,
    height: 30,
    borderRadius: Radius.xl,
    backgroundColor: colors.glass60,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: FontSize.lg,
    color: colors.primary,
  },
  teamRow: {
    width: 80,
    height: 32,
    position: 'relative',
  },
  teamAvatar: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: Radius['2xl'],
    borderWidth: 2,
    borderColor: colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
  },
  teamExtraText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.sm,
    color: colors.textWhite,
  },
});
