import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../contexts/ThemeContext";

export default function TabsLayout() {
  const { theme } = useThemeContext();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          elevation: 0,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="shopping-cart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
