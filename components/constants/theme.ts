export const Colors = {
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  primary: "#1A1A1A",
  accent: "#F5A623",
  accentLight: "#FFF8EC",
  accentVeryLight: "#FFF3DC",
  muted: "#9B9B9B",
  success: "#4CAF84",
  warning: "#E8872A",
  danger: "#D94F4F",
  thinking: "#F0EDE8",
  border: "#E8E3DB",
  divider: "#EFEFEF",
  white: "#FFFFFF",
  black: "#1A1A1A",
  overlay: "rgba(0,0,0,0.5)",
} as const;

export const Typography = {
  heading: { fontSize: 20, fontWeight: "600" as const, lineHeight: 28, color: Colors.primary },
  headingLg: { fontSize: 24, fontWeight: "600" as const, lineHeight: 32, color: Colors.primary },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22, color: Colors.primary },
  bodySm: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20, color: Colors.primary },
  label: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18, color: Colors.primary },
  caption: { fontSize: 11, fontWeight: "400" as const, lineHeight: 15, color: Colors.muted },
  price: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24, color: Colors.primary },
  thinking: {
    fontSize: 12,
    fontWeight: "400" as const,
    fontStyle: "italic" as const,
    lineHeight: 18,
    color: "#555555",
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screen: 16,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  strong: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
