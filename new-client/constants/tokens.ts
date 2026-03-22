/**
 * Global Design Tokens
 *
 * Single source of truth for all repeated design values.
 * Use these instead of hard-coding numbers in styles.
 */

// ── Spacing Scale ──────────────────────────────────────────
export const Spacing = {
  /** 2px */  xxs: 2,
  /** 4px */  xs: 4,
  /** 6px */  sm: 6,
  /** 8px */  md: 8,
  /** 10px */ lg: 10,
  /** 12px */ xl: 12,
  /** 14px */ '2xl': 14,
  /** 16px */ '3xl': 16,
  /** 20px */ '4xl': 20,
  /** 24px */ '5xl': 24,
} as const;

// ── Border Radius Scale ────────────────────────────────────
export const Radius = {
  /** 4px  — small tags, dots */
  xs: 4,
  /** 8px  — badges, small chips */
  sm: 8,
  /** 10px — compact cards */
  md: 10,
  /** 12px — standard cards, inputs */
  lg: 12,
  /** 14px — buttons, footers */
  xl: 14,
  /** 16px — cards, stat cards */
  '2xl': 16,
  /** 18px — large cards, headers */
  '3xl': 18,
  /** 20px — sections, chips */
  '4xl': 20,
  /** 24px — hero cards */
  '5xl': 24,
  /** 28px — featured cards */
  '6xl': 28,
  /** 999px — fully round / pill */
  full: 999,
} as const;

// ── Typography Scale ───────────────────────────────────────
export const FontSize = {
  /** 11px — badges, mini labels */
  xs: 11,
  /** 12px — captions, subtitles */
  sm: 12,
  /** 13px — chips, compact text */
  base: 13,
  /** 14px — body text */
  md: 14,
  /** 15px — body large */
  lg: 15,
  /** 16px — section labels */
  xl: 16,
  /** 17px — sub-headers */
  '2xl': 17,
  /** 18px — section headers */
  '3xl': 18,
  /** 20px — small titles */
  '4xl': 20,
  /** 22px — page titles */
  '5xl': 22,
  /** 24px — large titles */
  '6xl': 24,
  /** 26px — stat values */
  '7xl': 26,
  /** 28px — hero titles */
  '8xl': 28,
} as const;

// ── Component Heights ──────────────────────────────────────
export const Height = {
  /** Buttons */
  buttonSm: 36,
  buttonMd: 40,
  buttonLg: 44,
  buttonXl: 48,

  /** Inputs */
  input: 44,
  inputLg: 48,

  /** Progress bars */
  progressSm: 4,
  progressMd: 6,
  progressLg: 8,

  /** Avatar sizes */
  avatarSm: 30,
  avatarMd: 32,
  avatarLg: 40,
  avatarXl: 44,
  avatar2xl: 52,

  /** Cards */
  headerBar: 48,
  listItem: 68,
  cardFooter: 48,
} as const;

// ── Blur Intensities ───────────────────────────────────────
export const Blur = {
  light: 20,
  medium: 30,
  heavy: 40,
} as const;

// ── Shadows ────────────────────────────────────────────────
export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;
