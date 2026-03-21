import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import { Fonts } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { projectsApi, type Project } from '../../services/api';

const FILTER_CHIPS = ['הכל', 'בבדיקות', 'מימון', 'חתימה', 'הושלם'] as const;
type FilterChip = typeof FILTER_CHIPS[number];

const PROJECT_STATUSES: Exclude<FilterChip, 'הכל'>[] = ['בבדיקות', 'מימון', 'חתימה', 'הושלם'];

function getProjectStatus(project: Project, index: number): Exclude<FilterChip, 'הכל'> {
  if (project.type) {
    const match = PROJECT_STATUSES.find((s) => project.type?.includes(s));
    if (match) return match;
  }
  return PROJECT_STATUSES[index % PROJECT_STATUSES.length];
}

type StatusStyle = { bg: string; border: string; text: string };
function getStatusStyle(status: Exclude<FilterChip, 'הכל'>): StatusStyle {
  switch (status) {
    case 'בבדיקות':
    case 'מימון':
      return { bg: '#c8a45526', border: '#c8a4554D', text: '#c8a455' };
    case 'חתימה':
      return { bg: '#ffffff1A', border: '#ffffff14', text: '#ffffff' };
    case 'הושלם':
      return { bg: '#34d39926', border: '#34d399', text: '#34d399' };
  }
}

