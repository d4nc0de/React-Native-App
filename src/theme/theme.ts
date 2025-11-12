import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

const baseLight = MD3LightTheme;
const baseDark  = MD3DarkTheme;

export const lightTheme = {
  ...baseLight,
  roundness: 20,
  colors: {
    ...baseLight.colors,
    background: "#F6F7F9",  // fondo
    surface: "#FFFFFF",     // card
    primary: "#111111",     // negro para botón primario
    onSurface: "#1F1F1F",
    onSurfaceVariant: "#8A8F98",
    outline: "#E6E8EC",
    // anulamos morados de MD3
    secondary: "#111111",
    secondaryContainer: "#2F2F2F",
    inverseOnSurface: "#FFFFFF",   // lo usaré como "pill" blanco
  },
};

export const darkTheme = {
  ...baseDark,
  roundness: 20,
  colors: {
    ...baseDark.colors,
    background: "#0F1113",
    surface: "#14161A",
    primary: "#FFFFFF",
    onSurface: "#EDEFF2",
    onSurfaceVariant: "#9AA0A6",
    outline: "#2A2D33",
    secondary: "#FFFFFF",
    secondaryContainer: "#2A2A2A",
    inverseOnSurface: "#1B1D21",
  },
};
