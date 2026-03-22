import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="deal"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="notifications"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="transactions"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="profile"
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="project/[id]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="project-progress/[id]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="apartment/[id]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="saved-properties"
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="sign-document"
        options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
      />
    </Stack>
  );
}
