import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

export default function MethodDiagram() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.methodSection}>
      <Text style={styles.methodTitle}>שיטת 360°</Text>
      <Text style={styles.methodDesc}>
        השיטה שפיתחתי לשיווק פרויקטים למגורים, המשלבת אסטרטגיה, שיווק
        וטכנולוגיה לתוצאות מקסימליות.
      </Text>

      {/* 360° Circular Diagram */}
      <View style={styles.diagramContainer}>
        {/* Dashed circle */}
        <View style={styles.dashedCircle} />
        {/* Pulse circle */}
        <View style={styles.pulseCircle} />
        {/* Center badge */}
        <View style={styles.centerBadge}>
          <Text style={styles.centerBadgeText}>360°</Text>
        </View>

        {/* Orbital elements */}
        <View style={[styles.orbitalItem, styles.orbitalTop]}>
          <Text style={styles.orbitalText}>אסטרטגיה</Text>
        </View>
        <View style={[styles.orbitalItem, styles.orbitalLeft]}>
          <Text style={styles.orbitalText}>שיווק</Text>
        </View>
        <View style={[styles.orbitalItem, styles.orbitalRight]}>
          <Text style={[styles.orbitalText, { fontSize: FontSize.base }]}>
            טכנולוגיה
          </Text>
        </View>
        <View style={[styles.orbitalItem, styles.orbitalBottom]}>
          <Text style={styles.orbitalText}>תוצאות</Text>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  methodSection: {
    backgroundColor: colors.bgDark,
    paddingTop: Spacing['5xl'],
    paddingBottom: 0,
    paddingHorizontal: Spacing['4xl'],
    gap: Spacing['4xl'],
  },
  methodTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['4xl'],
    color: colors.textWhite,
    textAlign: 'center',
  },
  methodDesc: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.md,
    color: colors.textWhite70,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.6,
  },
  diagramContainer: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
  },
  dashedCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: '#c8a45530',
    borderStyle: 'dashed',
    top: 15,
    left: 15,
  },
  pulseCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#c8a45510',
    borderWidth: 1,
    borderColor: '#c8a45520',
    top: 35,
    left: 35,
  },
  centerBadge: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#C8A455',
    top: 88,
    left: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBadgeText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['4xl'],
    color: colors.bgDark,
  },
  orbitalItem: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.glass20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitalTop: {
    left: 85,
    top: 0,
  },
  orbitalLeft: {
    left: 0,
    top: 85,
  },
  orbitalRight: {
    left: 170,
    top: 85,
  },
  orbitalBottom: {
    left: 85,
    top: 170,
  },
  orbitalText: {
    fontFamily: Fonts.heebo.medium,
    fontSize: FontSize.md,
    color: colors.textWhite,
    textAlign: 'center',
  },
});
