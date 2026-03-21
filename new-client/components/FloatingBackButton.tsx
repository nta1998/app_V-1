import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../hooks/useTheme';

interface FloatingBackButtonProps {
  onPress?: () => void;
  side?: 'left' | 'right';
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function FloatingBackButton({
  onPress,
  side = 'left',
  icon = 'arrow-back',
}: FloatingBackButtonProps) {
  const { mode, colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { top: insets.top + 12, [side]: 16 }]}>
      <TouchableOpacity
        style={[styles.button, { borderColor: colors.borderMedium }]}
        onPress={onPress ?? (() => router.back())}
      >
        <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <Ionicons name={icon} size={22} color={colors.textWhite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', zIndex: 10 },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
