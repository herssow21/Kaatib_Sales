import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, List, useTheme } from "react-native-paper";

export default function UsersManagement() {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          User Management
        </Text>
      </View>
      <List.Section>
        <List.Item title="No users yet" description="Users will appear here" />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
  },
  headerText: {
    fontWeight: "bold",
  },
});
