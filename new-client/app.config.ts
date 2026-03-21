import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'אפליקציה לאבא',
  slug: 'testa',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0e0d07',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.anonymous.new-client',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#0e0d07',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  scheme: 'new-client',
  plugins: ['expo-router', 'expo-font'],
  extra: {
    router: {},
    eas: {
      projectId: 'c7dfd4f2-3ede-4fb5-b502-5cb54ef7f37e',
    },
    apiUrl: process.env.API_URL || 'http://192.168.1.224:8000/api',
    contactPhone: process.env.CONTACT_PHONE || '+972501234567',
  },
  owner: 'nta19981510',
});
