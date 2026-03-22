import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '../../../hooks/useTheme';

export default function TabLayout() {
  const { colors, mode } = useTheme();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      sidebarAdaptable
      tintColor={colors.primary}
      blurEffect={mode === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterial'}
      shadowColor="transparent"
    >
      <NativeTabs.Trigger name="about">
        <NativeTabs.Trigger.Icon sf={{ default: 'info.circle', selected: 'info.circle.fill' }} md="info" />
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

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>בית</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
