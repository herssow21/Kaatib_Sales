import React, { createContext, useContext, useState, useEffect } from "react";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
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
      level0: "transparent",
      level1: "#ffffff",
      level2: "#f8f9fa",
      level3: "#f1f5f9",
      level4: "#e9ecef",
      level5: "#e2e8f0",
    },
    // Additional colors for better dark mode support
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
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
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
    onSecondary: "#ffffff",
    onError: "#ffffff",
    elevation: {
      level0: "transparent",
      level1: "#1e293b",
      level2: "#0f172a",
      level3: "#0f172a",
      level4: "#0f172a",
      level5: "#0f172a",
    },
    // Additional colors for better dark mode support
    card: "#1e293b",
    cardBorder: "#334155",
    inputBackground: "#1e293b",
    inputBorder: "#334155",
    modalBackground: "#1e293b",
    modalBorder: "#334155",
    divider: "#334155",
    disabled: "#64748b",
    placeholder: "#94a3b8",
    backdrop: "rgba(0, 0, 0, 0.7)",
    // Additional colors for better contrast
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
    listBackground: "#1e293b",
    listBorder: "#334155",
    listText: "#ffffff",
    listTextSecondary: "#94a3b8",
    modalText: "#ffffff",
    modalTextSecondary: "#94a3b8",
    modalBorder: "#334155",
    modalBackground: "#1e293b",
    modalOverlay: "rgba(0, 0, 0, 0.7)",
  },
};

type ThemeContextType = {
  theme: typeof lightTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      } else {
        // If no theme is saved, use system preference
        const systemTheme = await AsyncStorage.getItem("systemTheme");
        if (systemTheme) {
          setIsDarkMode(systemTheme === "dark");
        }
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newThemeValue = !isDarkMode;
      setIsDarkMode(newThemeValue);
      await AsyncStorage.setItem("theme", newThemeValue ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
