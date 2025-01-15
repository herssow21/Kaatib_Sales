import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider, useThemeContext } from "../contexts/ThemeContext";
import { InventoryProvider } from "../contexts/InventoryContext";
import { CategoryProvider } from "../contexts/CategoryContext";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
// import AsyncStorage from "@react-native-async-storage/async-storage";

function RootLayoutNav() {
  const { theme } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
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
  );
}

export default function RootLayout() {
  const { theme } = useThemeContext();
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
    <ThemeProvider>
      <InventoryProvider>
        <CategoryProvider>
          {/* <NavigationContainer> */}
          <PaperProvider theme={theme}>
            <RootLayoutNav />
          </PaperProvider>
          {/* </NavigationContainer> */}
        </CategoryProvider>
      </InventoryProvider>
    </ThemeProvider>
  );
}
