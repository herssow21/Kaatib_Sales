import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { InventoryProvider } from "../contexts/InventoryContext";
import { CategoryProvider } from "../contexts/CategoryContext";
import { AlertProvider } from "../contexts/AlertContext";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
// import AsyncStorage from "@react-native-async-storage/async-storage";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#D32F2F",
    primaryContainer: "#FFCDD2",
    secondary: "#F44336",
    secondaryContainer: "#FFEBEE",
    error: "#B71C1C",
    errorContainer: "#FFCDD2",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceVariant: "#FAFAFA",
  },
};

export default function Layout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <AlertProvider>
        <InventoryProvider>
          <CategoryProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="transaction-form"
                options={{
                  presentation: "modal",
                  title: "New Transaction",
                }}
              />
              <Stack.Screen
                name="category-form"
                options={{
                  presentation: "modal",
                  title: "Category",
                }}
              />
              <Stack.Screen
                name="policymodal"
                options={{
                  presentation: "modal",
                  title: "Terms & Policy",
                }}
              />
              <Stack.Screen
                name="users-management"
                options={{
                  presentation: "modal",
                  title: "User Management",
                }}
              />
              <Stack.Screen
                name="payment-settings"
                options={{
                  presentation: "modal",
                  title: "Payment Settings",
                }}
              />
              <Stack.Screen
                name="profile"
                options={{
                  presentation: "modal",
                  title: "My Profile",
                }}
              />
              <Stack.Screen
                name="expense-form"
                options={{
                  presentation: "modal",
                  title: "New Expense",
                }}
              />
            </Stack>
          </CategoryProvider>
        </InventoryProvider>
      </AlertProvider>
    </PaperProvider>
  );
}
