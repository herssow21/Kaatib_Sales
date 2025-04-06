import React, { createContext, useContext, useState, useMemo } from "react";
import { PaperProvider, useTheme as usePaperTheme } from "react-native-paper";
import { lightTheme, darkTheme, CustomTheme } from "./theme";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => {
  const paperTheme = usePaperTheme() as CustomTheme;
  const { theme, toggleTheme } = useContext(ThemeContext);
  return {
    theme,
    toggleTheme,
    colors: paperTheme.colors,
    spacing: paperTheme.spacing,
    borderRadius: paperTheme.borderRadius,
    typography: paperTheme.typography,
    globalStyles: paperTheme.globalStyles,
  };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeType>("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const paperTheme = useMemo(
    () => (theme === "light" ? lightTheme : darkTheme),
    [theme]
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};
