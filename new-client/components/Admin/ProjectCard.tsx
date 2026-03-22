import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 16;
const CARD_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = 220;

interface ProjectCardProps {
  imageUrl?: string | null;
  title: string;
  address: string;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function ProjectCard({
  imageUrl,
  title,
  address,
  onPress,
  onLongPress,
}: ProjectCardProps) {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.85}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cardImagePlaceholder]}>
          <Ionicons name="business" size={40} color={colors.primaryGlow} />
        </View>
      )}

      <LinearGradient
        colors={['transparent', colors.bgDeep + 'CC']}
        style={StyleSheet.absoluteFill}
      />

      <BlurView
        intensity={20}
        tint={mode === 'dark' ? 'dark' : 'light'}
        style={styles.glassFooter}
      >
        <View style={styles.glassFooterInner}>
          <View style={styles.footerTextBlock}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {address}
            </Text>
          </View>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

export { CARD_WIDTH, CARD_HEIGHT };

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
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
      width: CARD_WIDTH - Spacing['5xl'],
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
