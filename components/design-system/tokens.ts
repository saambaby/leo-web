/**
 * Typed design token mirror for programmatic use (charts, inline styles, exports).
 * CSS source of truth: ./tokens.css
 * Design reference: leo-workstation/.pineapple/design/leo-workstation.html
 */

export const leoColors = {
  black900: "#0A0A0B",
  black800: "#111114",
  black700: "#18181D",
  black600: "#1E1E25",
  black500: "#26262F",
  black400: "#32323E",
  black300: "#4A4A5A",
  black200: "#6E6E82",
  black100: "#9E9EB5",
  black50: "#C8C8D8",

  webCanvas: "#F4F5F7",
  webSurface: "#FFFFFF",
  webBorder: "#E4E6EB",
  webMuted: "#7C8494",
  webText: "#14161A",
  webText2: "#454C5C",

  signalLive: "#22C55E",
  signalWarn: "#F59E0B",
  signalError: "#EF4444",
  signalInfo: "#94A3B8",
  signalWhite: "#F8F8FA",

  accent: "#E8E8F0",
  accentDim: "rgba(232, 232, 240, 0.12)",
} as const;

export const leoRadii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xl2: 24,
} as const;

export const leoFonts = {
  display: "var(--font-display)",
  body: "var(--font-body)",
  mono: "var(--font-mono)",
} as const;

export type LeoColor = (typeof leoColors)[keyof typeof leoColors];
export type LeoRadius = (typeof leoRadii)[keyof typeof leoRadii];
