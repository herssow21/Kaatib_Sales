import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { InventoryProvider } from "../contexts/InventoryContext";
import { CategoryProvider } from "../contexts/CategoryContext";
import { AlertProvider } from "../contexts/AlertContext";
import { PaperProvider } from "react-native-paper";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { CustomerLookupProvider } from "../contexts/CustomerLookupContext";
import { PaymentMethodsProvider } from "../contexts/PaymentMethodsContext";
import { ThemeProvider, useThemeContext } from "../contexts/ThemeContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add your fonts here if needed
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useThemeContext();

  return (
    <PaperProvider theme={theme}>
      <AlertProvider>
        <InventoryProvider>
          <CategoryProvider>
            <CustomerLookupProvider>
              <PaymentMethodsProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="transaction-form"
                    options={{
                      presentation: "modal",
                      headerShown: true,
                      title: "New Transaction",
                    }}
                  />
                  <Stack.Screen
                    name="category-form"
                    options={{
                      presentation: "modal",
                      headerShown: true,
                      title: "Category",
                    }}
                  />
                  <Stack.Screen
                    name="policymodal"
                    options={{
                      presentation: "modal",
                      headerShown: true,
                      title: "Terms & Policy",
                    }}
                  />
                  <Stack.Screen
                    name="payment-settings"
                    options={{
                      presentation: "modal",
                      headerShown: true,
                      title: "Payment Settings",
                    }}
                  />
                  <Stack.Screen
                    name="profile"
                    options={{
                      presentation: "modal",
                      headerShown: true,
                      title: "My Profile",
                    }}
                  />
                  <Stack.Screen
                    name="expense-form"
                    options={{
                      presentation: "modal",
                      headerShown: true,
                      title: "New Expense",
                    }}
                  />
                  <Stack.Screen
                    name="users-management"
                    options={{
                      presentation: "modal",
                      headerShown: false,
                      title: "User Management",
                    }}
                  />
                </Stack>
              </PaymentMethodsProvider>
            </CustomerLookupProvider>
          </CategoryProvider>
        </InventoryProvider>
      </AlertProvider>
    </PaperProvider>
  );
}
