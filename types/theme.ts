export interface CustomColors {
  primary: string;
  secondary: string;
  primaryContainer: string;
  secondaryContainer: string;
  background: string;
  surface: string;
  error: string;
  outline: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  onBackground: string;
  onPrimary: string;
  onSecondary: string;
  onError: string;
  elevation: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
  card: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  modalBackground: string;
  modalBorder: string;
  divider: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
  scrim: string;

  // Extended for consistency and specific use cases
  text: string; 
  textSecondary: string;
  buttonText: string;
  buttonBackground: string;
  buttonBorder: string;
  headerBackground: string;
  headerText: string;
  searchBackground: string;
  searchText: string;
  searchPlaceholder: string;
  listBackground: string;
  listBorder: string;
  listText: string;
  listTextSecondary: string;
  modalText: string; 
  modalTextSecondary: string;
  modalOverlay: string;

  // For react-native-paper component theming if needed beyond basic colors
  accent?: string;
  notification?: string;
  inversePrimary?: string;
  inverseSurface?: string;
  inverseOnSurface?: string;
  primaryDark?: string;
  secondaryDark?: string;

  // MD3 types for typography - good to have if paper components use them
  displayLarge?: object;
  displayMedium?: object;
  displaySmall?: object;
  headlineLarge?: object;
  headlineMedium?: object;
  headlineSmall?: object;
  titleLarge?: object;
  titleMedium?: object;
  titleSmall?: object;
  labelLarge?: object;
  labelMedium?: object;
  labelSmall?: object;
  bodyLarge?: object;
  bodyMedium?: object;
  bodySmall?: object;
} 