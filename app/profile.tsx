import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";

export default function Profile() {
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
      fontWeight: "bold",
    },
    content: {
      padding: 16,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          My Profile
        </Text>
      </View>
      <View style={styles.content}>{/* Add profile content here */}</View>
    </ScrollView>
  );
}
