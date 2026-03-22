import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

type Milestone = {
  year: string;
  title: string;
  desc: string;
  isToday?: boolean;
};

const MILESTONES: Milestone[] = [
  {
    year: '2010',
    title: 'הקמת החברה',
    desc: 'ציון לילוז מתחיל את דרכו בתחום שיווק נדל״ן ומקים את החברה.',
  },
  {
    year: '2015',
    title: 'התרחבות למגדלי יוקרה',
    desc: 'ניהול מערכות שיווק ומכירה לפרויקטי מגורים ומגדלי יוקרה.',
  },
  {
    year: '2019',
    title: 'פיתוח שיטת 360°',
    desc: 'השקת המתודולוגיה הייחודית לשיווק פרויקטים למגורים.',
  },
  {
    year: 'היום',
    title: 'מובילי שוק הנדל״ן',
    desc: 'ליווי יזמים בתל אביב וגוש דן עם תוצאות יוצאות דופן.',
    isToday: true,
  },
];

export default function MilestoneTimeline() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.milestonesSection}>
      <Text style={styles.milestonesSubtitle}>הדרך שלנו</Text>
      <Text style={styles.milestonesTitle}>ציוני דרך</Text>

      <View style={styles.timelineContainer}>
        {/* Gold gradient line on RIGHT side */}
        <LinearGradient
          colors={['#c8a455', '#c8a45500']}
          style={styles.timelineLine}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {MILESTONES.map((m, i) => (
          <View key={i} style={styles.milestoneRow}>
            {/* Content card on the LEFT */}
            <View
              style={[
                styles.milestoneCard,
                m.isToday && styles.milestoneCardToday,
              ]}
            >
              <Text style={styles.milestoneCardTitle}>{m.title}</Text>
              <Text style={styles.milestoneCardDesc}>{m.desc}</Text>
            </View>

            {/* Year label to LEFT of dot */}
            <Text style={styles.milestoneYear}>{m.year}</Text>

            {/* Dot on the RIGHT */}
            {m.isToday ? (
              <View style={styles.milestoneDiamond}>
                <Ionicons name="diamond" size={14} color={colors.bgDark} />
              </View>
            ) : (
              <View style={styles.milestoneDot}>
                <View style={styles.milestoneDotInner} />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  milestonesSection: {
    backgroundColor: colors.bgDark,
    paddingTop: 0,
    paddingHorizontal: Spacing['4xl'],
    paddingBottom: Spacing['4xl'],
    gap: Spacing['3xl'],
  },
  milestonesSubtitle: {
    fontFamily: Fonts.heebo.medium,
    fontSize: FontSize.base,
    color: '#c8a455',
    textAlign: 'right',
    letterSpacing: 1,
  },
  milestonesTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['5xl'],
    color: colors.textWhite,
    textAlign: 'right',
  },
  timelineContainer: {
    position: 'relative',
    minHeight: 540,
  },
  timelineLine: {
    position: 'absolute',
    right: 7,
    top: 0,
    width: 2,
    height: 540,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing['5xl'],
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing['3xl'],
    marginRight: Spacing.xl,
    gap: Spacing.sm,
  },
  milestoneCardToday: {
    borderColor: '#c8a4554D',
    backgroundColor: colors.glass20,
  },
  milestoneCardTitle: {
    fontFamily: Fonts.heebo.bold,
    fontSize: FontSize.lg,
    color: colors.textWhite,
    textAlign: 'right',
  },
  milestoneCardDesc: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.base,
    color: colors.textWhite70,
    textAlign: 'right',
    lineHeight: FontSize.base * 1.5,
  },
  milestoneYear: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.md,
    color: '#c8a455',
    width: 40,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  milestoneDot: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.sm,
    backgroundColor: '#c8a45530',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  milestoneDotInner: {
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Radius.xs,
    backgroundColor: '#c8a455',
  },
  milestoneDiamond: {
    width: Spacing['5xl'],
    height: Spacing['5xl'],
    borderRadius: Radius.lg,
    backgroundColor: '#c8a455',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
});
