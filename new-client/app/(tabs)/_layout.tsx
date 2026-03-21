import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { dealsApi } from '../../services/api';

export default function TabLayout() {
  const { colors, mode } = useTheme();

  // Hide "deal" tab when user has no active deal
  const { state: dealState } = useApi(dealsApi.myDeal);
  const hasActiveDeal = dealState.status === 'success' && dealState.data != null;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      sidebarAdaptable
      tintColor={colors.primary}
      blurEffect={mode === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterial'}
      shadowColor="transparent"
    >
      {/* ── Visible tabs (RTL order: rightmost = first) ── */}

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>בית</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="deal" hidden={!hasActiveDeal}>
        <NativeTabs.Trigger.Icon sf={{ default: 'doc.text', selected: 'doc.text.fill' }} md="description" />
        <NativeTabs.Trigger.Label>העסקה שלי</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="notifications" hidden>
        <NativeTabs.Trigger.Icon sf={{ default: 'bell', selected: 'bell.fill' }} md="notifications" />
        <NativeTabs.Trigger.Label>התראות</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
        <NativeTabs.Trigger.Label>פרופיל</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* ── Hidden tabs (still navigable via router.push) ── */}

      <NativeTabs.Trigger name="about" hidden>
        <NativeTabs.Trigger.Label>אודות</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="projects">
        <NativeTabs.Trigger.Icon sf={{ default: 'building.2', selected: 'building.2.fill' }} md="apartment" />
        <NativeTabs.Trigger.Label>פרויקטים</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon sf={{ default: 'magnifyingglass', selected: 'magnifyingglass' }} md="search" />
        <NativeTabs.Trigger.Label>חיפוש</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="transactions" hidden>
        <NativeTabs.Trigger.Label>עסקאות</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
