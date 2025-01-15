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
