import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Heebo_400Regular,
  Heebo_500Medium,
  Heebo_700Bold,
} from '@expo-google-fonts/heebo';
import { View, ActivityIndicator, I18nManager } from 'react-native';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import LoginScreen from './login';
import PendingScreen from './pending';

// Force RTL globally for Hebrew UI — must run before first render
I18nManager.forceRTL(true);

function RootLayoutInner() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_700Bold,
  });

  const { state: authState } = useAuth();
  const { mode, colors } = useTheme();

  // Redirect staff users to admin dashboard after login
  useEffect(() => {
    if (authState.status === 'authenticated' && authState.user.is_staff) {
      router.replace('/(admin)/dashboard' as never);
    }
  }, [authState]);

  // Show spinner while fonts load or auth state is being restored from storage
  if (!fontsLoaded || authState.status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgDeep, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Not authenticated — show login
  if (authState.status === 'unauthenticated') {
    return (
      <>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <LoginScreen />
      </>
    );
  }

  // Authenticated but pending approval — show pending screen
  if (authState.user.status === 'pending') {
    return (
      <>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <PendingScreen />
      </>
    );
  }

  // Authenticated but blocked — show pending screen with different state
  // (the pending screen's checkStatus will detect blocked and logout can handle it)
  if (authState.user.status === 'blocked') {
    return (
      <>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <PendingScreen />
      </>
    );
  }

  // Authenticated + approved — show the full app
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(user)" />
        <Stack.Screen
          name="(admin)"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="admin/users"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="admin/leads"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="admin/reports"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="admin/add-project"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="admin/deal/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="admin/create-deal"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
