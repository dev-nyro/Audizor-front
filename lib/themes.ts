export type ThemeConfig = {
  name: string
  light: {
    background: string
    foreground: string
    primary: string
    secondary: string
    accent: string
  }
  dark: {
    background: string
    foreground: string
    primary: string
    secondary: string
    accent: string
  }
}

export const themes: ThemeConfig[] = [
  {
    name: "classical",
    light: {
      background: "#FFFFFF",
      foreground: "#242424",
      primary: "#434343",
      secondary: "#656565",
      accent: "#898989",
    },
    dark: {
      background: "#000000",
      foreground: "#FFFFFF",
      primary: "#FFFFFF",
      secondary: "#A1A1AA",
      accent: "#D4D4D8",
    },
  },
  {
    name: "neutral-beige",
    light: {
      background: "#F5F5F0",
      foreground: "#40362D",
      primary: "#8C857B",
      secondary: "#A69F94",
      accent: "#C5BAA7",
    },
    dark: {
      background: "#40362D",
      foreground: "#D9DACC",
      primary: "#C5BAA7",
      secondary: "#D9DACC",
      accent: "#AEACA3",
    },
  },
  {
    name: "summer-wine",
    light: {
      background: "#FFF8E7",
      foreground: "#8B4513",
      primary: "#DCA970",
      secondary: "#D9C179",
      accent: "#D9B54A",
    },
    dark: {
      background: "#2D1810",
      foreground: "#DCA970",
      primary: "#D9C179",
      secondary: "#D9B54A",
      accent: "#DCA970",
    },
  },
  {
    name: "vintage-photo",
    light: {
      background: "#F5F2F0",
      foreground: "#40362D",
      primary: "#736555",
      secondary: "#A6998A",
      accent: "#C5BAA7",
    },
    dark: {
      background: "#40362D",
      foreground: "#F5F2F0",
      primary: "#736555",
      secondary: "#A6998A",
      accent: "#C5BAA7",
    },
  },
  {
    name: "tropical",
    light: {
      background: "#F0FFF4",
      foreground: "#1D8B65",
      primary: "#2C9D90",
      secondary: "#34D399",
      accent: "#6EE7B7",
    },
    dark: {
      background: "#064E3B",
      foreground: "#ECFDF5",
      primary: "#1D8B65",
      secondary: "#2C9D90",
      accent: "#34D399",
    },
  },
]

