import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

/** Base URL for all API requests (set via API_URL env var or defaults to local dev server). */
export const API_URL: string = extra.apiUrl ?? 'http://192.168.1.224:8000/api';

/** Phone number for "Call now" and WhatsApp CTAs (set via CONTACT_PHONE env var). */
export const CONTACT_PHONE: string = extra.contactPhone ?? '+972501234567';
