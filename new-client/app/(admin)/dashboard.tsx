import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
// ScrollView is used above
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Fonts } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import {
  projectsApi,
  auth,
  dealsApi,
  activityApi,
  type Project,
  type Deal,
  type User,
  type ActivityFeedItem,
} from '../../services/api';

// ── Design tokens (Merge Exploration B) ──────────────────────
const GOLD = '#c8a455';
const GOLD_DIM = '#c8a45526';
const GOLD_GLOW = '#c8a45559';
const GOLD_AVATAR_RING = '#c8a4554D';
const GLASS = '#ffffff1A';
const BORDER = '#ffffff2E';
const BORDER_LIGHT = '#ffffff14';
const SUCCESS = '#34d399';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'בוקר טוב,';
  if (hour < 17) return 'צהריים טובים,';
  return 'ערב טוב,';
}

export default function AdminDashboard() {
  const { state: authState } = useAuth();
  const { state: projectsState } = useApi(projectsApi.list);
  const { state: usersState } = useApi(auth.listUsers);
  const { state: dealsState } = useApi(dealsApi.list);
  const { state: activityState } = useApi(activityApi.list);

  const projectCount = projectsState.status === 'success' ? projectsState.data.length : 0;
  const users: User[] = usersState.status === 'success' ? usersState.data : [];
  const userCount = users.length;
  const allDeals: Deal[] = dealsState.status === 'success' ? dealsState.data : [];
  const dealCount = allDeals.length;
  const projects: Project[] =
    projectsState.status === 'success' ? projectsState.data.slice(0, 3) : [];

  const pendingUsersCount = useMemo(
    () => users.filter((u) => u.status === 'pending').length,
    [users],
  );

  // Deals requiring attention: pending signatures or active deals with pending transactions
  const attentionDeals = useMemo(() => {
    return allDeals
      .filter((d) => {
        if (d.status !== 'Active') return false;
        const hasPendingSig = d.documents?.some((doc) => doc.signing_status === 'PENDING');
        const hasPendingTx = d.transactions?.some((t) => t.status === 'WAITING_APPROVAL');
        return hasPendingSig || hasPendingTx;
      })
      .slice(0, 3);
  }, [allDeals]);

  const recentActivity: ActivityFeedItem[] =
    activityState.status === 'success' ? activityState.data.slice(0, 4) : [];

  const userName =
    authState.status === 'authenticated'
      ? authState.user.full_name || 'מנהל'
      : 'מנהל';
  const avatarUri =
    authState.status === 'authenticated' ? authState.user.avatar : null;

  return (
    <LinearGradient
      colors={['#221f10', '#0e0d07']}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <ScrollView style={s.scrollView} contentContainerStyle={s.pageContent} showsVerticalScrollIndicator={false}>
          {/* ── Header ── */}
          <View style={s.header}>
            {/* Bell button (left) */}
            <View style={s.bellWrap}>
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <Ionicons name="notifications-outline" size={20} color="#ffffff" />
            </View>

            {/* Greeting + avatar (right) */}
            <View style={s.headerRight}>
              <View style={s.greetWrap}>
                <Text style={s.greetText}>{getGreeting()}</Text>
                <Text style={s.nameText}>{userName}</Text>
              </View>
              <TouchableOpacity style={s.avatarWrap} onPress={() => router.push('/profile')} activeOpacity={0.8}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={s.avatarImage} />
                ) : (
                  <Ionicons name="person" size={22} color="#ffffff80" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── KPI Section ── */}
          <View style={s.kpiSection}>
            <Text style={s.sectionTitle}>סיכום מהיר</Text>
            <View style={s.kpiRow}>
              {/* Active Properties */}
              <View style={s.kpiCard}>
                <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
                <View style={s.kpiInner}>
                  <Text style={s.kpiLabel}>נכסים פעילים</Text>
                  <Text style={s.kpiValue}>{projectCount}</Text>
                  <Text style={[s.kpiDelta, { color: SUCCESS }]}>
                    +{Math.min(projectCount, 9)} החודש
                  </Text>
                </View>
              </View>
              {/* Deals + Pending */}
              <View style={s.kpiCard}>
                <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
                <View style={s.kpiInner}>
                  <Text style={s.kpiLabel}>עסקאות פעילות</Text>
                  <Text style={s.kpiValue}>{dealCount}</Text>
                  <Text style={[s.kpiDelta, { color: pendingUsersCount > 0 ? '#fbbf24' : GOLD }]}>
                    {pendingUsersCount > 0 ? `${pendingUsersCount} לקוחות ממתינים` : `${userCount} לקוחות`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Quick Actions ── */}
          <View style={s.actionsSection}>
            <Text style={s.actionsTitle}>פעולות מהירות</Text>
            {/* Row 1 */}
            <View style={s.actionsRow}>
              <View style={[s.actionBtn, s.actionBtnGold]}>
                <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                  style={s.actionTouchable}
                  onPress={() => router.push('/admin/add-project' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={s.actionLabel}>הוספת נכס</Text>
                  <View style={[s.actionIcon, s.actionIconGold]}>
                    <Ionicons name="home-outline" size={18} color="#0e0d07" />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={s.actionBtn}>
                <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                  style={s.actionTouchable}
                  onPress={() => router.push('/admin/leads' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={s.actionLabel}>לידים</Text>
                  <View style={s.actionIcon}>
                    <Ionicons name="calendar-outline" size={18} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            {/* Row 2 */}
            <View style={s.actionsRow}>
              <View style={[s.actionBtn, { borderColor: BORDER }]}>
                <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                  style={s.actionTouchable}
                  onPress={() => router.push('/admin/users' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={s.actionLabel}>ניהול דיירים</Text>
                  <View style={[s.actionIcon, { backgroundColor: BORDER }]}>
                    <Ionicons name="people-outline" size={18} color="#ffffff" />
                    {pendingUsersCount > 0 && (
                      <View style={s.badge}>
                        <Text style={s.badgeText}>{pendingUsersCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              <View style={s.actionBtn}>
                <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                  style={s.actionTouchable}
                  onPress={() => router.push('/admin/reports' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={s.actionLabel}>דוחות ביצועים</Text>
                  <View style={s.actionIcon}>
                    <Ionicons name="bar-chart-outline" size={18} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Deals Requiring Attention ── */}
          {attentionDeals.length > 0 && (
            <View style={s.attentionSection}>
              <View style={s.recentHeader}>
                <TouchableOpacity onPress={() => router.push('/(admin)/deals' as never)}>
                  <Text style={s.recentLink}>לכל העסקאות</Text>
                </TouchableOpacity>
                <Text style={s.recentTitle}>עסקאות דורשות טיפול</Text>
              </View>
              {attentionDeals.map((deal) => {
                const hasPendingSig = deal.documents?.some((d) => d.signing_status === 'PENDING');
                return (
                  <TouchableOpacity
                    key={deal.id}
                    style={s.attentionCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/admin/deal/${deal.id}` as never)}
                  >
                    <View style={s.attentionIcon}>
                      <Ionicons
                        name={hasPendingSig ? 'create-outline' : 'time-outline'}
                        size={18}
                        color={hasPendingSig ? '#fbbf24' : GOLD}
                      />
                    </View>
                    <View style={s.attentionInfo}>
                      <Text style={s.attentionName} numberOfLines={1}>
                        {deal.apartment?.apartment_specific_address || 'עסקה'} — {deal.user?.full_name || 'לקוח'}
                      </Text>
                      <Text style={s.attentionReason}>
                        {hasPendingSig ? 'חתימה ממתינה לאישור' : 'שלב ממתין לטיפול'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-back" size={16} color="#ffffff80" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ── Activity Feed ── */}
          {recentActivity.length > 0 && (
            <View style={s.activitySection}>
              <Text style={s.recentTitle}>פעילות אחרונה</Text>
              {recentActivity.map((item) => (
                <View key={item.id} style={s.activityRow}>
                  <View style={s.activityDot} />
                  <View style={s.activityContent}>
                    <Text style={s.activityText} numberOfLines={2}>{item.description}</Text>
                    <Text style={s.activityTime}>{item.time_ago}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Recent Properties ── */}
          <View style={s.recentSection}>
            <View style={s.recentHeader}>
              <TouchableOpacity onPress={() => router.push('/(admin)/projects' as never)}>
                <Text style={s.recentLink}>לכל הנכסים</Text>
              </TouchableOpacity>
              <Text style={s.recentTitle}>נכסים אחרונים</Text>
            </View>

            {projectsState.status === 'loading' ? (
              <ActivityIndicator color={GOLD} style={{ marginVertical: 20 }} />
            ) : (
              <View style={s.propertyList}>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={s.propertyCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/project/${project.id}` as never)}
                  >
                    <BlurView intensity={26} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
                    <View style={s.propertyCardInner}>
                      <View style={s.propImgWrap}>
                        {project.project_image_url ? (
                          <Image
                            source={{ uri: project.project_image_url }}
                            style={s.propImg}
                          />
                        ) : (
                          <Ionicons name="business" size={28} color={GOLD} />
                        )}
                      </View>
                      <View style={s.propInfo}>
                        <Text style={s.propTitle} numberOfLines={1}>
                          {project.project_address}
                        </Text>
                        {project.title ? (
                          <Text style={s.propSub} numberOfLines={1}>
                            {project.title}
                          </Text>
                        ) : null}
                        {project.type ? (
                          <Text style={s.propPrice}>{project.type}</Text>
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  pageContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bellWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  greetText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'right',
  },
  nameText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'right',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: GOLD_AVATAR_RING,
    backgroundColor: GLASS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  // ── KPI ──
  kpiSection: { gap: 12 },
  sectionTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'right',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
  },
  kpiInner: {
    padding: 12,
    alignItems: 'flex-end',
    gap: 4,
  },
  kpiLabel: {
    fontFamily: Fonts.heebo.medium,
    fontSize: 12,
    color: '#ffffff80',
    textAlign: 'right',
  },
  kpiValue: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 26,
    color: '#ffffff',
    textAlign: 'right',
  },
  kpiDelta: {
    fontFamily: Fonts.heebo.bold,
    fontSize: 12,
    textAlign: 'right',
  },

  // ── Quick Actions ──
  actionsSection: { gap: 12 },
  actionsTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 17,
    color: GOLD,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  actionBtnGold: {
    backgroundColor: GOLD_DIM,
    borderColor: GOLD_GLOW,
  },
  actionTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  actionLabel: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 14,
    color: '#ffffff',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GLASS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconGold: {
    backgroundColor: GOLD,
  },

  // ── Badge ──
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f87171',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 10,
    color: '#ffffff',
  },

  // ── Attention Section ──
  attentionSection: { gap: 10 },
  attentionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: '#fbbf2440',
    padding: 12,
  },
  attentionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fbbf2420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attentionInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
  attentionName: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'right',
  },
  attentionReason: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 11,
    color: '#fbbf24',
    textAlign: 'right',
  },

  // ── Activity Feed ──
  activitySection: { gap: 10 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 4,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
    marginTop: 5,
  },
  activityContent: { flex: 1, gap: 2 },
  activityText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 13,
    color: '#ffffffB3',
    textAlign: 'right',
  },
  activityTime: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 11,
    color: '#ffffff80',
    textAlign: 'right',
  },

  // ── Recent Properties ──
  recentSection: { gap: 12 },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  recentLink: {
    fontFamily: Fonts.heebo.bold,
    fontSize: 12,
    color: GOLD,
  },
  propertyList: { gap: 12 },
  propertyCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
    height: 90,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
  },
  propertyCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    flex: 1,
  },
  propImgWrap: {
    width: 66,
    height: 66,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: GLASS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propImg: {
    width: '100%',
    height: '100%',
  },
  propInfo: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  propTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'right',
  },
  propSub: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: '#ffffff80',
    textAlign: 'right',
  },
  propPrice: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 14,
    color: GOLD,
    textAlign: 'right',
  },
});
