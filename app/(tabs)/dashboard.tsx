import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function Dashboard() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.onBackground,
    },
    content: {
      padding: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Dashboard</Text>
      </View>
      <View style={styles.content}>
        <Text>Welcome to your dashboard</Text>
      </View>
    </View>
  );
}