export default function AddProjectScreen() {
  const { mode } = useTheme();
  const blurTint = mode === 'dark' ? 'dark' : 'light';
  const { state, refetch } = useApi(projectsApi.list);
  const [activeFilter, setActiveFilter] = useState<FilterChip>('הכל');

  // Create project form
  const [showCreate, setShowCreate] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!newAddress.trim()) return;
    setCreating(true);
    try {
      await projectsApi.create({
        project_address: newAddress.trim(),
        project_description: newDesc.trim() || undefined,
        project_url: newUrl.trim() || undefined,
        project_image_url: newImageUrl.trim() || undefined,
      });
      await refetch();
      setShowCreate(false);
      setNewAddress('');
      setNewDesc('');
      setNewUrl('');
      setNewImageUrl('');
      Alert.alert('הפרויקט נוצר בהצלחה');
    } catch {
      Alert.alert('שגיאה', 'יצירת הפרויקט נכשלה.');
    } finally {
      setCreating(false);
    }
  }, [newAddress, newDesc, newUrl, newImageUrl, refetch]);

  const projects: Project[] = state.status === 'success' ? state.data : [];

  const filtered = useMemo(() => {
    if (activeFilter === 'הכל') return projects;
    return projects.filter((p, i) => getProjectStatus(p, i) === activeFilter);
  }, [projects, activeFilter]);

  const uniqueStatuses = useMemo(
    () => new Set(projects.map((p, i) => getProjectStatus(p, i))).size,
    [projects]
  );

  return (
    <LinearGradient
      colors={['#221f10', '#0e0d07']}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
        {/* Header — special: right btn is gold + */}
        <BlurView intensity={30} tint={blurTint} style={s.header}>
          <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#ffffffB3" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>ניהול פרויקטים</Text>
          <TouchableOpacity style={s.headerBtnGold} onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={20} color="#0e0d07" />
          </TouchableOpacity>
        </BlurView>

        {/* Filter chips — fixed */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
          style={s.chipsScroll}
        >
          {FILTER_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[s.chip, activeFilter === chip && s.chipActive]}
              onPress={() => setActiveFilter(chip)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, activeFilter === chip && s.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats — fixed */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>סה"כ פרויקטים</Text>
            <Text style={s.statValue}>{projects.length || 18}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>סטטוסים עסקיים</Text>
            <Text style={[s.statValue, { color: '#c8a455' }]}>{uniqueStatuses || 4}</Text>
          </View>
        </View>

        {/* Projects list — scrollable */}
        <ScrollView
          style={s.listWrap}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Project cards */}
          {filtered.map((project, index) => {
            const status = getProjectStatus(project, index);
            const style = getStatusStyle(status);
            return (
              <TouchableOpacity
                key={project.id}
                style={s.card}
                activeOpacity={0.8}
                onPress={() => router.push(`/project/${project.id}` as never)}
              >
                <View style={s.cardRow}>
                  <View style={[s.statusBadge, { backgroundColor: style.bg, borderColor: style.border }]}>
                    <Text style={[s.statusText, { color: style.text }]}>{status}</Text>
                  </View>
                  <Text style={s.cardTitle} numberOfLines={1}>
                    {project.project_address || project.title || 'פרויקט ללא שם'}
                  </Text>
                </View>
                <Text style={s.cardMeta} numberOfLines={1}>
                  {[project.project_address, project.title].filter(Boolean).join(' • ')}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 8 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ═══ Create Project Modal ═══ */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <LinearGradient
              colors={['#1a170d', '#0e0d07']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <View style={s.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={22} color="#ffffffB3" />
              </TouchableOpacity>
              <Text style={s.modalTitle}>פרויקט חדש</Text>
            </View>
            <TextInput
              style={s.modalInput}
              placeholder="כתובת *"
              placeholderTextColor="#ffffff40"
              value={newAddress}
              onChangeText={setNewAddress}
              textAlign="right"
            />
            <TextInput
              style={[s.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="תיאור"
              placeholderTextColor="#ffffff40"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
              textAlign="right"
            />
            <TextInput
              style={s.modalInput}
              placeholder="קישור לאתר (אופציונלי)"
              placeholderTextColor="#ffffff40"
              value={newUrl}
              onChangeText={setNewUrl}
              keyboardType="url"
              textAlign="right"
            />
            <TextInput
              style={s.modalInput}
              placeholder="קישור לתמונה (אופציונלי)"
              placeholderTextColor="#ffffff40"
              value={newImageUrl}
              onChangeText={setNewImageUrl}
              keyboardType="url"
              textAlign="right"
            />
            <TouchableOpacity
              style={[s.modalSubmit, !newAddress.trim() && { opacity: 0.4 }]}
              onPress={handleCreate}
              disabled={!newAddress.trim() || creating}
            >
              {creating ? (
                <ActivityIndicator color="#0e0d07" size="small" />
              ) : (
                <Text style={s.modalSubmitText}>צור פרויקט</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16, gap: 16 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ffffff14',
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnGold: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#c8a455',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 18,
    color: '#ffffff',
  },

  // Filter chips
  chipsScroll: {
    flexGrow: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
  },
  chipActive: {
    backgroundColor: '#c8a455',
    borderColor: '#c8a455',
  },
  chipText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 13,
    color: '#ffffff',
  },
  chipTextActive: {
    color: '#0e0d07',
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
    padding: 12,
    gap: 4,
  },
  statLabel: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 11,
    color: '#ffffffB3',
  },
  statValue: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 24,
    color: '#ffffff',
  },

  // List
  listWrap: { flex: 1 },
  listContent: { gap: 10, paddingBottom: 8 },

  // Project card
  card: {
    borderRadius: 18,
    backgroundColor: '#ffffff0D',
    borderWidth: 1,
    borderColor: '#ffffff14',
    padding: 14,
    gap: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: Fonts.heebo.bold,
    fontSize: 11,
  },
  cardTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 15,
    color: '#ffffff',
    flex: 1,
    textAlign: 'right',
    paddingLeft: 8,
  },
  cardMeta: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: '#ffffffB3',
    textAlign: 'right',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#ffffff14',
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 18,
    color: '#ffffff',
  },
  modalInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff14',
    backgroundColor: '#ffffff0D',
    paddingHorizontal: 14,
    fontFamily: Fonts.heebo.regular,
    fontSize: 14,
    color: '#ffffff',
  },
  modalSubmit: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#c8a455',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 15,
    color: '#0e0d07',
  },
});
