import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { Spacing, Radius, FontSize } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import type { DealStage, DealTransaction } from '../../services/api';

const STAGES: { key: DealStage; label: string }[] = [
  { key: 'ATTACHMENT', label: '\u05D4\u05E6\u05DE\u05D3\u05D4' },
  { key: 'CONTRACT', label: '\u05D7\u05D5\u05D6\u05D4' },
  { key: 'SIGNING', label: '\u05D7\u05EA\u05D9\u05DE\u05D4' },
  { key: 'CLOSING', label: '\u05E1\u05D2\u05D9\u05E8\u05D4' },
];

const STAGE_INDEX: Record<DealStage, number> = {
  ATTACHMENT: 0,
  CONTRACT: 1,
  SIGNING: 2,
  CLOSING: 3,
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('he-IL');
}

interface DealProgressTrackerProps {
  currentStage: DealStage;
  transactions: DealTransaction[];
}

export default function DealProgressTracker({ currentStage, transactions }: DealProgressTrackerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const currentStageIdx = STAGE_INDEX[currentStage] ?? 0;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{'\u05E9\u05DC\u05D1\u05D9 \u05D4\u05E2\u05E1\u05E7\u05D4'}</Text>
      <View style={styles.progressTracker}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const tx = transactions.find((t) => t.stage === stage.key);
          return (
            <View key={stage.key} style={styles.stageItem}>
              {/* Connector line */}
              {idx > 0 && (
                <View
                  style={[
                    styles.connector,
                    idx <= currentStageIdx ? styles.connectorDone : styles.connectorFuture,
                  ]}
                />
              )}
              {/* Circle */}
              <View
                style={[
                  styles.stageCircle,
                  isDone && styles.stageCircleDone,
                  isCurrent && styles.stageCircleCurrent,
                  !isDone && !isCurrent && styles.stageCircleFuture,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : isCurrent ? (
                  <View style={styles.pulseDot} />
                ) : (
                  <View style={styles.emptyDot} />
                )}
              </View>
              {/* Label */}
              <Text
                style={[
                  styles.stageLabel,
                  (isDone || isCurrent) && styles.stageLabelActive,
                ]}
              >
                {stage.label}
              </Text>
              {/* Date */}
              {tx?.completion_date && isDone && (
                <Text style={styles.stageDate}>{formatDate(tx.completion_date)}</Text>
              )}
              {tx?.request_date && isCurrent && (
                <Text style={styles.stageDate}>{formatDate(tx.request_date)}</Text>
              )}
            </View>
          );
        })}
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
    progressTracker: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: Spacing.xs,
    },
    stageItem: {
      alignItems: 'center',
      flex: 1,
      position: 'relative',
    },
    connector: {
      position: 'absolute',
      top: Spacing['2xl'],
      right: '50%',
      width: '100%',
      height: 2,
      zIndex: -1,
    },
    connectorDone: { backgroundColor: colors.primary },
    connectorFuture: { backgroundColor: colors.glass60 },
    stageCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    stageCircleDone: { backgroundColor: '#22c55e' },
    stageCircleCurrent: { backgroundColor: colors.primary },
    stageCircleFuture: { backgroundColor: colors.glass60, borderWidth: 1, borderColor: colors.borderLight },
    pulseDot: { width: Spacing.md, height: Spacing.md, borderRadius: Radius.xs, backgroundColor: colors.bgDark },
    emptyDot: { width: Spacing.sm, height: Spacing.sm, borderRadius: 3, backgroundColor: colors.textWhite25 },
    stageLabel: {
      fontFamily: Fonts.heebo.medium,
      fontSize: FontSize.sm,
      color: colors.textWhite50,
      textAlign: 'center',
    },
    stageLabelActive: { color: colors.textWhite },
    stageDate: {
      fontFamily: Fonts.manrope.semiBold,
      fontSize: 10,
      color: colors.textWhite50,
      marginTop: Spacing.xxs,
    },
  });
