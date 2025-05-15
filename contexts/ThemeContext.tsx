import React, { createContext, useContext, useState, useEffect } from "react";
import {
  MD3LightTheme,
  MD3DarkTheme,
  useTheme as usePaperTheme,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomColors } from "../types/theme";

const baseLightThemeColors = MD3LightTheme.colors;
const baseDarkThemeColors = MD3DarkTheme.colors;

const lightThemeColors: CustomColors = {
  ...baseLightThemeColors,
  primary: "#e03f3e",
  secondary: "#dc2626",
  primaryContainer: "rgba(224, 63, 62, 0.1)",
  secondaryContainer: "rgba(220, 38, 38, 0.1)",
  background: "#f8f9fa",
  surface: "#ffffff",
  error: "#dc2626",
  outline: "rgba(0, 0, 0, 0.2)",
  surfaceVariant: "#f1f5f9",
  onSurface: "#000000",
  onSurfaceVariant: "#666666",
  onBackground: "#000000",
  onPrimary: "#ffffff",
  onSecondary: "#ffffff",
  onError: "#ffffff",
  elevation: {
    ...MD3LightTheme.elevation,
    level0: "transparent",
    level1: "#ffffff",
    level2: "#f8f9fa",
    level3: "#f1f5f9",
    level4: "#e9ecef",
    level5: "#e2e8f0",
  },
  card: "#ffffff",
  cardBorder: "#e2e8f0",
  inputBackground: "#ffffff",
  inputBorder: "#e2e8f0",
  modalBackground: "#ffffff",
  modalBorder: "#e2e8f0",
  divider: "#e2e8f0",
  disabled: "#94a3b8",
  placeholder: "#94a3b8",
  backdrop: "rgba(0, 0, 0, 0.5)",
  scrim: baseLightThemeColors.scrim || "rgba(0, 0, 0, 0.5)",
  text: "#000000",
  textSecondary: "#666666",
  buttonText: "#ffffff",
  buttonBackground: "#e03f3e",
  buttonBorder: "rgba(0, 0, 0, 0.2)",
  headerBackground: "#ffffff",
  headerText: "#000000",
  searchBackground: "#f1f5f9",
  searchText: "#000000",
  searchPlaceholder: "#94a3b8",
  listBackground: "#f8f9fa",
  listBorder: "#e2e8f0",
  listText: "#000000",
  listTextSecondary: "#666666",
  modalText: "#000000",
  modalTextSecondary: "#666666",
  modalOverlay: "rgba(0, 0, 0, 0.5)",
  accent: baseLightThemeColors.accent || "#e03f3e",
  notification: baseLightThemeColors.notification || "#f87171",
  inversePrimary: baseLightThemeColors.inversePrimary || "#ffffff",
  inverseSurface: baseLightThemeColors.inverseSurface || "#333333",
  inverseOnSurface: baseLightThemeColors.inverseOnSurface || "#ffffff",
  primaryDark: "#b02726",
  secondaryDark: "#a01b1b",
};

const darkThemeColors: CustomColors = {
  ...baseDarkThemeColors,
  primary: "#e03f3e",
  secondary: "#f87171",
  primaryContainer: "rgba(224, 63, 62, 0.15)",
  secondaryContainer: "rgba(248, 113, 113, 0.15)",
  background: "#0f172a",
  surface: "#1e293b",
  error: "#f87171",
  outline: "rgba(255, 255, 255, 0.2)",
  surfaceVariant: "#1e293b",
  onSurface: "#ffffff",
  onSurfaceVariant: "#94a3b8",
  onBackground: "#ffffff",
  onPrimary: "#ffffff",
  onSecondary: "#000000",
  onError: "#000000",
  elevation: {
    ...MD3DarkTheme.elevation,
    level0: "transparent",
    level1: "#1e293b",
    level2: "#2a3a52",
    level3: "#172233",
    level4: "#121c2b",
    level5: "#0e1624",
  },
  card: "#1e293b",
  cardBorder: "#334155",
  inputBackground: "#1e293b",
  inputBorder: "#334155",
  modalBackground: "#172233",
  modalBorder: "#334155",
  divider: "#334155",
  disabled: "#64748b",
  placeholder: "#94a3b8",
  backdrop: "rgba(0, 0, 0, 0.7)",
  scrim: baseDarkThemeColors.scrim || "rgba(0, 0, 0, 0.7)",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  buttonText: "#ffffff",
  buttonBackground: "#e03f3e",
  buttonBorder: "#334155",
  headerBackground: "#1e293b",
  headerText: "#ffffff",
  searchBackground: "#1e293b",
  searchText: "#ffffff",
  searchPlaceholder: "#94a3b8",
  listBackground: "#0f172a",
  listBorder: "#334155",
  listText: "#ffffff",
  listTextSecondary: "#94a3b8",
  modalText: "#ffffff",
  modalTextSecondary: "#94a3b8",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  accent: baseDarkThemeColors.accent || "#f87171",
  notification: baseDarkThemeColors.notification || "#f87171",
  inversePrimary: baseDarkThemeColors.inversePrimary || "#000000",
  inverseSurface: baseDarkThemeColors.inverseSurface || "#dddddd",
  inverseOnSurface: baseDarkThemeColors.inverseOnSurface || "#000000",
  primaryDark: "#b02726",
  secondaryDark: "#a01b1b",
};

const lightTheme = {
  ...MD3LightTheme,
  colors: lightThemeColors,
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: darkThemeColors,
};

export interface ThemeContextType {
  theme: typeof lightTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {
    console.warn("toggleTheme called on default ThemeContext");
  },
});

export const useThemeContext = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        } else {
          setIsDarkMode(false);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
        setIsDarkMode(false);
      }
    };
    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const newThemeValue = !isDarkMode;
      setIsDarkMode(newThemeValue);
      await AsyncStorage.setItem("theme", newThemeValue ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const currentAppliedTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ theme: currentAppliedTheme, isDarkMode, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
