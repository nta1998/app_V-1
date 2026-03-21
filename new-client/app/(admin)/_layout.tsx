import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function AdminLayout() {
  const { state } = useAuth();
  const { colors, mode } = useTheme();

  useEffect(() => {
    if (state.status === 'authenticated' && !state.user.is_staff) {
      router.replace('/(tabs)/' as never);
    }
  }, [state]);

  if (state.status !== 'authenticated' || !state.user.is_staff) {
    return null;
  }

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      sidebarAdaptable
      tintColor={colors.primary}
      blurEffect={mode === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterial'}
      shadowColor="transparent"
    >
      {/* Only the 3 main visible tabs */}
      <NativeTabs.Trigger name="deals">
        <NativeTabs.Trigger.Icon sf={{ default: 'doc.text', selected: 'doc.text.fill' }} md="receipt_long" />
        <NativeTabs.Trigger.Label>עסקאות</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="projects">
        <NativeTabs.Trigger.Icon sf={{ default: 'building.2', selected: 'building.2.fill' }} md="business" />
        <NativeTabs.Trigger.Label>נכסים</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="dashboard">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>בית</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
