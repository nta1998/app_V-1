import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

type Props = {
  onPhone: () => void;
  onWhatsApp: () => void;
};

export default function AboutPanel({ onPhone, onWhatsApp }: Props) {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.aboutPanelWrapper}>
      <BlurView intensity={24} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.aboutPanel}>
        {/* Gold gradient line at top */}
        <LinearGradient
          colors={['#c8a455', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.aboutGoldLine}
        />

        <View style={styles.aboutPanelContent}>
          <Text style={styles.aboutTitle}>אודותיי</Text>
          <Text style={styles.aboutText}>
            שמי ציון לילוז, בן 54, עוסק בתחום שיווק נדל״ן משנת 2010. אני
            מלווה יזמים בכל שלבי הפרויקט: ניתוח כלכלי, תמחור ובדיקת כדאיות
            כלכלית, תכנון, מיתוג, שיווק ומכירה.
          </Text>

          {/* CTA Buttons */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={onPhone}
              activeOpacity={0.85}
            >
              <Ionicons name="call" size={16} color={colors.bgDark} />
              <Text style={styles.ctaTextDark}>חייג עכשיו</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={onWhatsApp}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color={colors.bgDeep} />
              <Text style={styles.ctaTextDark}>וואטסאפ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  aboutPanelWrapper: {
    marginTop: -60,
    paddingHorizontal: Spacing['4xl'],
    zIndex: 10,
  },
  aboutPanel: {
    borderRadius: Radius['4xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  aboutPanelContent: {
    backgroundColor: colors.glass20,
    padding: Spacing['4xl'],
    paddingTop: Spacing['3xl'],
    gap: Spacing.xl,
  },
  aboutGoldLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  aboutTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize['3xl'],
    color: colors.textWhite,
    textAlign: 'right',
  },
  aboutText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.md,
    color: colors.textWhite,
    textAlign: 'right',
    lineHeight: FontSize.md * 1.6,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  phoneButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c8a455',
    borderRadius: Radius.xl,
    height: Height.buttonLg,
    gap: Spacing.md,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: Radius.xl,
    height: Height.buttonLg,
    gap: Spacing.md,
  },
  ctaTextDark: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.base,
    color: colors.textWhite,
  },
});
