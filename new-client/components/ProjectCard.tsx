import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../constants/tokens';
import { useTheme } from '../hooks/useTheme';

type Props = {
  imageUrl?: string | null;
  title: string;
  subtitle: string;
  onPress: () => void;
  width: number;
  height: number;
};

export default function ProjectCard({ imageUrl, title, subtitle, onPress, width, height }: Props) {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors, width, height), [colors, width, height]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Full-width image or placeholder */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cardImagePlaceholder]}>
          <Ionicons name="business" size={40} color={colors.primaryGlow} />
        </View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', colors.bgDeep + 'CC']}
        style={StyleSheet.absoluteFill}
      />

      {/* Glass footer */}
      <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.glassFooter}>
        <View style={styles.glassFooterInner}>
          <View style={styles.footerTextBlock}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors, width: number, height: number) => StyleSheet.create({
  card: {
    width,
    height,
    borderRadius: Radius['5xl'],
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  glassFooter: {
    position: 'absolute',
    left: Spacing.xl,
    bottom: Spacing.xl,
    width: width - Spacing['5xl'],
    height: Height.buttonXl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  glassFooterInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    backgroundColor: colors.glass20,
  },
  footerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: Spacing.xxs,
  },
  cardTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: FontSize.lg,
    color: colors.textWhite,
    textAlign: 'right',
  },
  cardSubtitle: {
    fontFamily: Fonts.heebo.regular,
    fontSize: FontSize.sm,
    color: colors.textWhite,
    textAlign: 'right',
  },
});
