import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface CTAFooterProps {
  onCall: () => void;
  onWhatsApp: () => void;
  callLabel?: string;
  whatsAppLabel?: string;
}

export default function CTAFooter({
  onCall,
  onWhatsApp,
  callLabel = 'התקשר עכשיו',
  whatsAppLabel = 'WhatsApp',
}: CTAFooterProps) {
  const { mode, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 12 }]}>
      <BlurView intensity={40} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(34,31,16,0)', 'rgba(34,31,16,0.8)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.ctaRow}>
        <TouchableOpacity style={styles.whatsappButton} onPress={onWhatsApp}>
          <Ionicons name="logo-whatsapp" size={18} color={colors.textWhite} />
          <Text style={styles.whatsappText}>{whatsAppLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={onCall}>
          <Ionicons name="call" size={18} color={colors.bgDark} />
          <Text style={styles.callText}>{callLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    ctaBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingTop: 16,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      overflow: 'hidden',
    },
    ctaRow: { flexDirection: 'row', gap: 8 },
    callButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 14,
      height: 48,
      gap: 8,
    },
    callText: { fontFamily: Fonts.manrope.bold, fontSize: 15, color: colors.bgDark },
    whatsappButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glass20,
      borderRadius: 14,
      height: 48,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.borderGold,
    },
    whatsappText: { fontFamily: Fonts.manrope.bold, fontSize: 15, color: colors.textWhite },
  });
