import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize, Height } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import type { DealTeamMember } from '../../services/api';

interface DealTeamSectionProps {
  team: DealTeamMember[];
}

export default function DealTeamSection({ team }: DealTeamSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (team.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{'\u05D4\u05E6\u05D5\u05D5\u05EA \u05E9\u05DC\u05DA'}</Text>
      <View style={styles.teamList}>
        {team.map((member) => (
          <View key={member.id} style={styles.teamCard}>
            <View style={styles.teamAvatar}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{member.name}</Text>
              <Text style={styles.teamRole}>
                {member.role === 'DEAL_MANAGER' ? '\u05DE\u05E0\u05D4\u05DC \u05E2\u05E1\u05E7\u05D4' : '\u05E2\u05D5\u05E8\u05DA \u05D3\u05D9\u05DF'}
              </Text>
            </View>
            <View style={styles.teamActions}>
              <TouchableOpacity
                style={styles.teamActionBtn}
                onPress={() => Linking.openURL(`tel:${member.phone}`)}
              >
                <Ionicons name="call-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.teamActionBtn}
                onPress={() => Linking.openURL(`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`)}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.glass20,
      borderRadius: Radius['4xl'],
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
      padding: Spacing['3xl'],
    },
    sectionTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize['3xl'],
      color: colors.textWhite,
      textAlign: 'right',
      marginBottom: Spacing.xl,
    },
    teamList: { gap: Spacing.lg },
    teamCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.glass20,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      gap: Spacing.xl,
    },
    teamAvatar: {
      width: Height.avatarXl,
      height: Height.avatarXl,
      borderRadius: 22,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    teamInfo: { flex: 1, alignItems: 'flex-end', gap: Spacing.xxs },
    teamName: {
      fontFamily: Fonts.manrope.bold,
      fontSize: FontSize.lg,
      color: colors.textWhite,
      textAlign: 'right',
    },
    teamRole: {
      fontFamily: Fonts.heebo.regular,
      fontSize: FontSize.base,
      color: colors.textWhite50,
    },
    teamActions: { flexDirection: 'row', gap: Spacing.md },
    teamActionBtn: {
      width: 38,
      height: 38,
      borderRadius: Radius.lg,
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
