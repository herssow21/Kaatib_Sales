import React from "react";
import { StyleSheet } from "react-native";
import { Switch, useTheme } from "react-native-paper";
import { useThemeContext } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeContext();
  const theme = useTheme();

  return (
    <Switch
      value={isDarkMode}
      onValueChange={toggleTheme}
      color={theme.colors.primary}
    />
  );
}

const styles = StyleSheet.create({});
