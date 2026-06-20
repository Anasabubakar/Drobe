export const colors = {
  primary: "#E75A66",
  primaryLight: "#F26E80",
  accent: "#FCA99A",
  charcoal: "#333333",
  surface: "#FCFCFC",
  surfaceContainer: "#F5F5F5",
  surfaceContainerLow: "#EEEEEE",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerHighest: "#E8E8E8",
  onSurface: "#1C1B1B",
  onSurfaceVariant: "#49454F",
  onSurfaceMuted: "#79747E",
  outline: "#79747E",
  outlineVariant: "#CAC4D0",
  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
  success: "#1B873F",
  warning: "#B45309",
} as const;

export const CATEGORIES = [
  { value: "top", label: "Tops", icon: "tshirt-crew" },
  { value: "bottom", label: "Bottoms", icon: "human-male" },
  { value: "dress", label: "Dresses", icon: "human-female" },
  { value: "outerwear", label: "Outerwear", icon: "jacket" },
  { value: "shoes", label: "Shoes", icon: "shoe-sneaker" },
  { value: "accessory", label: "Accessories", icon: "sunglasses" },
] as const;

export const OCCASIONS = [
  { value: "casual", label: "Casual" },
  { value: "work", label: "Work" },
  { value: "formal", label: "Formal" },
  { value: "gym", label: "Gym" },
  { value: "date", label: "Date" },
  { value: "other", label: "Other" },
] as const;

export const SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "all-season", label: "All Season" },
] as const;

export const COLOR_SWATCHES = [
  { value: "black", hex: "#1C1B1B" },
  { value: "white", hex: "#FFFFFF" },
  { value: "grey", hex: "#808080" },
  { value: "beige", hex: "#D2B48C" },
  { value: "brown", hex: "#8B4513" },
  { value: "navy", hex: "#000080" },
  { value: "blue", hex: "#1E40AF" },
  { value: "green", hex: "#15803D" },
  { value: "red", hex: "#DC2626" },
  { value: "pink", hex: "#EC4899" },
  { value: "purple", hex: "#7C3AED" },
  { value: "yellow", hex: "#EAB308" },
  { value: "orange", hex: "#EA580C" },
] as const;
