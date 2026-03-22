import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { makeStyles } from './styles/dashboard.styles';
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
import {
  KPICard,
  QuickActionButton,
  DealAttentionCard,
  AdminPropertyCard,
} from '../../components/Admin';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'בוקר טוב,';
  if (hour < 17) return 'צהריים טובים,';
  return 'ערב טוב,';
}

export default function AdminDashboard() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
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
              <Ionicons name="notifications-outline" size={20} color={colors.textWhite} />
            </View>

            {/* Greeting + avatar (right) */}
            <View style={s.headerRight}>
              <View style={s.greetWrap}>
                <Text style={s.greetText}>{getGreeting()}</Text>
                <Text style={s.nameText}>{userName}</Text>
              </View>
              <TouchableOpacity style={s.avatarWrap} onPress={() => router.push('/profile' as never)} activeOpacity={0.8}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={s.avatarImage} />
                ) : (
                  <Ionicons name="person" size={22} color={colors.textWhite50} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── KPI Section ── */}
          <View style={s.kpiSection}>
            <Text style={s.sectionTitle}>סיכום מהיר</Text>
            <View style={s.kpiRow}>
              <KPICard
                label="נכסים פעילים"
                value={projectCount}
                delta={`+${Math.min(projectCount, 9)} החודש`}
                deltaColor={colors.success}
              />
              <KPICard
                label="עסקאות פעילות"
                value={dealCount}
                delta={pendingUsersCount > 0 ? `${pendingUsersCount} לקוחות ממתינים` : `${userCount} לקוחות`}
                deltaColor={pendingUsersCount > 0 ? '#fbbf24' : colors.primary}
              />
            </View>
          </View>

          {/* ── Quick Actions ── */}
          <View style={s.actionsSection}>
            <Text style={s.actionsTitle}>פעולות מהירות</Text>
            {/* Row 1 */}
            <View style={s.actionsRow}>
              <QuickActionButton
                label="הוספת נכס"
                iconName="home-outline"
                onPress={() => router.push('/admin/add-project' as never)}
                variant="gold"
                blurIntensity={28}
              />
              <QuickActionButton
                label="לידים"
                iconName="calendar-outline"
                onPress={() => router.push('/admin/leads' as never)}
              />
            </View>
            {/* Row 2 */}
            <View style={s.actionsRow}>
              <QuickActionButton
                label="ניהול דיירים"
                iconName="people-outline"
                onPress={() => router.push('/admin/users' as never)}
                blurIntensity={24}
                borderColor={colors.borderMedium}
                iconBgColor={colors.borderMedium}
                badge={pendingUsersCount}
              />
              <QuickActionButton
                label="דוחות ביצועים"
                iconName="bar-chart-outline"
                onPress={() => router.push('/admin/reports' as never)}
              />
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
                  <DealAttentionCard
                    key={deal.id}
                    name={`${deal.apartment?.apartment_specific_address || 'עסקה'} — ${deal.user?.full_name || 'לקוח'}`}
                    reason={hasPendingSig ? 'חתימה ממתינה לאישור' : 'שלב ממתין לטיפול'}
                    iconName={hasPendingSig ? 'create-outline' : 'time-outline'}
                    iconColor={hasPendingSig ? '#fbbf24' : colors.primary}
                    onPress={() => router.push(`/admin/deal/${deal.id}` as never)}
                  />
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
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <View style={s.propertyList}>
                {projects.map((project) => (
                  <AdminPropertyCard
                    key={project.id}
                    imageUrl={project.project_image_url}
                    address={project.project_address}
                    title={project.title}
                    type={project.type}
                    onPress={() => router.push(`/project/${project.id}` as never)}
                  />
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

