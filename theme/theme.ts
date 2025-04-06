import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#2196F3',
  secondary: '#03DAC6',
  error: '#B00020',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  disabled: '#9E9E9E',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#FF0000',
  // Custom colors
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
  border: '#E0E0E0',
  card: '#F5F5F5',
  input: '#F8F9FA',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    margin: spacing.sm,
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  button: {
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.body2,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  section: {
    marginVertical: spacing.md,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
};

export interface CustomTheme {
  colors: typeof colors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  globalStyles: typeof globalStyles;
}

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
  spacing,
  borderRadius,
  typography,
  globalStyles,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...colors,
  },
  spacing,
  borderRadius,
  typography,
  globalStyles,
}; 