export const DarkColors = {
  bgDeep: '#0e0d07',
  bgDark: '#221f10',
  surface: '#2a2616',
  textWhite: '#ffffff',
  textWhite25: '#ffffff66',
  textWhite50: '#ffffff80',
  textWhite70: '#ffffffB3',
  glass20: '#ffffff0D',
  glass60: '#ffffff1A',
  glass100: '#ffffff2E',
  borderLight: '#ffffff14',
  borderMedium: '#ffffff2E',
  shadowDeep: '#0000008C',
  primary: '#c8a455',
  primaryDim: '#c8a45526',
  primaryGlow: '#c8a45559',
  borderGold: '#c8a4554D',
  success: '#34d399',
  error: '#ef4444',
} as const;

export const LightColors = {
  bgDeep: '#f6f2e8',
  bgDark: '#ede8db',
  surface: '#ffffff',
  textWhite: '#1a1709',
  textWhite25: '#1a170966',
  textWhite50: '#1a170980',
  textWhite70: '#1a1709B3',
  glass20: '#00000010',
  glass60: '#0000001A',
  glass100: '#00000030',
  borderLight: '#1f1b1022',
  borderMedium: '#1f1b1044',
  shadowDeep: '#00000026',
  primary: '#c8a455',
  primaryDim: '#c8a45526',
  primaryGlow: '#c8a45559',
  borderGold: '#c8a4554D',
  success: '#34d399',
  error: '#ef4444',
} as const;

export type ThemeColors = {
  [K in keyof typeof DarkColors]: string;
};

// Legacy alias for backward compatibility during migration
export const Colors = DarkColors;

export const Fonts = {
  manrope: {
    regular: 'Manrope_400Regular',
    semiBold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    extraBold: 'Manrope_800ExtraBold',
  },
  spaceGrotesk: {
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    bold: 'SpaceGrotesk_700Bold',
  },
  heebo: {
    regular: 'Heebo_400Regular',
    medium: 'Heebo_500Medium',
    bold: 'Heebo_700Bold',
  },
} as const;
