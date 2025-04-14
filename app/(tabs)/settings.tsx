import { StyleSheet, View, ScrollView } from "react-native";
import { Text, List, Switch, useTheme, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import ThemeToggle from "../../components/ThemeToggle";
import UserManagement from "../../components/UserManagement";

export default function Settings() {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      paddingBottom: 8,
    },
    headerText: {
      fontWeight: "bold",
    },
  });

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.replace("/");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Settings
        </Text>
      </View>

      {/* Profile Section */}
      <List.Section>
        <List.Subheader>Profile</List.Subheader>
        <List.Item
          title="My Profile"
          left={(props) => (
            <MaterialIcons
              name="person"
              size={24}
              color={theme.colors.primary}
            />
          )}
          right={(props) => (
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/profile")}
          style={{
            backgroundColor: theme.colors.surface,
            marginBottom: 2,
            borderRadius: 8,
          }}
          titleStyle={{
            color: theme.colors.onSurface,
            fontWeight: "500",
          }}
        />
      </List.Section>

      <Divider />

      {/* User Management Section */}
      <List.Section>
        <List.Subheader>User Management</List.Subheader>
        <List.Item
          title="Manage Users"
          onPress={() => router.push("/users-management" as any)}
          style={{
            backgroundColor: theme.colors.surface,
            marginBottom: 2,
            borderRadius: 8,
          }}
          right={(props) => (
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.colors.outline}
            />
          )}
        />
      </List.Section>

      <Divider />

      {/* Payment Settings */}
      <List.Section>
        <List.Subheader>Payment Settings</List.Subheader>
        <List.Item
          title="Payment Methods"
          description="Configure payment options"
          left={(props) => (
            <MaterialIcons
              name="payment"
              size={24}
              color={theme.colors.primary}
            />
          )}
          right={(props) => (
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/payment-settings")}
          style={{
            backgroundColor: theme.colors.surface,
            marginBottom: 2,
            borderRadius: 8,
          }}
          titleStyle={{
            color: theme.colors.onSurface,
            fontWeight: "500",
          }}
        />
      </List.Section>

      <Divider />

      {/* App Settings */}
      <List.Section>
        <List.Subheader>App Settings</List.Subheader>
        <List.Item
          title="Notifications"
          left={(props) => (
            <MaterialIcons
              name="notifications"
              size={24}
              color={theme.colors.primary}
            />
          )}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color={theme.colors.primary}
            />
          )}
          style={{
            backgroundColor: theme.colors.surface,
            marginBottom: 2,
            borderRadius: 8,
          }}
          titleStyle={{
            color: theme.colors.onSurface,
            fontWeight: "500",
          }}
        />
        <List.Item
          title="Dark Mode"
          left={(props) => (
            <MaterialIcons
              name="dark-mode"
              size={24}
              color={theme.colors.primary}
            />
          )}
          right={() => <ThemeToggle />}
          style={{
            backgroundColor: theme.colors.surface,
            marginBottom: 2,
            borderRadius: 8,
          }}
          titleStyle={{
            color: theme.colors.onSurface,
            fontWeight: "500",
          }}
        />
      </List.Section>

      <Divider />

      {/* Account Actions */}
      <List.Section>
        <List.Item
          title="Logout"
          left={(props) => (
            <MaterialIcons name="logout" size={24} color={theme.colors.error} />
          )}
          onPress={handleLogout}
          style={{
            backgroundColor: theme.colors.surface,
            marginBottom: 2,
            borderRadius: 8,
          }}
          titleStyle={{
            color: theme.colors.error,
            fontWeight: "500",
          }}
        />
      </List.Section>
    </ScrollView>
  );
}
